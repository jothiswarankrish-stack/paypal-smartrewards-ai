from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from paypal_service import paypal_service
from recommendation.attraction import CustomerAttractionIntelligence

router = APIRouter(prefix="/api/paypal", tags=["PayPal Sandbox Payment Integration"])

@router.post("/create-order", response_model=schemas.PayPalCreateOrderResponse)
async def create_paypal_order(
    req: schemas.PayPalCreateOrderRequest,
    customer_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Step 1: Backend validates coupon and creates PayPal Sandbox order via Orders API v2.
    """
    user = db.query(models.User).filter(models.User.id == customer_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")

    coupon = None
    discount_amount = Decimal("0.00")
    original_amount = Decimal(str(req.original_amount))
    final_amount = original_amount

    if req.coupon_id:
        coupon = db.query(models.Coupon).filter(models.Coupon.id == req.coupon_id).first()
        if not coupon or not coupon.is_active:
            raise HTTPException(status_code=400, detail="Coupon is invalid or inactive")

        if coupon.expiry_date < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Coupon has expired")

        if coupon.times_used >= coupon.usage_limit:
            raise HTTPException(status_code=400, detail="Coupon usage limit reached")

        if float(original_amount) < coupon.min_order_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum purchase of ₹{coupon.min_order_amount} required"
            )

        # Calculate exact discount
        pricing = paypal_service.calculate_discount(
            original_amount=float(original_amount),
            discount_type=coupon.discount_type,
            discount_value=coupon.discount_value,
            max_discount=coupon.max_discount
        )
        discount_amount = pricing["discount_amount"]
        final_amount = pricing["final_amount"]

    # Call PayPal Sandbox API
    description = f"SmartRewards Order - {coupon.title if coupon else 'Standard Checkout'}"
    paypal_resp = await paypal_service.create_order(
        final_amount=final_amount,
        currency=req.currency,
        description=description,
        custom_id=f"cust-{customer_id}"
    )

    paypal_order_id = paypal_resp.get("id")
    if not paypal_order_id:
        raise HTTPException(status_code=500, detail="Failed to receive PayPal Order ID")

    # Record order in database
    db_order = models.PayPalOrder(
        paypal_order_id=paypal_order_id,
        customer_id=customer_id,
        coupon_id=coupon.id if coupon else None,
        original_amount=float(original_amount),
        discount_amount=float(discount_amount),
        final_amount=float(final_amount),
        currency=req.currency,
        status="CREATED"
    )
    db.add(db_order)
    db.commit()

    # Log checkout_init event
    if coupon:
        attraction = CustomerAttractionIntelligence(db)
        attraction.log_event(
            customer_id=customer_id,
            coupon_id=coupon.id,
            event_type="checkout_init",
            metadata={"order_id": paypal_order_id, "amount": float(final_amount)}
        )

    # Find approve link
    approve_url = None
    for link in paypal_resp.get("links", []):
        if link.get("rel") == "approve":
            approve_url = link.get("href")
            break

    return schemas.PayPalCreateOrderResponse(
        order_id=paypal_order_id,
        status="CREATED",
        original_amount=float(original_amount),
        discount_amount=float(discount_amount),
        final_amount=float(final_amount),
        currency=req.currency,
        approve_url=approve_url,
        coupon_code=coupon.code if coupon else None
    )

@router.post("/capture-order", response_model=schemas.PayPalCaptureOrderResponse)
async def capture_paypal_order(
    req: schemas.PayPalCaptureOrderRequest,
    db: Session = Depends(get_db)
):
    """
    Step 2: Server-side capture of approved PayPal Sandbox order.
    Verifies payment capture, updates order status, records coupon redemption,
    and updates customer savings atomically.
    """
    order = db.query(models.PayPalOrder).filter(models.PayPalOrder.paypal_order_id == req.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="PayPal order record not found in system")

    # Idempotency check: if already completed, return existing verified confirmation
    if order.status == "COMPLETED":
        return schemas.PayPalCaptureOrderResponse(
            success=True,
            order_id=order.paypal_order_id,
            capture_id=order.capture_id,
            status="COMPLETED",
            final_amount=order.final_amount,
            discount_saved=order.discount_amount,
            currency=order.currency,
            payer_email=order.payer_email,
            message="Payment was already successfully captured and verified."
        )

    # Execute PayPal Capture API
    capture_resp = await paypal_service.capture_order(order.paypal_order_id)
    status_returned = capture_resp.get("status")

    if status_returned != "COMPLETED":
        order.status = status_returned or "FAILED"
        db.commit()
        raise HTTPException(
            status_code=400,
            detail=f"Payment capture was not completed by PayPal. Status: {status_returned}"
        )

    # Extract capture details
    capture_id = None
    try:
        capture_id = capture_resp["purchase_units"][0]["payments"]["captures"][0]["id"]
    except (KeyError, IndexError):
        capture_id = f"CAP-{order.paypal_order_id}"

    payer_email = capture_resp.get("payer", {}).get("email_address", "sandbox-buyer@smartrewards.ai")

    # Atomic database operations
    try:
        # 1. Update PayPal Order
        order.status = "COMPLETED"
        order.capture_id = capture_id
        order.payer_email = payer_email

        # 2. Record Coupon Redemption
        if order.coupon_id:
            redemption = models.CouponRedemption(
                customer_id=order.customer_id,
                coupon_id=order.coupon_id,
                paypal_order_id=order.id,
                amount_saved=order.discount_amount,
                currency=order.currency,
                redeemed_at=datetime.utcnow()
            )
            db.add(redemption)

            # Increment coupon times_used
            coupon = db.query(models.Coupon).filter(models.Coupon.id == order.coupon_id).first()
            if coupon:
                coupon.times_used += 1

                # Update or create customer savings
                savings = (
                    db.query(models.CustomerSavings)
                    .filter(
                        models.CustomerSavings.customer_id == order.customer_id,
                        models.CustomerSavings.category == coupon.category
                    )
                    .first()
                )
                if savings:
                    savings.total_saved += order.discount_amount
                    savings.redemption_count += 1
                else:
                    savings = models.CustomerSavings(
                        customer_id=order.customer_id,
                        category=coupon.category,
                        total_saved=order.discount_amount,
                        redemption_count=1
                    )
                    db.add(savings)

            # Log conversion event for Customer Attraction Intelligence
            attraction = CustomerAttractionIntelligence(db)
            attraction.log_event(
                customer_id=order.customer_id,
                coupon_id=order.coupon_id,
                event_type="checkout_success",
                metadata={"capture_id": capture_id, "amount_saved": order.discount_amount}
            )

        # 3. Add as verified transaction
        tx = models.Transaction(
            customer_id=order.customer_id,
            merchant_name=coupon.merchant.business_name if (order.coupon_id and coupon and coupon.merchant) else "PayPal SmartRewards Merchant",
            category=coupon.category if (order.coupon_id and coupon) else "shopping",
            amount=order.final_amount,
            currency=order.currency,
            payment_channel="paypal",
            timestamp=datetime.utcnow(),
            is_synthetic=False # Live captured order!
        )
        db.add(tx)

        db.commit()

        return schemas.PayPalCaptureOrderResponse(
            success=True,
            order_id=order.paypal_order_id,
            capture_id=capture_id,
            status="COMPLETED",
            final_amount=order.final_amount,
            discount_saved=order.discount_amount,
            currency=order.currency,
            payer_email=payer_email,
            message="Payment captured and verified successfully with PayPal Sandbox!"
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database update failed after payment capture: {str(e)}")

@router.get("/orders/{customer_id}")
def get_customer_paypal_orders(customer_id: str, db: Session = Depends(get_db)):
    """
    Retrieve customer's verified PayPal order and redemption ledger.
    """
    orders = (
        db.query(models.PayPalOrder)
        .filter(models.PayPalOrder.customer_id == customer_id)
        .order_by(models.PayPalOrder.created_at.desc())
        .all()
    )

    results = []
    for o in orders:
        results.append({
            "order_id": o.paypal_order_id,
            "status": o.status,
            "original_amount": o.original_amount,
            "discount_amount": o.discount_amount,
            "final_amount": o.final_amount,
            "currency": o.currency,
            "capture_id": o.capture_id,
            "coupon_code": o.coupon.code if o.coupon else None,
            "coupon_title": o.coupon.title if o.coupon else None,
            "created_at": o.created_at
        })
    return results

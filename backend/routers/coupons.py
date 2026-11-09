from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from paypal_service import paypal_service

router = APIRouter(prefix="/api/coupons", tags=["Coupon Marketplace & Validation"])

@router.get("", response_model=List[schemas.CouponResponse])
def list_coupons(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Marketplace listing of active merchant coupons.
    """
    now = datetime.utcnow()
    query = db.query(models.Coupon).filter(
        models.Coupon.is_active == True,
        models.Coupon.expiry_date > now
    )

    if category and category.lower() != "all":
        query = query.filter(models.Coupon.category == category.lower())

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Coupon.title.ilike(search_filter)) | 
            (models.Coupon.code.ilike(search_filter)) |
            (models.Coupon.description.ilike(search_filter))
        )

    coupons = query.order_by(models.Coupon.created_at.desc()).all()
    
    res = []
    for c in coupons:
        res.append(schemas.CouponResponse(
            id=c.id,
            merchant_id=c.merchant_id,
            merchant_name=c.merchant.business_name if c.merchant else "Merchant",
            code=c.code,
            title=c.title,
            description=c.description,
            category=c.category,
            discount_type=c.discount_type,
            discount_value=c.discount_value,
            min_order_amount=c.min_order_amount,
            max_discount=c.max_discount,
            expiry_date=c.expiry_date,
            usage_limit=c.usage_limit,
            times_used=c.times_used,
            is_active=c.is_active,
            created_at=c.created_at
        ))
    return res

@router.get("/{coupon_id}", response_model=schemas.CouponResponse)
def get_coupon_details(coupon_id: str, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    return schemas.CouponResponse(
        id=coupon.id,
        merchant_id=coupon.merchant_id,
        merchant_name=coupon.merchant.business_name if coupon.merchant else "Merchant",
        code=coupon.code,
        title=coupon.title,
        description=coupon.description,
        category=coupon.category,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        min_order_amount=coupon.min_order_amount,
        max_discount=coupon.max_discount,
        expiry_date=coupon.expiry_date,
        usage_limit=coupon.usage_limit,
        times_used=coupon.times_used,
        is_active=coupon.is_active,
        created_at=coupon.created_at
    )

@router.post("/validate", response_model=schemas.CouponValidateResponse)
def validate_coupon_eligibility(req: schemas.CouponValidateRequest, db: Session = Depends(get_db)):
    """
    Server-side coupon validation. Calculates discount with Decimal precision.
    Never trusts client calculations!
    """
    coupon = db.query(models.Coupon).filter(models.Coupon.id == req.coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    # 1. Active check
    if not coupon.is_active:
        return schemas.CouponValidateResponse(
            is_eligible=False,
            coupon=schemas.CouponResponse.model_validate(coupon),
            cart_amount=req.cart_amount,
            discount_amount=0.0,
            final_amount=req.cart_amount,
            message="This coupon is no longer active."
        )

    # 2. Expiration check
    if coupon.expiry_date < datetime.utcnow():
        return schemas.CouponValidateResponse(
            is_eligible=False,
            coupon=schemas.CouponResponse.model_validate(coupon),
            cart_amount=req.cart_amount,
            discount_amount=0.0,
            final_amount=req.cart_amount,
            message="This coupon has expired."
        )

    # 3. Usage limit check
    if coupon.times_used >= coupon.usage_limit:
        return schemas.CouponValidateResponse(
            is_eligible=False,
            coupon=schemas.CouponResponse.model_validate(coupon),
            cart_amount=req.cart_amount,
            discount_amount=0.0,
            final_amount=req.cart_amount,
            message="This coupon has reached its maximum redemption limit."
        )

    # 4. Minimum order amount check
    if req.cart_amount < coupon.min_order_amount:
        return schemas.CouponValidateResponse(
            is_eligible=False,
            coupon=schemas.CouponResponse.model_validate(coupon),
            cart_amount=req.cart_amount,
            discount_amount=0.0,
            final_amount=req.cart_amount,
            message=f"Cart total ₹{req.cart_amount:,.2f} is below minimum purchase requirement of ₹{coupon.min_order_amount:,.2f}."
        )

    # 5. Calculate verified discount
    pricing = paypal_service.calculate_discount(
        original_amount=req.cart_amount,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        max_discount=coupon.max_discount
    )

    return schemas.CouponValidateResponse(
        is_eligible=True,
        coupon=schemas.CouponResponse.model_validate(coupon),
        cart_amount=float(pricing["original_amount"]),
        discount_amount=float(pricing["discount_amount"]),
        final_amount=float(pricing["final_amount"]),
        message="Coupon applied successfully! Proceed to PayPal Checkout."
    )

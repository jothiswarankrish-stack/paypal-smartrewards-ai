from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/merchant", tags=["Merchant Management & Analytics"])

@router.get("/{merchant_id}/stats", response_model=schemas.MerchantStatsResponse)
def get_merchant_stats(merchant_id: str, db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        # If lookup by user_id
        merchant = db.query(models.Merchant).filter(models.Merchant.user_id == merchant_id).first()
    if not merchant:
        # Default to first merchant for demo convenience
        merchant = db.query(models.Merchant).first()

    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    coupons = db.query(models.Coupon).filter(models.Coupon.merchant_id == merchant.id).all()
    coupon_ids = [c.id for c in coupons]

    active_count = sum(1 for c in coupons if c.is_active and c.expiry_date > datetime.utcnow())
    total_redemptions = sum(c.times_used for c in coupons)

    # Redemptions detail
    redemptions = (
        db.query(models.CouponRedemption)
        .filter(models.CouponRedemption.coupon_id.in_(coupon_ids))
        .order_by(models.CouponRedemption.redeemed_at.desc())
        .limit(10)
        .all()
    ) if coupon_ids else []

    total_discounts = sum(r.amount_saved for r in redemptions)
    # Estimate sales volume generated: approx 3.5x to 5x discount given
    total_sales = total_discounts * 4.2 + (total_redemptions * 450.0)

    # Impressions vs Redemptions conversion
    impressions = (
        db.query(func.count(models.RecommendationEvent.id))
        .filter(
            models.RecommendationEvent.coupon_id.in_(coupon_ids),
            models.RecommendationEvent.event_type == "impression"
        )
        .scalar() or 1
    ) if coupon_ids else 1

    conversion_rate = round((total_redemptions / max(impressions, 1) * 100.0), 1)

    recent_list = [
        {
            "id": r.id,
            "customer_id": r.customer_id,
            "coupon_code": r.coupon.code if r.coupon else "",
            "amount_saved": r.amount_saved,
            "redeemed_at": r.redeemed_at.strftime("%Y-%m-%d %H:%M")
        }
        for r in redemptions
    ]

    return schemas.MerchantStatsResponse(
        merchant_id=merchant.id,
        business_name=merchant.business_name,
        category=merchant.category,
        active_coupons_count=active_count,
        total_redemptions=total_redemptions,
        total_sales_generated=round(total_sales, 2),
        total_discounts_given=round(total_discounts, 2),
        conversion_rate=conversion_rate,
        recent_redemptions=recent_list
    )

@router.get("/{merchant_id}/coupons", response_model=List[schemas.CouponResponse])
def get_merchant_coupons(merchant_id: str, db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        merchant = db.query(models.Merchant).first()

    coupons = db.query(models.Coupon).filter(models.Coupon.merchant_id == merchant.id).all()
    return [schemas.CouponResponse.model_validate(c) for c in coupons]

@router.post("/coupons", response_model=schemas.CouponResponse)
def create_merchant_coupon(coupon_data: schemas.CouponCreate, db: Session = Depends(get_db)):
    """
    Create a new merchant reward coupon.
    """
    # Check if code exists
    existing = db.query(models.Coupon).filter(models.Coupon.code == coupon_data.code.upper().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Coupon code '{coupon_data.code}' already exists.")

    new_coupon = models.Coupon(
        merchant_id=coupon_data.merchant_id,
        code=coupon_data.code.upper().strip(),
        title=coupon_data.title,
        description=coupon_data.description,
        category=coupon_data.category.lower(),
        discount_type=coupon_data.discount_type,
        discount_value=coupon_data.discount_value,
        min_order_amount=coupon_data.min_order_amount,
        max_discount=coupon_data.max_discount,
        expiry_date=coupon_data.expiry_date,
        usage_limit=coupon_data.usage_limit,
        times_used=0,
        is_active=True
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return schemas.CouponResponse.model_validate(new_coupon)

@router.patch("/coupons/{coupon_id}/toggle")
def toggle_coupon_status(coupon_id: str, db: Session = Depends(get_db)):
    coupon = db.query(models.Coupon).filter(models.Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    coupon.is_active = not coupon.is_active
    db.commit()
    return {"id": coupon.id, "is_active": coupon.is_active, "status": "updated"}

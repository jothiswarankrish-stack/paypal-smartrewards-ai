from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas
from seed_data import seed_database
from recommendation.attraction import CustomerAttractionIntelligence

router = APIRouter(prefix="/api/admin", tags=["Admin Portal & Platform Operations"])

@router.get("/stats", response_model=schemas.AdminPlatformStats)
def get_admin_platform_stats(db: Session = Depends(get_db)):
    """
    Platform-wide business and operational metrics.
    """
    user_count = db.query(func.count(models.User.id)).scalar() or 0
    merchant_count = db.query(func.count(models.Merchant.id)).scalar() or 0
    coupon_count = db.query(func.count(models.Coupon.id)).scalar() or 0
    tx_count = db.query(func.count(models.Transaction.id)).scalar() or 0
    redemption_count = db.query(func.count(models.CouponRedemption.id)).scalar() or 0

    total_volume = db.query(func.sum(models.Transaction.amount)).scalar() or 0.0
    total_savings = db.query(func.sum(models.CustomerSavings.total_saved)).scalar() or 0.0

    attraction = CustomerAttractionIntelligence(db)
    funnel = attraction.get_funnel_metrics()

    return schemas.AdminPlatformStats(
        total_users=user_count,
        total_merchants=merchant_count,
        total_coupons=coupon_count,
        total_transactions=tx_count,
        total_redemptions=redemption_count,
        total_volume_processed=round(total_volume, 2),
        total_customer_savings=round(total_savings, 2),
        paypal_conversion_rate=funnel["payment_conversion_rate"],
        ai_recommendation_click_through_rate=funnel["click_through_rate"]
    )

@router.get("/cohorts", response_model=List[schemas.CohortComparisonItem])
def get_cohort_comparisons(db: Session = Depends(get_db)):
    """
    Customer Attraction Intelligence: Controlled synthetic cohort comparison.
    """
    attraction = CustomerAttractionIntelligence(db)
    return attraction.get_cohort_comparison()

@router.get("/users")
def list_system_users(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    results = []
    for u in users:
        persona = u.customer_profile.persona_name if u.customer_profile else ("Merchant" if u.role == "merchant" else "Admin")
        results.append({
            "id": u.id,
            "email": u.email,
            "name": u.full_name,
            "role": u.role,
            "persona": persona,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M")
        })
    return results

@router.post("/reset-demo")
def reset_demo_database():
    """
    Re-seed database to restore pristine 5-customer cohort demonstration state.
    """
    seed_database()
    return {"status": "success", "message": "Demo data successfully re-seeded."}

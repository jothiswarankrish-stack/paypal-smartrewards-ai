from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
import models

router = APIRouter(prefix="/api/analytics", tags=["AG Grid Enterprise Data Endpoints"])

@router.get("/spending-grid")
def get_spending_analytics_grid(
    customer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    AG Grid table dataset: Customer Transaction & Spending Ledger.
    """
    query = db.query(models.Transaction)
    if customer_id:
        query = query.filter(models.Transaction.customer_id == customer_id)

    txs = query.order_by(desc(models.Transaction.timestamp)).limit(200).all()

    rows = []
    for t in txs:
        rows.append({
            "transaction_id": t.id[:8].upper(),
            "customer_id": t.customer_id[:8],
            "customer_name": t.customer.full_name if t.customer else "Demo User",
            "merchant": t.merchant_name,
            "category": t.category.capitalize(),
            "amount": t.amount,
            "currency": t.currency,
            "channel": t.payment_channel.upper(),
            "date": t.timestamp.strftime("%Y-%m-%d %H:%M"),
            "is_synthetic": "Synthetic" if t.is_synthetic else "Live Verified"
        })
    return rows

@router.get("/coupons-grid")
def get_coupons_performance_grid(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    AG Grid table dataset: Coupon Inventory, Redemption Velocity & Discount Caps.
    """
    coupons = db.query(models.Coupon).order_by(desc(models.Coupon.times_used)).all()
    rows = []
    for c in coupons:
        usage_pct = round((c.times_used / max(c.usage_limit, 1)) * 100.0, 1)
        discount_display = f"{c.discount_value}%" if c.discount_type == "percentage" else f"₹{c.discount_value:,.0f}"
        rows.append({
            "code": c.code,
            "title": c.title,
            "merchant": c.merchant.business_name if c.merchant else "SmartRewards Partner",
            "category": c.category.capitalize(),
            "discount": discount_display,
            "min_purchase": c.min_order_amount,
            "max_cap": c.max_discount or "No Limit",
            "redemptions": c.times_used,
            "limit": c.usage_limit,
            "utilization_pct": usage_pct,
            "status": "Active" if c.is_active else "Paused",
            "expires": c.expiry_date.strftime("%Y-%m-%d")
        })
    return rows

@router.get("/redemptions-grid")
def get_redemptions_audit_grid(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    AG Grid table dataset: Verified PayPal Redemptions Audit Trail.
    """
    redemptions = db.query(models.CouponRedemption).order_by(desc(models.CouponRedemption.redeemed_at)).limit(100).all()
    rows = []
    for r in redemptions:
        rows.append({
            "redemption_id": r.id[:8].upper(),
            "customer": r.customer.full_name if r.customer else "User",
            "coupon_code": r.coupon.code if r.coupon else "N/A",
            "category": r.coupon.category.capitalize() if r.coupon else "N/A",
            "amount_saved": r.amount_saved,
            "currency": r.currency,
            "paypal_order_id": r.paypal_order.paypal_order_id if r.paypal_order else "SIMULATED",
            "capture_id": r.paypal_order.capture_id if r.paypal_order else "VERIFIED",
            "redeemed_at": r.redeemed_at.strftime("%Y-%m-%d %H:%M")
        })
    return rows

@router.get("/merchants-grid")
def get_merchants_grid(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    AG Grid table dataset: Merchant Partner Ecosystem Metrics.
    """
    merchants = db.query(models.Merchant).all()
    rows = []
    for m in merchants:
        coupon_count = len(m.coupons)
        total_redemptions = sum(c.times_used for c in m.coupons)
        rows.append({
            "merchant_id": m.id[:8],
            "business_name": m.business_name,
            "category": m.category.capitalize(),
            "active_offers": coupon_count,
            "total_redemptions": total_redemptions,
            "commission_rate": f"{m.commission_rate}%",
            "joined_date": m.created_at.strftime("%Y-%m-%d")
        })
    return rows

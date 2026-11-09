from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/customer", tags=["Customer Insights & Transactions"])

@router.get("/insights/{customer_id}", response_model=schemas.SpendingInsightsResponse)
def get_customer_spending_insights(customer_id: str, db: Session = Depends(get_db)):
    """
    Returns 30-day spending analytics, category breakdown,
    and cumulative verified savings for the customer.
    """
    user = db.query(models.User).filter(models.User.id == customer_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")

    cutoff_date = datetime.utcnow() - timedelta(days=30)
    txs = (
        db.query(models.Transaction)
        .filter(models.Transaction.customer_id == customer_id, models.Transaction.timestamp >= cutoff_date)
        .all()
    )

    if not txs:
        # Fallback to all transactions if none in 30 days
        txs = db.query(models.Transaction).filter(models.Transaction.customer_id == customer_id).all()

    total_spent = sum(t.amount for t in txs)

    # Category aggregations
    cat_map = {}
    for t in txs:
        if t.category not in cat_map:
            cat_map[t.category] = {"amount": 0.0, "count": 0, "merchants": {}}
        cat_map[t.category]["amount"] += t.amount
        cat_map[t.category]["count"] += 1
        cat_map[t.category]["merchants"][t.merchant_name] = cat_map[t.category]["merchants"].get(t.merchant_name, 0) + 1

    breakdown = []
    highest_category = "food"
    max_amount = -1.0

    for cat, data in cat_map.items():
        amt = data["amount"]
        pct = (amt / total_spent * 100.0) if total_spent > 0 else 0.0
        top_merch = max(data["merchants"], key=data["merchants"].get) if data["merchants"] else None
        if amt > max_amount:
            max_amount = amt
            highest_category = cat

        breakdown.append(schemas.SpendingCategoryBreakdown(
            category=cat,
            total_amount=round(amt, 2),
            transaction_count=data["count"],
            percentage=round(pct, 1),
            top_merchant=top_merch
        ))

    # Sort breakdown by spend descending
    breakdown.sort(key=lambda x: x.total_amount, reverse=True)

    # Recent transactions (last 10)
    recent = (
        db.query(models.Transaction)
        .filter(models.Transaction.customer_id == customer_id)
        .order_by(models.Transaction.timestamp.desc())
        .limit(10)
        .all()
    )

    # Cumulative verified savings
    savings_sum = (
        db.query(func.sum(models.CustomerSavings.total_saved))
        .filter(models.CustomerSavings.customer_id == customer_id)
        .scalar() or 0.0
    )

    return schemas.SpendingInsightsResponse(
        customer_id=user.id,
        customer_name=user.full_name,
        persona_name=user.customer_profile.persona_name if user.customer_profile else "Customer",
        total_spent_30d=round(total_spent, 2),
        currency="INR",
        highest_category=highest_category,
        category_breakdown=breakdown,
        recent_transactions=[schemas.TransactionSchema.model_validate(t) for t in recent],
        total_savings_lifetime=round(savings_sum, 2)
    )

@router.get("/transactions/{customer_id}", response_model=List[schemas.TransactionSchema])
def get_customer_transactions(
    customer_id: str,
    category: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction).filter(models.Transaction.customer_id == customer_id)
    if category and category.lower() != "all":
        query = query.filter(models.Transaction.category == category.lower())

    txs = query.order_by(models.Transaction.timestamp.desc()).limit(limit).all()
    return [schemas.TransactionSchema.model_validate(t) for t in txs]

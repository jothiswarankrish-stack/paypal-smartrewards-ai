from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from recommendation.engine import RecommendationEngine
from recommendation.explainer import RecommendationExplainer
from recommendation.attraction import CustomerAttractionIntelligence

router = APIRouter(prefix="/api/recommendations", tags=["AI Recommendation Engine"])
explainer = RecommendationExplainer()

@router.get("/{customer_id}", response_model=schemas.RecommendationResponse)
async def get_personalized_recommendations(customer_id: str, db: Session = Depends(get_db)):
    """
    Generate and retrieve explainable, data-driven personalized coupon recommendations
    based on the customer's previous 30 days of transactions.
    """
    user = db.query(models.User).filter(models.User.id == customer_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")

    engine = RecommendationEngine(db)
    attraction = CustomerAttractionIntelligence(db)

    # 1. Run Scikit-learn + RFM ranking algorithm
    top_items = engine.compute_recommendations(customer_id=customer_id, top_k=6)
    customer_features = engine.extract_customer_features(customer_id)

    recommendation_results = []

    for item in top_items:
        coupon = item["coupon"]
        cat = coupon.category
        spend = customer_features["category_spend"].get(cat, 0.0)
        share_pct = customer_features["category_shares"].get(cat, 0.0) * 100.0
        tx_count = customer_features["category_frequencies"].get(cat, 0)
        merch_name = coupon.merchant.business_name if coupon.merchant else "Partner Merchant"

        # 2. Generate natural language explanation (LLM or statistical explainer)
        disc_desc = f"{coupon.discount_value}% OFF" if coupon.discount_type == "percentage" else f"₹{coupon.discount_value:,.0f} OFF"
        explanation = await explainer.generate_explanation(
            customer_name=user.full_name,
            category=cat,
            category_spend=spend,
            category_share_pct=share_pct,
            transaction_count=tx_count,
            coupon_title=coupon.title,
            discount_desc=disc_desc,
            merchant_name=merch_name,
            rank=item["rank"]
        )

        # 3. Log impression event for Customer Attraction Intelligence
        attraction.log_event(
            customer_id=customer_id,
            coupon_id=coupon.id,
            event_type="impression",
            metadata={"match_score": item["match_score"], "rank": item["rank"]}
        )

        # 4. Construct response item
        coupon_dto = schemas.CouponResponse(
            id=coupon.id,
            merchant_id=coupon.merchant_id,
            merchant_name=merch_name,
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

        recommendation_results.append(schemas.RecommendationItem(
            id=f"rec-{customer_id}-{coupon.id}",
            coupon=coupon_dto,
            match_score=item["match_score"],
            rank=item["rank"],
            rationale=explanation,
            category_relevance=item["category_relevance"],
            savings_potential_estimate=item["savings_potential_estimate"],
            attraction_tag=item["attraction_tag"]
        ))

    return schemas.RecommendationResponse(
        customer_id=customer_id,
        persona=user.customer_profile.persona_name if user.customer_profile else "Customer",
        recommendations=recommendation_results,
        model_version="v2.1-hybrid-rfm-cosine",
        explanation_source="SmartRewards Hybrid Explainer (Gemini / High-Precision Structured)"
    )

@router.post("/event")
def record_recommendation_event(
    event: schemas.RecommendationEventLog,
    customer_id: str,
    db: Session = Depends(get_db)
):
    """
    Log user engagement: click, apply, or checkout initiation.
    """
    attraction = CustomerAttractionIntelligence(db)
    log_record = attraction.log_event(
        customer_id=customer_id,
        coupon_id=event.coupon_id,
        event_type=event.event_type,
        metadata=event.metadata
    )
    return {"status": "success", "event_id": log_record.id, "event_type": event.event_type}

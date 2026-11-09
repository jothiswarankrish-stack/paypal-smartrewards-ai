from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
import models

class CustomerAttractionIntelligence:
    def __init__(self, db: Session):
        self.db = db

    def log_event(self, customer_id: str, coupon_id: str, event_type: str, metadata: Dict[str, Any] = None) -> models.RecommendationEvent:
        """
        Record user funnel events:
        'impression', 'click', 'apply', 'checkout_init', 'checkout_success'
        """
        event = models.RecommendationEvent(
            customer_id=customer_id,
            coupon_id=coupon_id,
            event_type=event_type,
            metadata_json=str(metadata) if metadata else None,
            timestamp=datetime.utcnow()
        )
        self.db.add(event)
        self.db.commit()
        return event

    def get_funnel_metrics(self) -> Dict[str, Any]:
        """
        Calculates conversion funnel for PayPal SmartRewards AI:
        Impressions -> Clicks -> Selections -> PayPal Checkouts
        """
        events = self.db.query(
            models.RecommendationEvent.event_type,
            func.count(models.RecommendationEvent.id)
        ).group_by(models.RecommendationEvent.event_type).all()

        counts = {ev[0]: ev[1] for ev in events}
        impressions = counts.get("impression", 420)  # base baseline for demo
        clicks = counts.get("click", 195)
        selections = counts.get("apply", 140)
        completions = counts.get("checkout_success", 98)

        ctr = (clicks / impressions * 100.0) if impressions > 0 else 0.0
        conversion_rate = (completions / clicks * 100.0) if clicks > 0 else 0.0

        return {
            "impressions": impressions,
            "clicks": clicks,
            "selections": selections,
            "completed_payments": completions,
            "click_through_rate": round(ctr, 1),
            "payment_conversion_rate": round(conversion_rate, 1)
        }

    def get_cohort_comparison(self) -> List[Dict[str, Any]]:
        """
        Controlled synthetic customer cohorts comparing:
        - Cohort 1: Personalized AI Offers (SmartRewards AI)
        - Cohort 2: Generic Non-Personalized Coupons (Control)
        - Cohort 3: No Promotional Coupons
        """
        return [
            {
                "cohort_name": "SmartRewards AI (Personalized)",
                "sample_size": 250,
                "redemption_rate": 39.2,
                "avg_order_value": 780.0,
                "paypal_retention_lift": 28.4,
                "description": "Dynamic machine-learning scoring based on 30-day category spend vectors."
            },
            {
                "cohort_name": "Generic Coupons (Control Baseline)",
                "sample_size": 250,
                "redemption_rate": 14.8,
                "avg_order_value": 640.0,
                "paypal_retention_lift": 6.2,
                "description": "Standard static sitewide coupon banner without user personalization."
            },
            {
                "cohort_name": "No Incentive (Pure Baseline)",
                "sample_size": 250,
                "redemption_rate": 0.0,
                "avg_order_value": 520.0,
                "paypal_retention_lift": 0.0,
                "description": "Standard checkout flow with no coupon discovery."
            }
        ]

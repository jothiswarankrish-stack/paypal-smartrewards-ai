import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
import models

CATEGORIES = ["food", "taxi", "shopping", "entertainment", "travel", "groceries"]
CATEGORY_INDEX = {cat: i for i, cat in enumerate(CATEGORIES)}

class RecommendationEngine:
    def __init__(self, db: Session):
        self.db = db

    def extract_customer_features(self, customer_id: str) -> Dict[str, Any]:
        """
        Analyze customer's last 30 days of transactions:
        - Category spending breakdown
        - Recency and frequency
        - Average transaction amount
        - Preferred merchants
        """
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        transactions = (
            self.db.query(models.Transaction)
            .filter(
                models.Transaction.customer_id == customer_id,
                models.Transaction.timestamp >= cutoff_date
            )
            .all()
        )

        if not transactions:
            # Fallback to all historical transactions if none in last 30 days
            transactions = (
                self.db.query(models.Transaction)
                .filter(models.Transaction.customer_id == customer_id)
                .all()
            )

        if not transactions:
            # Default uniform profile
            return {
                "total_spend": 0.0,
                "transaction_count": 0,
                "avg_spend": 0.0,
                "category_spend": {cat: 0.0 for cat in CATEGORIES},
                "category_shares": {cat: 1.0 / len(CATEGORIES) for cat in CATEGORIES},
                "category_frequencies": {cat: 0 for cat in CATEGORIES},
                "category_recencies": {cat: 30.0 for cat in CATEGORIES},
                "feature_vector": np.ones(len(CATEGORIES)) / np.sqrt(len(CATEGORIES)),
                "top_category": "food",
                "top_merchants": {}
            }

        df = pd.DataFrame([
            {
                "category": tx.category,
                "amount": float(tx.amount),
                "merchant": tx.merchant_name,
                "timestamp": tx.timestamp
            }
            for tx in transactions
        ])

        total_spend = df["amount"].sum()
        tx_count = len(df)
        avg_spend = total_spend / tx_count if tx_count > 0 else 0.0

        # Category level aggregation
        cat_agg = df.groupby("category").agg(
            spend=("amount", "sum"),
            count=("amount", "count"),
            latest_time=("timestamp", "max")
        ).reset_index()

        cat_spend_dict = {cat: 0.0 for cat in CATEGORIES}
        cat_freq_dict = {cat: 0 for cat in CATEGORIES}
        cat_recency_dict = {cat: 30.0 for cat in CATEGORIES}

        now = datetime.utcnow()
        for _, row in cat_agg.iterrows():
            c = row["category"]
            if c in cat_spend_dict:
                cat_spend_dict[c] = float(row["spend"])
                cat_freq_dict[c] = int(row["count"])
                days_ago = (now - row["latest_time"]).total_seconds() / 86400.0
                cat_recency_dict[c] = max(0.1, days_ago)

        # Normalized category shares
        cat_shares = {}
        for cat in CATEGORIES:
            cat_shares[cat] = cat_spend_dict[cat] / total_spend if total_spend > 0 else (1.0 / len(CATEGORIES))

        # Build feature vector: combination of spend share and recency decay
        raw_vector = []
        for cat in CATEGORIES:
            share = cat_shares[cat]
            recency_decay = np.exp(-0.05 * cat_recency_dict[cat])  # exponential decay
            freq_weight = np.log1p(cat_freq_dict[cat])
            combined_val = (0.6 * share) + (0.25 * recency_decay) + (0.15 * (freq_weight / (np.log1p(tx_count) + 1e-5)))
            raw_vector.append(combined_val)

        norm = np.linalg.norm(raw_vector)
        feature_vector = np.array(raw_vector) / norm if norm > 0 else np.ones(len(CATEGORIES)) / np.sqrt(len(CATEGORIES))

        top_category = max(cat_spend_dict, key=cat_spend_dict.get) if total_spend > 0 else "food"

        # Merchant frequencies
        merchant_counts = df["merchant"].value_counts().to_dict()

        return {
            "total_spend": total_spend,
            "transaction_count": tx_count,
            "avg_spend": avg_spend,
            "category_spend": cat_spend_dict,
            "category_shares": cat_shares,
            "category_frequencies": cat_freq_dict,
            "category_recencies": cat_recency_dict,
            "feature_vector": feature_vector,
            "top_category": top_category,
            "top_merchants": merchant_counts
        }

    def generate_coupon_vector(self, coupon: models.Coupon) -> np.ndarray:
        """
        Represent coupon as a vectorized target in category space
        with appeal weights based on discount depth and flexibility.
        """
        vec = np.zeros(len(CATEGORIES))
        if coupon.category in CATEGORY_INDEX:
            idx = CATEGORY_INDEX[coupon.category]
            vec[idx] = 1.0

        # Normalize
        norm = np.linalg.norm(vec)
        return vec / norm if norm > 0 else vec

    def compute_recommendations(self, customer_id: str, top_k: int = 6) -> List[Dict[str, Any]]:
        """
        Main recommendation scoring pipeline:
        1. Extract customer 30-day feature vector
        2. Retrieve active eligible coupons
        3. Check expiration, redemption status, and usage limit
        4. Calculate Cosine Similarity & Multi-Factor Relevance Score
        5. Rank coupons and assign attraction tags
        """
        customer_features = self.extract_customer_features(customer_id)
        cust_vector = customer_features["feature_vector"]

        # Fetch active coupons that are not expired
        now = datetime.utcnow()
        coupons = (
            self.db.query(models.Coupon)
            .filter(
                models.Coupon.is_active == True,
                models.Coupon.expiry_date > now,
                models.Coupon.times_used < models.Coupon.usage_limit
            )
            .all()
        )

        # Check existing redemptions for this customer
        redeemed_ids = set(
            r[0] for r in self.db.query(models.CouponRedemption.coupon_id)
            .filter(models.CouponRedemption.customer_id == customer_id)
            .all()
        )

        scored_items = []

        for coupon in coupons:
            # Prevent recommending already redeemed single-use coupons
            if coupon.id in redeemed_ids:
                continue

            coup_vector = self.generate_coupon_vector(coupon)
            
            # 1. Cosine similarity in category space
            cosine_sim = float(np.dot(cust_vector, coup_vector))

            # 2. Category share directly from user spend
            cat_share = customer_features["category_shares"].get(coupon.category, 0.0)

            # 3. Frequency match bonus
            freq = customer_features["category_frequencies"].get(coupon.category, 0)
            freq_bonus = min(0.2, freq * 0.02)

            # 4. Affordability / accessibility match (is min_order_amount reasonable for customer?)
            avg_spend = customer_features["avg_spend"]
            accessibility = 1.0
            if coupon.min_order_amount > 0 and avg_spend > 0:
                ratio = avg_spend / coupon.min_order_amount
                if ratio >= 1.0:
                    accessibility = 1.0
                else:
                    accessibility = max(0.5, ratio)

            # 5. Discount appeal score
            appeal = 0.5
            if coupon.discount_type == "percentage":
                appeal = min(1.0, coupon.discount_value / 50.0)  # 50% discount = 1.0
            else:
                appeal = min(1.0, coupon.discount_value / 500.0)

            # Master Prompt Weight Configuration:
            # - Category spending relevance: 30%
            # - Transaction frequency: 20%
            # - Spending recency: 15%
            # - Average purchase compatibility: 15%
            # - Customer category affinity (cosine similarity): 10%
            # - Discount appeal & engagement: 10%

            cat_relevance = min(1.0, cat_share / 0.45) # 45%+ spend = 1.0
            freq_score = min(1.0, freq / 8.0) # 8+ orders = 1.0
            recency_days = customer_features["category_recencies"].get(coupon.category, 30.0)
            recency_score = float(np.exp(-0.08 * recency_days))

            composite_score = (
                (0.30 * cat_relevance) +
                (0.20 * freq_score) +
                (0.15 * recency_score) +
                (0.15 * accessibility) +
                (0.10 * cosine_sim) +
                (0.10 * appeal)
            ) * 100.0

            # Scale and clip between 20% and 99%
            final_score = round(float(np.clip(composite_score, 20.0, 99.0)), 1)

            # Potential savings estimate
            savings_est = 0.0
            target_spend = max(avg_spend, coupon.min_order_amount or 500.0)
            if coupon.discount_type == "percentage":
                raw_saving = target_spend * (coupon.discount_value / 100.0)
                savings_est = min(raw_saving, coupon.max_discount if coupon.max_discount else raw_saving)
            else:
                savings_est = min(coupon.discount_value, target_spend)

            # Customer attraction intelligence tag
            attraction_tag = None
            if coupon.category == customer_features["top_category"]:
                attraction_tag = f"Top Pick: Matches your #{1} spending category ({coupon.category.capitalize()})"
            elif cat_share > 0.2:
                attraction_tag = f"Frequent Interest: {int(cat_share * 100)}% of your recent purchases"
            elif appeal > 0.7:
                attraction_tag = "High Value Discount with PayPal Checkout"
            else:
                attraction_tag = "Personalized Merchant Exclusive"

            scored_items.append({
                "coupon": coupon,
                "match_score": final_score,
                "category_relevance": round(cat_share * 100, 1),
                "savings_potential_estimate": round(savings_est, 2),
                "attraction_tag": attraction_tag,
                "cosine_sim": cosine_sim
            })

        # Sort descending by match score
        scored_items.sort(key=lambda x: x["match_score"], reverse=True)
        top_recommendations = scored_items[:top_k]

        # Assign rank
        for i, item in enumerate(top_recommendations, 1):
            item["rank"] = i

        return top_recommendations

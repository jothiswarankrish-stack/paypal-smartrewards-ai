import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from decimal import Decimal
import models
from paypal_service import paypal_service

class AgenticCommerceEngine:
    def __init__(self, db: Session):
        self.db = db

    def parse_intent(self, message: str) -> Dict[str, Any]:
        """
        Extract category, budget, and keywords from natural language input.
        e.g. "I want food for ₹500" or "Get me a cab discount under 300"
        """
        msg_lower = message.lower()
        category = None

        if any(w in msg_lower for w in ["food", "dinner", "lunch", "meal", "pizza", "burger", "eat", "swiggy", "zomato"]):
            category = "food"
        elif any(w in msg_lower for w in ["cab", "taxi", "ride", "uber", "ola", "commute", "airport"]):
            category = "taxi"
        elif any(w in msg_lower for w in ["shop", "dress", "fashion", "shoes", "clothes", "gadget", "amazon", "myntra"]):
            category = "shopping"
        elif any(w in msg_lower for w in ["grocery", "groceries", "vegetable", "milk", "blinkit", "zepto"]):
            category = "groceries"
        elif any(w in msg_lower for w in ["movie", "cinema", "ticket", "concert", "show", "bookmyshow"]):
            category = "entertainment"
        elif any(w in msg_lower for w in ["flight", "hotel", "travel", "holiday", "resort", "makemytrip"]):
            category = "travel"

        # Extract budget amount (matches ₹500, 500rs, Rs 500, $20, 500)
        budget = None
        amounts = re.findall(r'(?:[₹$]|rs\.?\s*)?(\d+(?:\.\d{1,2})?)', msg_lower)
        if amounts:
            # Pick first reasonable non-zero number
            for a in amounts:
                val = float(a)
                if val >= 20.0:
                    budget = val
                    break

        return {
            "category": category,
            "budget": budget or 600.0,
            "raw_text": message
        }

    def process_agent_request(self, message: str, customer_id: Optional[str] = None) -> Dict[str, Any]:
        intent = self.parse_intent(message)
        category = intent["category"]
        budget = intent["budget"]

        query = self.db.query(models.Coupon).filter(models.Coupon.is_active == True)
        if category:
            query = query.filter(models.Coupon.category == category)

        available_coupons = query.all()
        if not available_coupons:
            # Fallback to all active coupons
            available_coupons = self.db.query(models.Coupon).filter(models.Coupon.is_active == True).all()

        if not available_coupons:
            return {
                "reply": "I couldn't find active merchant rewards for that request. Try asking for food, taxi, shopping, or groceries!",
                "suggested_deals": [],
                "action_type": "INFO",
                "order_intent": None
            }

        # Compare deals and calculate exact savings
        proposals = []
        for coupon in available_coupons:
            # Estimate purchase price: either user's budget or coupon's min order
            simulated_cart = max(budget, coupon.min_order_amount or 400.0)
            pricing = paypal_service.calculate_discount(
                original_amount=simulated_cart,
                discount_type=coupon.discount_type,
                discount_value=coupon.discount_value,
                max_discount=coupon.max_discount
            )

            orig = float(pricing["original_amount"])
            disc = float(pricing["discount_amount"])
            final = float(pricing["final_amount"])
            savings_pct = round((disc / orig * 100.0) if orig > 0 else 0.0, 1)

            # Check merchant name
            merch = coupon.merchant.business_name if coupon.merchant else "SmartRewards Partner"

            rationale = (
                f"Saves ₹{disc:,.0f} ({savings_pct}% off) on a ₹{orig:,.0f} order at {merch}. "
                f"Eligible for instant PayPal Sandbox checkout."
            )

            proposals.append({
                "coupon_id": coupon.id,
                "coupon_title": coupon.title,
                "merchant_name": merch,
                "original_price": orig,
                "discount_amount": disc,
                "final_price": final,
                "savings_percentage": savings_pct,
                "rationale": rationale,
                "min_order": coupon.min_order_amount
            })

        # Rank by maximum savings percentage and affordability
        proposals.sort(key=lambda x: (x["savings_percentage"], x["discount_amount"]), reverse=True)
        top_proposals = proposals[:3]
        best_deal = top_proposals[0]

        reply = (
            f"I found the best deal for your budget! At {best_deal['merchant_name']}, you can use "
            f"'{best_deal['coupon_title']}' to pay ₹{best_deal['final_price']:,.0f} instead of "
            f"₹{best_deal['original_price']:,.0f} (saving ₹{best_deal['discount_amount']:,.0f} / {best_deal['savings_percentage']}%). "
            f"Would you like me to prepare this order for your PayPal approval?"
        )

        order_intent = {
            "coupon_id": best_deal["coupon_id"],
            "coupon_title": best_deal["coupon_title"],
            "merchant_name": best_deal["merchant_name"],
            "original_amount": best_deal["original_price"],
            "discount_amount": best_deal["discount_amount"],
            "final_amount": best_deal["final_price"],
            "currency": "USD" # for PayPal Sandbox Standard
        }

        return {
            "reply": reply,
            "suggested_deals": top_proposals,
            "action_type": "CHECKOUT_PROMPT",
            "order_intent": order_intent
        }

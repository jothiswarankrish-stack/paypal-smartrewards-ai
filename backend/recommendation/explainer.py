import httpx
from typing import Dict, Any, Optional
from config import settings

class RecommendationExplainer:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    async def generate_explanation(
        self,
        customer_name: str,
        category: str,
        category_spend: float,
        category_share_pct: float,
        transaction_count: int,
        coupon_title: str,
        discount_desc: str,
        merchant_name: str,
        rank: int
    ) -> str:
        """
        Generate natural language explanation.
        First tries Gemini or OpenAI if keys are present;
        Otherwise uses dynamic contextual templating backed by statistical metrics.
        """
        if self.gemini_key:
            try:
                explanation = await self._call_gemini(
                    customer_name, category, category_spend, category_share_pct,
                    transaction_count, coupon_title, discount_desc, merchant_name
                )
                if explanation:
                    return explanation
            except Exception as e:
                print(f"Gemini API call failed, falling back to structured explainer: {e}")

        # High-fidelity statistical explanation engine
        return self._generate_structured_explanation(
            customer_name, category, category_spend, category_share_pct,
            transaction_count, coupon_title, discount_desc, merchant_name, rank
        )

    def _generate_structured_explanation(
        self,
        customer_name: str,
        category: str,
        category_spend: float,
        category_share_pct: float,
        transaction_count: int,
        coupon_title: str,
        discount_desc: str,
        merchant_name: str,
        rank: int
    ) -> str:
        cat_display = {
            "food": "Food Delivery & Dining",
            "taxi": "Taxi & Daily Commute",
            "shopping": "Online Shopping & Fashion",
            "entertainment": "Entertainment & Cinema",
            "travel": "Travel & Flight Bookings",
            "groceries": "Quick Commerce & Groceries"
        }.get(category, category.capitalize())

        if category_share_pct >= 40.0:
            return (
                f"{cat_display} is your #1 spending category, accounting for {category_share_pct:.1f}% "
                f"(₹{category_spend:,.0f} across {transaction_count} orders) of your last 30 days. "
                f"We selected this exclusive {merchant_name} offer ({coupon_title}) to give you the highest immediate "
                f"savings when paying through PayPal Sandbox."
            )
        elif category_share_pct >= 20.0:
            return (
                f"You regularly transact in {cat_display} (₹{category_spend:,.0f} spent over {transaction_count} orders). "
                f"This reward matches your high purchase frequency and unlocks instant discounts on your next eligible checkout."
            )
        elif rank == 1:
            return (
                f"Based on your recent purchase patterns, this {merchant_name} reward ({discount_desc}) offers maximum savings "
                f"potential for your next planned purchase with PayPal."
            )
        else:
            return (
                f"Recommended based on your transaction recency in {cat_display}. Applying this coupon with PayPal Checkout "
                f"ensures you never leave eligible savings on the table."
            )

    async def _call_gemini(
        self,
        customer_name: str,
        category: str,
        category_spend: float,
        category_share_pct: float,
        transaction_count: int,
        coupon_title: str,
        discount_desc: str,
        merchant_name: str
    ) -> Optional[str]:
        prompt = f"""
You are the AI Financial Assistant for PayPal SmartRewards AI.
Generate a concise, warm, 2-sentence explanation to the customer for why this coupon was recommended based on their actual 30-day transaction history.
Customer: {customer_name}
Spending category: {category} (₹{category_spend:,.0f} spent, {category_share_pct:.1f}% of total monthly spend across {transaction_count} transactions)
Recommended Coupon: {coupon_title} ({discount_desc}) from {merchant_name}.
Highlight the relevant spending habit and how paying with PayPal maximizes savings.
Do not invent any discounts or numbers not given. Output only the 2-sentence explanation.
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 100}
        }
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                return text
        return None

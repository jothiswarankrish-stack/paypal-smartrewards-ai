from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "customer"

class UserCreate(UserBase):
    password: Optional[str] = "demopassword"

class CustomerProfileSchema(BaseModel):
    persona_name: str
    persona_description: Optional[str] = None
    monthly_budget: float = 15000.0
    preferred_payment_method: str = "paypal"

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: str
    created_at: datetime
    customer_profile: Optional[CustomerProfileSchema] = None

    class Config:
        from_attributes = True

class DemoLoginRequest(BaseModel):
    persona: str  # "customer_a", "customer_b", "customer_c", "merchant", "admin"

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Transaction & Spending Schemas ---
class TransactionSchema(BaseModel):
    id: str
    merchant_name: str
    category: str
    amount: float
    currency: str = "INR"
    payment_channel: str = "paypal"
    timestamp: datetime
    is_synthetic: bool = True

    class Config:
        from_attributes = True

class SpendingCategoryBreakdown(BaseModel):
    category: str
    total_amount: float
    transaction_count: int
    percentage: float
    top_merchant: Optional[str] = None

class SpendingInsightsResponse(BaseModel):
    customer_id: str
    customer_name: str
    persona_name: str
    total_spent_30d: float
    currency: str = "INR"
    highest_category: str
    category_breakdown: List[SpendingCategoryBreakdown]
    recent_transactions: List[TransactionSchema]
    total_savings_lifetime: float

# --- Coupon Schemas ---
class CouponBase(BaseModel):
    code: str
    title: str
    description: str
    category: str
    discount_type: str = "percentage"  # percentage or fixed
    discount_value: float
    min_order_amount: float = 0.0
    max_discount: Optional[float] = None
    expiry_date: datetime
    usage_limit: int = 500

class CouponCreate(CouponBase):
    merchant_id: str

class CouponUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_discount: Optional[float] = None
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class CouponResponse(CouponBase):
    id: str
    merchant_id: str
    merchant_name: Optional[str] = None
    times_used: int = 0
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    coupon_id: str
    cart_amount: float

class CouponValidateResponse(BaseModel):
    is_eligible: bool
    coupon: CouponResponse
    cart_amount: float
    discount_amount: float
    final_amount: float
    message: str

# --- AI Recommendation Schemas ---
class RecommendationItem(BaseModel):
    id: str
    coupon: CouponResponse
    match_score: float  # 0 to 100
    rank: int
    rationale: str
    category_relevance: float
    savings_potential_estimate: float
    attraction_tag: Optional[str] = None  # e.g., "Top Match for your Food Delivery Habit"

class RecommendationResponse(BaseModel):
    customer_id: str
    persona: str
    recommendations: List[RecommendationItem]
    model_version: str = "v1.2-hybrid-ranking"
    explanation_source: str = "AI Engine (Gemini / Rule Hybrid)"

class RecommendationEventLog(BaseModel):
    coupon_id: str
    event_type: str  # impression, click, apply, checkout_init, checkout_success
    metadata: Optional[Dict[str, Any]] = None

# --- PayPal Checkout Schemas ---
class PayPalCreateOrderRequest(BaseModel):
    coupon_id: Optional[str] = None
    original_amount: float
    currency: str = "USD"  # PayPal Sandbox standard
    merchant_name: Optional[str] = "PayPal SmartRewards Merchant"
    item_description: Optional[str] = "Eligible purchase with SmartRewards coupon"

class PayPalCreateOrderResponse(BaseModel):
    order_id: str
    status: str
    original_amount: float
    discount_amount: float
    final_amount: float
    currency: str
    approve_url: Optional[str] = None
    coupon_code: Optional[str] = None

class PayPalCaptureOrderRequest(BaseModel):
    order_id: str

class PayPalCaptureOrderResponse(BaseModel):
    success: bool
    order_id: str
    capture_id: Optional[str] = None
    status: str
    final_amount: float
    discount_saved: float
    currency: str
    payer_email: Optional[str] = None
    message: str

# --- Merchant Portal Schemas ---
class MerchantStatsResponse(BaseModel):
    merchant_id: str
    business_name: str
    category: str
    active_coupons_count: int
    total_redemptions: int
    total_sales_generated: float
    total_discounts_given: float
    conversion_rate: float
    recent_redemptions: List[Dict[str, Any]]

# --- Admin Analytics Schemas ---
class AdminPlatformStats(BaseModel):
    total_users: int
    total_merchants: int
    total_coupons: int
    total_transactions: int
    total_redemptions: int
    total_volume_processed: float
    total_customer_savings: float
    paypal_conversion_rate: float
    ai_recommendation_click_through_rate: float

class CohortComparisonItem(BaseModel):
    cohort_name: str
    sample_size: int
    redemption_rate: float
    avg_order_value: float
    paypal_retention_lift: float

# --- Agentic Commerce Schemas ---
class AgentChatRequest(BaseModel):
    message: str
    customer_id: Optional[str] = None

class DealProposal(BaseModel):
    coupon_id: str
    coupon_title: str
    merchant_name: str
    original_price: float
    discount_amount: float
    final_price: float
    savings_percentage: float
    rationale: str

class AgentChatResponse(BaseModel):
    reply: str
    suggested_deals: List[DealProposal] = []
    action_type: Optional[str] = None  # "OFFER_RECOMMENDATION", "CHECKOUT_PROMPT", "INFO"
    order_intent: Optional[Dict[str, Any]] = None


# --- Rewards for Good Schemas ---
class DonationBeneficiaryResponse(BaseModel):
    id: str
    name: str
    category: str
    description: str
    impact_summary: Optional[str] = None
    logo_url: Optional[str] = None
    paypal_charity_id: Optional[str] = None
    hosted_button_id: Optional[str] = None
    total_received: float = 0.0
    donor_count: int = 0
    is_active: bool = True

    class Config:
        from_attributes = True

class CustomerRewardBalanceResponse(BaseModel):
    customer_id: str
    available_reward_points: float
    total_donated: float
    total_cash_redeemed: float
    currency: str = "INR"
    last_updated: datetime

class DonationContributeRequest(BaseModel):
    customer_id: str
    beneficiary_id: str
    amount: float = Field(..., gt=0, description="Voluntary donation amount must be positive")
    currency: str = "INR"
    customer_consent: bool = Field(..., description="Customer must explicitly consent")
    source_type: str = "reward_balance"
    idempotency_key: Optional[str] = None

class CashConversionRequest(BaseModel):
    customer_id: str
    amount_to_redeem: float = Field(..., gt=0, description="Amount of rewards to convert into cash")
    donation_amount: float = Field(default=0.0, ge=0, description="Optional voluntary donation amount")
    beneficiary_id: Optional[str] = None
    customer_consent: bool = False
    currency: str = "INR"

class DonationReceiptResponse(BaseModel):
    success: bool
    receipt_id: str
    customer_id: str
    beneficiary_id: Optional[str] = None
    beneficiary_name: Optional[str] = None
    donation_amount: float = 0.0
    cash_redeemed: float = 0.0
    remaining_balance: float
    currency: str = "INR"
    source_type: str
    paypal_reference_id: str
    status: str
    timestamp: datetime
    message: str

class SocialImpactBeneficiaryStat(BaseModel):
    beneficiary_id: str
    name: str
    category: str
    total_received: float
    donor_count: int
    percentage_of_total: float

class SocialImpactRecentDonation(BaseModel):
    id: str
    customer_name: str
    beneficiary_name: str
    amount: float
    currency: str
    source_type: str
    paypal_reference_id: str
    timestamp: datetime

class SocialImpactStatsResponse(BaseModel):
    total_donated: float
    total_donors_count: int
    avg_donation_amount: float
    currency: str = "INR"
    beneficiaries: List[SocialImpactBeneficiaryStat]
    recent_donations: List[SocialImpactRecentDonation]


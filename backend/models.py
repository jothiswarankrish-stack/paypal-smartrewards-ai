import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="customer")  # customer, merchant, admin
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False)
    merchant = relationship("Merchant", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="customer")
    recommendations = relationship("Recommendation", back_populates="customer")
    redemptions = relationship("CouponRedemption", back_populates="customer")
    orders = relationship("PayPalOrder", back_populates="customer")
    donations = relationship("RewardDonation", back_populates="customer")


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    persona_name = Column(String(100), nullable=False)  # Food Enthusiast, Frequent Commuter, Online Shopper
    persona_description = Column(Text, nullable=True)
    monthly_budget = Column(Float, default=15000.0)
    preferred_payment_method = Column(String(50), default="paypal")
    available_reward_points = Column(Float, default=500.0)
    total_donated = Column(Float, default=0.0)
    total_cash_redeemed = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="customer_profile")


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    business_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # food, taxi, shopping, entertainment, travel, groceries
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    commission_rate = Column(Float, default=5.0)  # percentage
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="merchant")
    coupons = relationship("Coupon", back_populates="merchant")


class TransactionCategory(Base):
    __tablename__ = "transaction_categories"

    id = Column(String(50), primary_key=True)  # food, taxi, shopping, entertainment, travel, groceries
    name = Column(String(100), nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    merchant_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    payment_channel = Column(String(50), default="paypal")  # paypal, upi, card
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_synthetic = Column(Boolean, default=True)

    customer = relationship("User", back_populates="transactions")


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    merchant_id = Column(String(36), ForeignKey("merchants.id"), nullable=False, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    discount_type = Column(String(20), default="percentage")  # percentage, fixed
    discount_value = Column(Float, nullable=False)  # e.g., 20 (%) or 150 (INR)
    min_order_amount = Column(Float, default=0.0)
    max_discount = Column(Float, nullable=True)
    start_date = Column(DateTime, default=datetime.utcnow)
    expiry_date = Column(DateTime, nullable=False)
    usage_limit = Column(Integer, default=500)
    times_used = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="coupons")
    recommendations = relationship("Recommendation", back_populates="coupon")
    redemptions = relationship("CouponRedemption", back_populates="coupon")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    coupon_id = Column(String(36), ForeignKey("coupons.id"), nullable=False, index=True)
    match_score = Column(Float, nullable=False)  # 0.0 to 1.0 (or 0 to 100%)
    rationale = Column(Text, nullable=False)
    rank = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("User", back_populates="recommendations")
    coupon = relationship("Coupon", back_populates="recommendations")


class RecommendationEvent(Base):
    __tablename__ = "recommendation_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    coupon_id = Column(String(36), ForeignKey("coupons.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # impression, click, apply, checkout_init, checkout_success
    metadata_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class PayPalOrder(Base):
    __tablename__ = "paypal_orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    paypal_order_id = Column(String(255), unique=True, index=True, nullable=False)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    coupon_id = Column(String(36), ForeignKey("coupons.id"), nullable=True)
    original_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    final_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="CREATED")  # CREATED, APPROVED, COMPLETED, CANCELLED, FAILED
    capture_id = Column(String(255), nullable=True)
    payer_email = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("User", back_populates="orders")
    coupon = relationship("Coupon")
    redemption = relationship("CouponRedemption", back_populates="paypal_order", uselist=False)


class CouponRedemption(Base):
    __tablename__ = "coupon_redemptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    coupon_id = Column(String(36), ForeignKey("coupons.id"), nullable=False, index=True)
    paypal_order_id = Column(String(36), ForeignKey("paypal_orders.id"), nullable=True)
    amount_saved = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    redeemed_at = Column(DateTime, default=datetime.utcnow, index=True)

    customer = relationship("User", back_populates="redemptions")
    coupon = relationship("Coupon", back_populates="redemptions")
    paypal_order = relationship("PayPalOrder", back_populates="redemption")


class CustomerSavings(Base):
    __tablename__ = "customer_savings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    total_saved = Column(Float, default=0.0)
    redemption_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DonationBeneficiary(Base):
    __tablename__ = "donation_beneficiaries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # homeless, children, education, hunger
    description = Column(Text, nullable=False)
    impact_summary = Column(Text, nullable=True)  # e.g., "₹25 provides 1 nutritious hot meal to a child"
    logo_url = Column(String(500), nullable=True)
    paypal_charity_id = Column(String(100), nullable=True)
    hosted_button_id = Column(String(100), nullable=True)  # Official PayPal Donate SDK Hosted Button ID
    total_received = Column(Float, default=0.0)
    donor_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    donations = relationship("RewardDonation", back_populates="beneficiary")


class RewardDonation(Base):
    __tablename__ = "reward_donations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    customer_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    beneficiary_id = Column(String(36), ForeignKey("donation_beneficiaries.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    source_type = Column(String(50), default="reward_balance")  # reward_balance, cash_conversion, coupon_checkout
    customer_consent = Column(Boolean, default=True, nullable=False)
    paypal_reference_id = Column(String(100), unique=True, index=True, nullable=False)
    status = Column(String(50), default="COMPLETED")  # COMPLETED, PENDING, FAILED
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    customer = relationship("User", back_populates="donations")
    beneficiary = relationship("DonationBeneficiary", back_populates="donations")


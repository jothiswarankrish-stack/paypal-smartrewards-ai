-- ====================================================================
-- PayPal SmartRewards AI - Supabase PostgreSQL Schema Migration
-- Hackathon: PayPal AI Hackathon 2026
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Transaction Categories
CREATE TABLE IF NOT EXISTS transaction_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50)
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'admin')),
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Customer Profiles
CREATE TABLE IF NOT EXISTS customer_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    persona_name VARCHAR(100) NOT NULL,
    persona_description TEXT,
    monthly_budget NUMERIC(12, 2) DEFAULT 15000.00,
    preferred_payment_method VARCHAR(50) DEFAULT 'paypal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    commission_rate NUMERIC(5, 2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Transactions Table (Historical 30-Day Customer Transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    customer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    merchant_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_channel VARCHAR(50) DEFAULT 'paypal',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_synthetic BOOLEAN DEFAULT true
);

-- 7. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    merchant_id VARCHAR(36) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 0.00,
    max_discount NUMERIC(10, 2),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INT DEFAULT 500,
    times_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. AI Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    customer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coupon_id VARCHAR(36) NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2) NOT NULL,
    rationale TEXT NOT NULL,
    rank INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Recommendation Events (Impression, Click, Apply)
CREATE TABLE IF NOT EXISTS recommendation_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    customer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coupon_id VARCHAR(36) NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    metadata_json TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. PayPal Orders Table
CREATE TABLE IF NOT EXISTS paypal_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    paypal_order_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coupon_id VARCHAR(36) REFERENCES coupons(id) ON DELETE SET NULL,
    original_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    final_amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'CREATED',
    capture_id VARCHAR(255),
    payer_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Coupon Redemptions
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    customer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coupon_id VARCHAR(36) NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    paypal_order_id VARCHAR(36) REFERENCES paypal_orders(id) ON DELETE SET NULL,
    amount_saved NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Customer Savings Aggregate Table
CREATE TABLE IF NOT EXISTS customer_savings (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    customer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    total_saved NUMERIC(12, 2) DEFAULT 0.00,
    redemption_count INT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- Indexes for Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_coupons_category ON coupons(category);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_recommendations_customer ON recommendations(customer_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_events_customer ON recommendation_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_paypal_orders_order_id ON paypal_orders(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_customer ON coupon_redemptions(customer_id);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE paypal_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Read policies for public demo & authenticated access
CREATE POLICY "Public read for coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Users read own profile" ON customer_profiles FOR SELECT USING (true);
CREATE POLICY "Users read own transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Users read own recommendations" ON recommendations FOR SELECT USING (true);

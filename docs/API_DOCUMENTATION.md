# API Documentation — PayPal SmartRewards AI

**Base URL**: `http://localhost:8000`  
**Swagger / Interactive OpenAPI Docs**: `http://localhost:8000/docs`  
**ReDoc**: `http://localhost:8000/redoc`  
**Version**: 2.0.0  

---

## 1. Authentication & Demo Personas

### 1.1 One-Click Persona Switcher
* **Endpoint**: `POST /api/auth/demo-login/{persona}`
* **Description**: Instant authentication switcher between synthetic customer profiles, merchant, and admin.
* **Path Parameters**:
  - `persona`: `customer_a`, `customer_b`, `customer_c`, `customer_d`, `customer_e`, `merchant`, `admin`
* **Response (200 OK)**:
```json
{
  "access_token": "demo_token_for_user-cust-a-001",
  "token_type": "bearer",
  "user": {
    "id": "user-cust-a-001",
    "email": "customer.a@smartrewards.ai",
    "full_name": "Ananya Sharma",
    "role": "customer",
    "created_at": "2026-11-09T12:00:00Z",
    "customer_profile": {
      "persona_name": "Food Delivery Enthusiast",
      "persona_description": "Spends predominantly on Swiggy & Zomato (₹6,000/mo)",
      "monthly_budget": 16000.0,
      "preferred_payment_method": "paypal"
    }
  }
}
```

---

## 2. Customer Insights & Transactions

### 2.1 Get 30-Day Spending Insights
* **Endpoint**: `GET /api/customer/insights/{customer_id}`
* **Description**: Aggregates the last 30 days of transactions into category breakdowns, detects the #1 spending vertical, and calculates verified cumulative savings.
* **Response (200 OK)**:
```json
{
  "customer_id": "user-cust-a-001",
  "customer_name": "Ananya Sharma",
  "persona_name": "Food Delivery Enthusiast",
  "total_spent_30d": 11140.50,
  "currency": "INR",
  "highest_category": "food",
  "category_breakdown": [
    {
      "category": "food",
      "total_amount": 6140.50,
      "transaction_count": 12,
      "percentage": 55.1,
      "top_merchant": "Swiggy Gourmet"
    },
    {
      "category": "taxi",
      "total_amount": 2980.00,
      "transaction_count": 8,
      "percentage": 26.7,
      "top_merchant": "Uber Premier"
    },
    {
      "category": "shopping",
      "total_amount": 2020.00,
      "transaction_count": 3,
      "percentage": 18.1,
      "top_merchant": "Amazon Pay Deals"
    }
  ],
  "total_savings_lifetime": 570.00
}
```

---

## 3. AI Personalized Recommendations

### 3.1 Get Scored Recommendations
* **Endpoint**: `GET /api/recommendations/{customer_id}`
* **Description**: Runs Scikit-learn + RFM category affinity scoring on customer transactions, generates natural language explanations, logs impression events, and returns ranked coupons.
* **Response (200 OK)**:
```json
{
  "customer_id": "user-cust-a-001",
  "persona": "Food Delivery Enthusiast",
  "recommendations": [
    {
      "id": "rec-user-cust-a-001-coup-swiggy-25",
      "coupon": {
        "id": "coup-swiggy-25",
        "merchant_name": "Swiggy Gourmet",
        "code": "SWIGGYFEAST25",
        "title": "25% OFF on Swiggy Gourmet with PayPal",
        "category": "food",
        "discount_type": "percentage",
        "discount_value": 25.0,
        "min_order_amount": 400.0,
        "max_discount": 180.0
      },
      "match_score": 93.4,
      "rank": 1,
      "rationale": "Food Delivery & Dining is your #1 spending category, accounting for 55.1% (₹6,141 across 12 orders) of your last 30 days. We selected this exclusive Swiggy Gourmet offer to give you the highest immediate savings when paying through PayPal Sandbox.",
      "category_relevance": 55.1,
      "savings_potential_estimate": 150.0,
      "attraction_tag": "Top Pick: Matches your #1 spending category (Food)"
    }
  ],
  "model_version": "v2.1-hybrid-rfm-cosine",
  "explanation_source": "SmartRewards Hybrid Explainer (Gemini / High-Precision Structured)"
}
```

---

## 4. Coupons & Eligibility

### 4.1 Validate Coupon & Calculate Discount
* **Endpoint**: `POST /api/coupons/validate`
* **Body**:
```json
{
  "coupon_id": "coup-swiggy-25",
  "cart_amount": 600.00
}
```
* **Response (200 OK)**:
```json
{
  "is_eligible": true,
  "coupon": { "code": "SWIGGYFEAST25", "discount_value": 25.0 },
  "cart_amount": 600.00,
  "discount_amount": 150.00,
  "final_amount": 450.00,
  "message": "Coupon applied successfully! Proceed to PayPal Checkout."
}
```

---

## 5. PayPal Sandbox Integration

### 5.1 Create PayPal Order
* **Endpoint**: `POST /api/paypal/create-order?customer_id={customer_id}`
* **Body**:
```json
{
  "coupon_id": "coup-swiggy-25",
  "original_amount": 500.00,
  "currency": "USD"
}
```
* **Response (200 OK)**:
```json
{
  "order_id": "ORDER-SANDBOX-B49581A077",
  "status": "CREATED",
  "original_amount": 500.00,
  "discount_amount": 125.00,
  "final_amount": 375.00,
  "currency": "USD",
  "approve_url": "https://www.sandbox.paypal.com/checkoutnow?token=ORDER-SANDBOX-B49581A077",
  "coupon_code": "SWIGGYFEAST25"
}
```

### 5.2 Capture PayPal Order & Confirm Redemption
* **Endpoint**: `POST /api/paypal/capture-order`
* **Body**:
```json
{
  "order_id": "ORDER-SANDBOX-B49581A077"
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "order_id": "ORDER-SANDBOX-B49581A077",
  "capture_id": "CAPTURE-SANDBOX-E53F9C110A14",
  "status": "COMPLETED",
  "final_amount": 375.00,
  "discount_saved": 125.00,
  "currency": "USD",
  "payer_email": "sandbox-buyer@smartrewards.ai",
  "message": "Payment captured and verified successfully with PayPal Sandbox!"
}
```

---

## 6. Agentic Commerce Copilot

### 6.1 Process Natural Language Deal Request
* **Endpoint**: `POST /api/agent/chat`
* **Body**:
```json
{
  "message": "I want to order dinner for ₹500",
  "customer_id": "user-cust-a-001"
}
```
* **Response (200 OK)**:
```json
{
  "reply": "I found the best deal for your budget! At Swiggy Gourmet, you can use '25% OFF on Swiggy Gourmet with PayPal' to pay ₹375 instead of ₹500 (saving ₹125 / 25.0%). Would you like me to prepare this order for your PayPal approval?",
  "suggested_deals": [
    {
      "coupon_id": "coup-swiggy-25",
      "coupon_title": "25% OFF on Swiggy Gourmet with PayPal",
      "merchant_name": "Swiggy Gourmet",
      "original_price": 500.0,
      "discount_amount": 125.0,
      "final_price": 375.0,
      "savings_percentage": 25.0,
      "rationale": "Saves ₹125 (25.0% off) on a ₹500 order at Swiggy Gourmet."
    }
  ],
  "action_type": "CHECKOUT_PROMPT",
  "order_intent": {
    "coupon_id": "coup-swiggy-25",
    "final_amount": 375.0,
    "currency": "USD"
  }
}
```

---

## 7. AG Grid Enterprise Table Endpoints
* `GET /api/analytics/spending-grid` – Returns 30-day transaction logs with customer, merchant, and category columns.
* `GET /api/analytics/coupons-grid` – Returns coupon inventory with usage caps and redemption velocity.
* `GET /api/analytics/redemptions-grid` – Returns verified PayPal redemption audit trail with Capture IDs.
* `GET /api/analytics/merchants-grid` – Returns merchant ecosystem data with active offer counts.

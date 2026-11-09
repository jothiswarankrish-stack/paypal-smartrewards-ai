# Testing Guide & Quality Assurance — PayPal SmartRewards AI

**Project**: PayPal SmartRewards AI  
**Event**: PayPal AI Hackathon 2026  
**Test Suite**: Pytest (Automated Backend) + Manual Sandbox Verification  

---

## 1. Automated Backend Test Suite

The automated test suite tests 10 core integration scenarios:

| Test Case | Method | Description |
| :--- | :--- | :--- |
| `test_health_check` | GET `/` | Verifies backend status is online and responsive |
| `test_demo_login_switchers` | POST `/api/auth/demo-login/{p}` | Tests 1-click persona switching for Customers A, B, C, D, E, Merchant, and Admin |
| `test_spending_insights_customer_a` | GET `/api/customer/insights/{id}` | Verifies Customer A has Food Delivery as highest category (₹6k+) |
| `test_spending_insights_customer_b` | GET `/api/customer/insights/{id}` | Verifies Customer B has Taxi/Commute as highest category (₹7k+) |
| `test_spending_insights_customer_c` | GET `/api/customer/insights/{id}` | Verifies Customer C has Online Shopping as highest category (₹8k+) |
| `test_ai_recommendations_differentiation` | GET `/api/recommendations/{id}` | **Core ML Verification**: Customer A gets food coupons, B gets taxi coupons, C gets shopping coupons |
| `test_coupon_validation_and_decimal_discount` | POST `/api/coupons/validate` | Validates minimum order constraints and Decimal-precise discount calculations |
| `test_paypal_order_lifecycle_end_to_end` | POST `/api/paypal/create-order` + `capture-order` | Tests order creation, simulated capture, database updates, and capture idempotency |
| `test_agentic_commerce_copilot` | POST `/api/agent/chat` | Verifies NLP intent parsing, budget filtering, and pre-approved checkout generation |
| `test_ag_grid_analytics_endpoints` | GET `/api/analytics/*-grid` | Verifies tabular dataset formatting for AG Grid Community |

### Executing the Tests
From the project root:
```bash
backend\venv\Scripts\pytest.exe backend/tests/test_smartrewards.py -v
```

Expected result:
```
======================= 10 passed in 4.11s =======================
```

---

## 2. End-to-End Demonstration Workflow

### Scenario: Customer A (Foodie)
1. Switch to **Customer A** (`customer.a@smartrewards.ai`).
2. Dashboard computes 30-day spending: Food Delivery ₹6,140 (55.1%).
3. AI Recommendation Engine curates **Swiggy Gourmet (25% OFF)** as the #1 match with 93.4% affinity.
4. Rationale explains: *"Food Delivery & Dining is your #1 spending category, accounting for 55.1%..."*
5. Customer clicks **"Redeem with PayPal"** on the Swiggy card.
6. Checkout modal displays:
   - Original Price: ₹500.00
   - Swiggy 25% Discount: -₹125.00
   - Final Amount Payable: ₹375.00
7. Customer clicks **PayPal Checkout** (Sandbox).
8. Order is captured on the server and verified.
9. Verified Receipt displays with Capture ID and confirms redemption.
10. Customer Lifetime Savings updates immediately.

### Scenario: Customer B (Commuter)
1. Switch to **Customer B** (`customer.b@smartrewards.ai`).
2. Dashboard computes 30-day spending: Taxi & Mobility ₹7,120 (71.2%).
3. AI Recommendation Engine curates **Uber Premier & Commute (30% OFF)** as the #1 match.
4. Confirms that recommendations are 100% data-driven and distinct.

### Scenario: Agentic Commerce AI Copilot
1. Open the **Agentic Commerce Assistant** drawer.
2. Type: `"I want food for ₹500"`.
3. AI extracts: Category = `food`, Budget = `500.0`.
4. AI scans active coupons, calculates net savings, and proposes the top deal with a one-click **"Approve & Pay with PayPal"** button.

---

## 3. Manual PayPal Sandbox Credentials Setup (Optional)

To test with your own PayPal Developer account:
1. Log into [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
2. Create or select a Sandbox REST App.
3. Copy **Client ID** and **Secret Key**.
4. Set in `backend/.env`:
   ```env
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_secret
   PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
   ```
5. When checking out, use a Sandbox Buyer Account (e.g., `personal-buyer@sandbox.paypal.com`) with the sandbox test password.

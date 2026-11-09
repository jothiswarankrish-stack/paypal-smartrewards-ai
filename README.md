# PayPal SmartRewards AI
### AI-Powered Personalized Coupon Recommendation & Payment Engagement Platform

[![PayPal AI Hackathon 2026](https://img.shields.io/badge/PayPal_AI_Hackathon-2026-003087?style=for-the-badge&logo=paypal)](https://paypalaihackathon.devpost.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![AG Grid](https://img.shields.io/badge/AG_Grid-Community-purple?style=for-the-badge)](https://www.ag-grid.com)

---

## 1. Executive Summary & Prize Targets

Traditional coupon systems blast identical, generic discounts to everyone, causing coupon fatigue and low redemption rates. **PayPal SmartRewards AI** transforms merchant promotions by mathematically analyzing each customer's previous 30 days of transaction history, identifying their spending behavior (Food, Commute, Shopping, Groceries, Entertainment, Travel), and recommending relevant, high-yield coupons redeemable through the **PayPal Developer Platform**.

### Targeted Prize Categories:
1. **Best Use of PayPal + AI ($5,000)** – Machine learning feature vectors (RFM analysis + Cosine affinity) drive checkout intent, while official server-to-server **PayPal Orders API v2** creates, approves, and captures payments.
2. **Most Impactful ($5,000)** – Delivers tangible, verified financial savings to consumers while increasing repeat checkout volume and customer retention for merchants.
3. **Best Use of AG Grid ($5,000)** – Seamless integration of AG Grid Community tables for Customer Spending Ledgers, Coupon Redemption Velocity, Verified Audit Trails, and Merchant Metrics with live filtering, sorting, and CSV export.
4. **Best Use of Agentic Commerce (Bonus Prize Opportunity)** – Autonomous AI Copilot: users ask in natural language (*"I want food for ₹500"*), the agent parses budget and intent, compares merchant offers, calculates net discounts, and prepares pre-approved PayPal checkout.

---

## 2. Real Customer Differentiation

| Customer Profile | 30-Day Spending Profile | Primary Vertical | AI Model Recommendation | Top Merchant Reward |
| :--- | :--- | :--- | :--- | :--- |
| **Customer A (Ananya Sharma)** | Food: ₹6,000 \| Taxi: ₹3,000 \| Shopping: ₹2,000 | Food Delivery (55%) | **Food Delivery Offers** | Swiggy Gourmet (25% OFF) |
| **Customer B (Rohan Verma)** | Food: ₹1,000 \| Taxi: ₹7,000 \| Shopping: ₹2,000 | Taxi & Mobility (70%) | **Commute & Mobility** | Uber Premier & Cab (30% OFF) |
| **Customer C (Priya Nair)** | Food: ₹1,500 \| Taxi: ₹1,000 \| Shopping: ₹8,000 | Online Shopping (76%) | **Fashion & Electronics** | Myntra Fashion Clearance (35% OFF) |
| **Customer D (Rajesh Kumar)** | Groceries: ₹6,500 \| Shopping: ₹1,500 | Quick Commerce (62%) | **Daily Essentials** | Blinkit / Zepto SuperSaver |
| **Customer E (Sneha Patel)** | Travel: ₹5,000 \| Cinema: ₹2,500 | Travel & Cinema (68%) | **Getaways & Tickets** | MakeMyTrip (12% Flight OFF) |

> **Synthetic Data Notice**: All customer histories used in this demonstration are synthetically generated for benchmark evaluation. The application does not claim or require access to private third-party wallet or bank transaction records.

---

## 3. High-Level Architecture

```
+--------------------------------------------------------------------------------------------------+
|                                  NEXT.JS FRONTEND (React 18 / TS / Tailwind)                     |
|                                                                                                  |
|  [1-Click Persona Switcher]  [Spending Insights]  [AI Recs Feed]  [AG Grid Analytics]  [Copilot] |
|                                           |                                                      |
|                             [PayPal Smart Payment Buttons]                                       |
+-------------------------------------------|------------------------------------------------------+
                                            | REST API (JSON)
                                            v
+--------------------------------------------------------------------------------------------------+
|                                    FASTAPI BACKEND (Python 3.12)                                 |
|                                                                                                  |
|   /api/auth        /api/customer     /api/coupons     /api/recommendations     /api/paypal       |
|       |                 |               |                     |                    |             |
|   [Persona Auth]   [Insights API]  [Eligibility]     [AI Engine & Ranking]  [Orders v2 Client]   |
|                                                               |                    |             |
|                                                    [Scikit-learn / RFM]     OAuth2 Token Cache   |
|                                                    [LLM Explainer API]      Server Order Create  |
|                                                    [Attraction Intel]       Capture Verification |
+---------------------------------------------------------------|--------------------+-------------+
                                                                |                    |
                                 +------------------------------+                    |
                                 |                                                   |
                                 v                                                   v
+---------------------------------------------------+    +-----------------------------------------+
|        DATABASE LAYER (PostgreSQL / Supabase)      |    |      PAYPAL DEVELOPER PLATFORM          |
|                                                   |    |           (Sandbox v2 API)              |
|  users               merchants      coupons       |    |                                         |
|  customer_profiles   transactions   redemptions   |    |  POST /v1/oauth2/token                  |
|  recommendations     paypal_orders  savings       |    |  POST /v2/checkout/orders               |
|                                                   |    |  POST /v2/checkout/orders/{id}/capture  |
+---------------------------------------------------+    +-----------------------------------------+
```

---

## 4. PayPal Sandbox Payment Flow

1. **Coupon Selection**: Customer clicks *"Redeem with PayPal"* on an AI-recommended or marketplace offer.
2. **Server-Side Validation**: Backend calculates exact discount using safe `Decimal` arithmetic, validating minimum spend and caps.
3. **Order Creation**: Backend calls PayPal Orders API v2: `POST /v2/checkout/orders` with itemized discounts and creates database record with status `CREATED`.
4. **Customer Approval**: PayPal Sandbox modal opens for buyer approval.
5. **Verified Payment Capture**: Backend calls `POST /v2/checkout/orders/{id}/capture`. Payment status is verified directly against PayPal.
6. **Atomic Settlement**: Order status is marked `COMPLETED`, coupon redemption is recorded, coupon `times_used` is incremented, and customer savings ledger is updated.
7. **Idempotency Protection**: Repeated capture attempts return the existing completed receipt without double charges or duplicate redemptions.

---

## 5. Quickstart & Local Setup

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ (Node 24 verified)
- Git

### 1. Clone & Set Up Backend
```bash
# From repository root
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed synthetic database (5 customer cohorts, 10 merchants, 21 coupons)
python seed_data.py

# Launch FastAPI backend (runs on http://localhost:8000)
python main.py
```

### 2. Set Up Frontend
```bash
# In a new terminal from repository root
cd frontend

# Install npm dependencies
npm install

# Start Next.js development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser. The backend API documentation is accessible at **`http://localhost:8000/docs`**.

---

## 6. Automated Testing

Run the automated test suite verifying all 10 core integration flows:
```bash
backend\venv\Scripts\pytest.exe backend/tests/test_smartrewards.py -v
```

Expected result:
```
backend/tests/test_smartrewards.py::test_health_check PASSED             [ 10%]
backend/tests/test_smartrewards.py::test_demo_login_switchers PASSED     [ 20%]
backend/tests/test_smartrewards.py::test_spending_insights_customer_a PASSED [ 30%]
backend/tests/test_smartrewards.py::test_spending_insights_customer_b PASSED [ 40%]
backend/tests/test_smartrewards.py::test_spending_insights_customer_c PASSED [ 50%]
backend/tests/test_smartrewards.py::test_ai_recommendations_differentiation PASSED [ 60%]
backend/tests/test_smartrewards.py::test_coupon_validation_and_decimal_discount PASSED [ 70%]
backend/tests/test_smartrewards.py::test_paypal_order_lifecycle_end_to_end PASSED [ 80%]
backend/tests/test_smartrewards.py::test_agentic_commerce_copilot PASSED [ 90%]
backend/tests/test_smartrewards.py::test_ag_grid_analytics_endpoints PASSED [100%]

======================= 10 passed in 4.11s =======================
```

---

## 7. Documentation Index

- [Open-Source Repository Audit](docs/OPEN_SOURCE_REPOSITORY_AUDIT.md)
- [System Architecture](docs/ARCHITECTURE.md)
- [Database Schema & ERD](docs/DATABASE_SCHEMA.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Testing & Sandbox Guide](docs/TESTING.md)
- [3-Minute Demo Video Script](docs/DEMO_VIDEO_SCRIPT.md)

---

## 8. License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

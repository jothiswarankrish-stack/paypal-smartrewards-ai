import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models
from recommendation.engine import RecommendationEngine
from recommendation.agentic_commerce import AgenticCommerceEngine
from paypal_service import paypal_service

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "PayPal SmartRewards AI"
    assert data["status"] == "online"

def test_demo_login_switchers():
    """Verify 1-click persona switching for all 5 customer profiles, merchant, and admin."""
    personas = ["customer_a", "customer_b", "customer_c", "customer_d", "customer_e", "merchant", "admin"]
    for p in personas:
        resp = client.post(f"/api/auth/demo-login/{p}")
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] is not None

def test_spending_insights_customer_a():
    """Customer A must have food delivery as their highest spending category."""
    resp = client.get("/api/customer/insights/user-cust-a-001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["customer_id"] == "user-cust-a-001"
    assert data["highest_category"] == "food"
    assert data["total_spent_30d"] > 9000

def test_spending_insights_customer_b():
    """Customer B must have taxi as their highest spending category."""
    resp = client.get("/api/customer/insights/user-cust-b-002")
    assert resp.status_code == 200
    data = resp.json()
    assert data["customer_id"] == "user-cust-b-002"
    assert data["highest_category"] == "taxi"

def test_spending_insights_customer_c():
    """Customer C must have shopping as their highest spending category."""
    resp = client.get("/api/customer/insights/user-cust-c-003")
    assert resp.status_code == 200
    data = resp.json()
    assert data["customer_id"] == "user-cust-c-003"
    assert data["highest_category"] == "shopping"

def test_ai_recommendations_differentiation():
    """
    Core AI Acceptance Criteria:
    Customer A must receive food delivery coupons as top recommendation.
    Customer B must receive taxi coupons as top recommendation.
    Customer C must receive shopping coupons as top recommendation.
    """
    # Customer A
    resp_a = client.get("/api/recommendations/user-cust-a-001")
    assert resp_a.status_code == 200
    recs_a = resp_a.json()["recommendations"]
    assert len(recs_a) > 0
    assert recs_a[0]["coupon"]["category"] == "food"
    assert recs_a[0]["match_score"] >= 80.0
    assert "food" in recs_a[0]["rationale"].lower() or "swiggy" in recs_a[0]["rationale"].lower() or "zomato" in recs_a[0]["rationale"].lower()

    # Customer B
    resp_b = client.get("/api/recommendations/user-cust-b-002")
    assert resp_b.status_code == 200
    recs_b = resp_b.json()["recommendations"]
    assert len(recs_b) > 0
    assert recs_b[0]["coupon"]["category"] == "taxi"
    assert recs_b[0]["match_score"] >= 80.0
    assert "taxi" in recs_b[0]["rationale"].lower() or "uber" in recs_b[0]["rationale"].lower() or "commute" in recs_b[0]["rationale"].lower()

    # Customer C
    resp_c = client.get("/api/recommendations/user-cust-c-003")
    assert resp_c.status_code == 200
    recs_c = resp_c.json()["recommendations"]
    assert len(recs_c) > 0
    assert recs_c[0]["coupon"]["category"] == "shopping"
    assert recs_c[0]["match_score"] >= 80.0
    assert "shopping" in recs_c[0]["rationale"].lower() or "fashion" in recs_c[0]["rationale"].lower() or "myntra" in recs_c[0]["rationale"].lower()

def test_coupon_validation_and_decimal_discount():
    """Test server-side discount calculation with Decimal precision."""
    # Percentage coupon (SWIGGYFEAST25: 25% off min 400, max 180)
    resp = client.post("/api/coupons/validate", json={
        "coupon_id": "coup-swiggy-25",
        "cart_amount": 600.0
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_eligible"] is True
    # 25% of 600 = 150.0 <= max 180
    assert data["discount_amount"] == 150.0
    assert data["final_amount"] == 450.0

    # Below min purchase amount check
    resp_below = client.post("/api/coupons/validate", json={
        "coupon_id": "coup-swiggy-25",
        "cart_amount": 250.0
    })
    assert resp_below.status_code == 200
    assert resp_below.json()["is_eligible"] is False
    assert "below minimum purchase" in resp_below.json()["message"].lower()

def test_paypal_order_lifecycle_end_to_end():
    """
    Test complete PayPal Sandbox payment flow:
    1. Create Order
    2. Capture Order
    3. Verify Payment and database updates
    """
    # 1. Create order
    create_resp = client.post(
        "/api/paypal/create-order?customer_id=user-cust-a-001",
        json={
            "coupon_id": "coup-swiggy-25",
            "original_amount": 500.0,
            "currency": "USD"
        }
    )
    assert create_resp.status_code == 200
    order_data = create_resp.json()
    order_id = order_data["order_id"]
    assert order_id is not None
    assert order_data["discount_amount"] == 125.0  # 25% of 500
    assert order_data["final_amount"] == 375.0

    # 2. Capture order
    capture_resp = client.post(
        "/api/paypal/capture-order",
        json={"order_id": order_id}
    )
    assert capture_resp.status_code == 200
    cap_data = capture_resp.json()
    assert cap_data["success"] is True
    assert cap_data["status"] == "COMPLETED"
    assert cap_data["capture_id"] is not None

    # 3. Idempotency test: Re-capturing same order returns existing completed status cleanly
    recapture_resp = client.post(
        "/api/paypal/capture-order",
        json={"order_id": order_id}
    )
    assert recapture_resp.status_code == 200
    assert recapture_resp.json()["status"] == "COMPLETED"

def test_agentic_commerce_copilot():
    """Test Agentic Commerce intent parsing and deal discovery."""
    resp = client.post("/api/agent/chat", json={
        "message": "I want to order food for ₹500",
        "customer_id": "user-cust-a-001"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["action_type"] == "CHECKOUT_PROMPT"
    assert len(data["suggested_deals"]) > 0
    assert data["order_intent"] is not None
    assert "Swiggy" in data["reply"] or "Zomato" in data["reply"] or "food" in data["reply"].lower()

def test_ag_grid_analytics_endpoints():
    """Verify AG Grid table data endpoints return correctly structured records."""
    resp_spending = client.get("/api/analytics/spending-grid")
    assert resp_spending.status_code == 200
    rows = resp_spending.json()
    assert len(rows) > 0
    assert "transaction_id" in rows[0]
    assert "amount" in rows[0]

    resp_coupons = client.get("/api/analytics/coupons-grid")
    assert resp_coupons.status_code == 200
    c_rows = resp_coupons.json()
    assert len(c_rows) >= 20
    assert "code" in c_rows[0]
    assert "utilization_pct" in c_rows[0]

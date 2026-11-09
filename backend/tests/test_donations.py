import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
import uuid
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models
import seed_data

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_data():
    """Ensure beneficiaries and test balance exist before tests run."""
    seed_data.ensure_beneficiaries()
    db = SessionLocal()
    # Reset Customer A to a clean balance for repeatable testing
    profile = db.query(models.CustomerProfile).filter_by(user_id="user-cust-a-001").first()
    if profile:
        profile.available_reward_points = 500.0
        db.commit()
    db.close()

def test_scenario_01_get_beneficiaries():
    """Verify active vetted charities are returned."""
    resp = client.get("/api/donations/beneficiaries")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 3
    names = [b["name"] for b in data]
    assert any("Akshaya Patra" in n for n in names)
    assert any("Shelter & Hope" in n for n in names)
    assert any("UNICEF" in n for n in names)

def test_scenario_02_get_customer_reward_balance():
    """Verify customer balance endpoint returns points and lifetime donations."""
    resp = client.get("/api/donations/customer-balance/user-cust-a-001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["customer_id"] == "user-cust-a-001"
    assert data["available_reward_points"] == 500.0
    assert data["currency"] == "INR"

def test_scenario_03_donate_preset_10():
    """Scenario: Customer donates preset amount of ₹10."""
    payload = {
        "customer_id": "user-cust-a-001",
        "beneficiary_id": "beneficiary-akshaya-patra-01",
        "amount": 10.0,
        "currency": "INR",
        "customer_consent": True,
        "source_type": "reward_balance"
    }
    resp = client.post("/api/donations/contribute", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["donation_amount"] == 10.0
    assert data["remaining_balance"] == 490.0
    assert data["paypal_reference_id"].startswith("PPRFG-TX-")

def test_scenario_04_donate_preset_25():
    """Scenario: Customer donates preset amount of ₹25."""
    payload = {
        "customer_id": "user-cust-a-001",
        "beneficiary_id": "beneficiary-shelter-hope-02",
        "amount": 25.0,
        "currency": "INR",
        "customer_consent": True,
        "source_type": "reward_balance"
    }
    resp = client.post("/api/donations/contribute", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["donation_amount"] == 25.0
    assert data["remaining_balance"] == 475.0

def test_scenario_05_donate_preset_50():
    """Scenario: Customer donates preset amount of ₹50."""
    payload = {
        "customer_id": "user-cust-a-001",
        "beneficiary_id": "beneficiary-unicef-edu-03",
        "amount": 50.0,
        "currency": "INR",
        "customer_consent": True,
        "source_type": "reward_balance"
    }
    resp = client.post("/api/donations/contribute", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["donation_amount"] == 50.0
    assert data["remaining_balance"] == 450.0

def test_scenario_06_donate_preset_100():
    """Scenario: Customer donates preset amount of ₹100."""
    payload = {
        "customer_id": "user-cust-a-001",
        "beneficiary_id": "beneficiary-akshaya-patra-01",
        "amount": 100.0,
        "currency": "INR",
        "customer_consent": True,
        "source_type": "reward_balance"
    }
    resp = client.post("/api/donations/contribute", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["donation_amount"] == 100.0
    assert data["remaining_balance"] == 400.0

def test_scenario_07_donate_custom_amount():
    """Scenario: Customer enters a custom amount (₹35) within available rewards."""
    payload = {
        "customer_id": "user-cust-a-001",
        "beneficiary_id": "beneficiary-shelter-hope-02",
        "amount": 35.0,
        "currency": "INR",
        "customer_consent": True,
        "source_type": "reward_balance"
    }
    resp = client.post("/api/donations/contribute", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["donation_amount"] == 35.0
    assert data["remaining_balance"] == 465.0

def test_scenario_08_exceed_available_rewards():
    """Scenario: Custom amount exceeding available rewards is rejected with HTTP 400."""
    payload = {
        "customer_id": "user-cust-a-001",
        "beneficiary_id": "beneficiary-akshaya-patra-01",
        "amount": 9999.0,  # Exceeds 500
        "currency": "INR",
        "customer_consent": True,
        "source_type": "reward_balance"
    }
    resp = client.post("/api/donations/contribute", json=payload)
    assert resp.status_code == 400
    assert "exceeds available reward balance" in resp.json()["detail"]

def test_scenario_09_negative_amount_rejected():
    """Scenario: Negative amount is strictly rejected with HTTP 400 or 422."""
    payload = {
        "customer_id": "user-cust-a-001",
        "beneficiary_id": "beneficiary-akshaya-patra-01",
        "amount": -50.0,
        "currency": "INR",
        "customer_consent": True,
        "source_type": "reward_balance"
    }
    resp = client.post("/api/donations/contribute", json=payload)
    assert resp.status_code in [400, 422]

def test_scenario_10_missing_consent_rejected():
    """Scenario: Voluntary consent must be explicitly granted (never forced)."""
    payload = {
        "customer_id": "user-cust-a-001",
        "beneficiary_id": "beneficiary-akshaya-patra-01",
        "amount": 50.0,
        "currency": "INR",
        "customer_consent": False,
        "source_type": "reward_balance"
    }
    resp = client.post("/api/donations/contribute", json=payload)
    assert resp.status_code == 400
    assert "consent is required" in resp.json()["detail"].lower()

def test_scenario_11_cash_conversion_with_donation():
    """Scenario: Cash conversion with voluntary donation (e.g. ₹500 rewards -> ₹450 cash + ₹50 donation)."""
    payload = {
        "customer_id": "user-cust-a-001",
        "amount_to_redeem": 500.0,
        "donation_amount": 50.0,
        "beneficiary_id": "beneficiary-akshaya-patra-01",
        "customer_consent": True,
        "currency": "INR"
    }
    resp = client.post("/api/donations/convert-cash", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["cash_redeemed"] == 450.0
    assert data["donation_amount"] == 50.0
    assert data["remaining_balance"] == 0.0

def test_scenario_12_cash_conversion_without_donation():
    """Scenario: Cash conversion without donation (100% skipped, converts full amount to cash)."""
    # Reset balance to 500 first
    db = SessionLocal()
    profile = db.query(models.CustomerProfile).filter_by(user_id="user-cust-a-001").first()
    profile.available_reward_points = 500.0
    db.commit()
    db.close()

    payload = {
        "customer_id": "user-cust-a-001",
        "amount_to_redeem": 500.0,
        "donation_amount": 0.0,
        "customer_consent": False,
        "currency": "INR"
    }
    resp = client.post("/api/donations/convert-cash", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert data["cash_redeemed"] == 500.0
    assert data["donation_amount"] == 0.0
    assert data["remaining_balance"] == 0.0

def test_scenario_13_insufficient_rewards_redemption():
    """Scenario: Customer with insufficient rewards cannot redeem or donate more than balance."""
    payload = {
        "customer_id": "user-cust-a-001",
        "amount_to_redeem": 5000.0,
        "donation_amount": 0.0,
        "currency": "INR"
    }
    resp = client.post("/api/donations/convert-cash", json=payload)
    assert resp.status_code == 400
    assert "exceeds available reward points" in resp.json()["detail"]

def test_scenario_14_social_impact_analytics():
    """Scenario: Social impact analytics returns accurate aggregate metrics and donation log."""
    resp = client.get("/api/donations/analytics")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_donated" in data
    assert "total_donors_count" in data
    assert "avg_donation_amount" in data
    assert len(data["beneficiaries"]) >= 3
    assert len(data["recent_donations"]) >= 1
    assert data["currency"] == "INR"

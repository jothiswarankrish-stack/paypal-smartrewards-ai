from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/auth", tags=["Authentication & Demo Switcher"])

DEMO_PERSONAS = {
    "customer_a": {
        "email": "customer.a@smartrewards.ai",
        "description": "Customer A: Food Delivery Enthusiast (₹6k food / ₹3k taxi / ₹2k shopping)"
    },
    "customer_b": {
        "email": "customer.b@smartrewards.ai",
        "description": "Customer B: Frequent Taxi Commuter (₹1k food / ₹7k taxi / ₹2k shopping)"
    },
    "customer_c": {
        "email": "customer.c@smartrewards.ai",
        "description": "Customer C: Online Shopping Enthusiast (₹1.5k food / ₹1k taxi / ₹8k shopping)"
    },
    "customer_d": {
        "email": "customer.d@smartrewards.ai",
        "description": "Customer D: Groceries & Quick Mart Buyer (₹6.5k groceries)"
    },
    "customer_e": {
        "email": "customer.e@smartrewards.ai",
        "description": "Customer E: Travel & Entertainment Seeker (₹7.5k travel & cinema)"
    },
    "merchant": {
        "email": "partner@freshbite.com",
        "description": "Merchant: FreshBite Gourmet Partner Portal"
    },
    "admin": {
        "email": "admin@smartrewards.ai",
        "description": "Admin: Platform Administrator"
    }
}

@router.post("/demo-login/{persona}", response_model=schemas.AuthTokenResponse)
def demo_login(persona: str, db: Session = Depends(get_db)):
    """
    1-Click demonstration switcher between Customer A, B, C, D, E, Merchant, and Admin.
    """
    persona_key = persona.lower().strip()
    if persona_key not in DEMO_PERSONAS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Persona '{persona}' not found. Available personas: {list(DEMO_PERSONAS.keys())}"
        )

    target_email = DEMO_PERSONAS[persona_key]["email"]
    user = db.query(models.User).filter(models.User.email == target_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seed user with email {target_email} not found in database. Run seed script."
        )

    # Construct clean response
    return schemas.AuthTokenResponse(
        access_token=f"demo_token_for_{user.id}",
        token_type="bearer",
        user=schemas.UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            created_at=user.created_at,
            customer_profile=schemas.CustomerProfileSchema(
                persona_name=user.customer_profile.persona_name if user.customer_profile else (
                    "Merchant Partner" if user.role == "merchant" else "System Administrator"
                ),
                persona_description=user.customer_profile.persona_description if user.customer_profile else None,
                monthly_budget=user.customer_profile.monthly_budget if user.customer_profile else 0.0,
                preferred_payment_method=user.customer_profile.preferred_payment_method if user.customer_profile else "paypal"
            ) if (user.customer_profile or user.role == "customer") else None
        )
    )

@router.get("/personas")
def list_personas():
    """List available demo personas for quick switching."""
    return DEMO_PERSONAS

@router.get("/me/{user_id}", response_model=schemas.UserResponse)
def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return schemas.UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        created_at=user.created_at,
        customer_profile=schemas.CustomerProfileSchema(
            persona_name=user.customer_profile.persona_name if user.customer_profile else "",
            persona_description=user.customer_profile.persona_description if user.customer_profile else None,
            monthly_budget=user.customer_profile.monthly_budget if user.customer_profile else 0.0,
            preferred_payment_method=user.customer_profile.preferred_payment_method if user.customer_profile else "paypal"
        ) if user.customer_profile else None
    )

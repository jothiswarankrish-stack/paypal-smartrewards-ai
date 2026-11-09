from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
from recommendation.agentic_commerce import AgenticCommerceEngine

router = APIRouter(prefix="/api/agent", tags=["Agentic Commerce AI Copilot"])

@router.post("/chat", response_model=schemas.AgentChatResponse)
def handle_agentic_commerce_query(req: schemas.AgentChatRequest, db: Session = Depends(get_db)):
    """
    Autonomous Agentic Commerce Copilot:
    Interprets user shopping intents ('I want food for ₹500'), finds highest-yield
    merchant rewards, computes net discounts, and prepares pre-approved PayPal checkout payload.
    """
    engine = AgenticCommerceEngine(db)
    result = engine.process_agent_request(
        message=req.message,
        customer_id=req.customer_id
    )
    return schemas.AgentChatResponse(**result)

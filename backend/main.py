from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from seed_data import seed_database, ensure_beneficiaries
from routers import (
    auth, customer, recommendations, coupons, paypal, merchant, admin, analytics, agent, donations
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize and seed database on startup
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
        ensure_beneficiaries()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    yield

app = FastAPI(
    title="PayPal SmartRewards AI Backend",
    description="AI-Powered Personalized Coupon Recommendation & Payment Engagement Platform for PayPal AI Hackathon 2026",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router)
app.include_router(customer.router)
app.include_router(recommendations.router)
app.include_router(coupons.router)
app.include_router(paypal.router)
app.include_router(merchant.router)
app.include_router(admin.router)
app.include_router(analytics.router)
app.include_router(agent.router)
app.include_router(donations.router)

@app.get("/")
def health_check():
    return {
        "service": "PayPal SmartRewards AI",
        "status": "online",
        "version": "2.0.0",
        "hackathon": "PayPal AI Hackathon 2026",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

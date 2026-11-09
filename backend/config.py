import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PAYPAL_CLIENT_ID: str = "sandbox_mock_client_id_for_dev"
    PAYPAL_CLIENT_SECRET: str = "sandbox_mock_client_secret_for_dev"
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"
    PAYPAL_MODE: str = "sandbox"
    
    DATABASE_URL: str = "sqlite:///./smartrewards.db"
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"
    SECRET_KEY: str = "smartrewards-dev-secret-key-paypal-hackathon-2026"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

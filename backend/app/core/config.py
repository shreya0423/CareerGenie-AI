from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    SQLALCHEMY_DATABASE_URL: str = "sqlite:///./career.db"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # App
    APP_NAME: str = "AI Career Path Recommendation System"
    DEBUG: bool = True

    # ML Model
    MODEL_PATH: str = "app/ml/models/career_model.pkl"
    LABEL_ENCODER_PATH: str = "app/ml/models/label_encoder.pkl"
    SCALER_PATH: str = "app/ml/models/scaler.pkl"

    # ✅ ADD THESE (VERY IMPORTANT)
    
    OPENROUTER_API_KEY: str | None = None

    class Config:
        env_file = ".env"
        extra = "allow"   # prevents crash if extra env variables exist

# create settings object
settings = Settings()
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Profile
    age = Column(Integer)
    education_level = Column(String(100))
    gpa = Column(Float)
    skills = Column(JSON)           # list of skills
    interests = Column(JSON)        # list of interests
    personality_type = Column(String(50))
    work_preference = Column(String(50))  # remote/onsite/hybrid
    experience_years = Column(Integer, default=0)

    # Relations
    quiz_responses = relationship("QuizResponse", back_populates="user")
    career_recommendations = relationship("CareerRecommendation", back_populates="user")

from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Career(Base):
    __tablename__ = "careers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(Text)
    category = Column(String(100))
    avg_salary = Column(Float)
    growth_rate = Column(Float)
    required_skills = Column(JSON)
    education_requirement = Column(String(100))
    work_environment = Column(String(100))
    roadmap = Column(JSON)
    resources = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    recommendations = relationship("CareerRecommendation", back_populates="career")

class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    career_id = Column(Integer, ForeignKey("careers.id"), nullable=False)
    match_percentage = Column(Float)
    rank = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="career_recommendations")
    career = relationship("Career", back_populates="recommendations")

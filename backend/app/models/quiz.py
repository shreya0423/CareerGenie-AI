from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    category = Column(String(100))  # technical, personality, interest, aptitude
    options = Column(JSON)          # list of {value, label, scores: {career: weight}}
    question_type = Column(String(50), default="mcq")
    order_num = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    responses = relationship("QuizResponse", back_populates="question")

class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option = Column(String(255))
    score_value = Column(Float)
    session_id = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="quiz_responses")
    question = relationship("Question", back_populates="responses")

class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String(100), unique=True, nullable=False)
    completed = Column(Integer, default=0)  # 0=in progress, 1=completed
    total_questions = Column(Integer, default=15)
    answered_questions = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.core.security import get_current_admin
from app.models.user import User
from app.models.quiz import QuizSession, QuizResponse
from app.models.career import CareerRecommendation

router = APIRouter()

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_quizzes = db.query(QuizSession).filter(QuizSession.completed == 1).count()
    total_recommendations = db.query(CareerRecommendation).count()
    
    # Users per day (last 7 days)
    from datetime import datetime, timedelta
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    new_users = db.query(User).filter(User.created_at >= seven_days_ago).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_quizzes_completed": total_quizzes,
        "total_recommendations": total_recommendations,
        "new_users_last_7_days": new_users,
        "quiz_completion_rate": round((total_quizzes / max(total_users, 1)) * 100, 1)
    }

@router.get("/users")
def list_users(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return [{
        "id": u.id,
        "email": u.email,
        "username": u.username,
        "full_name": u.full_name,
        "is_active": u.is_active,
        "is_admin": u.is_admin,
        "education_level": u.education_level,
        "created_at": str(u.created_at)
    } for u in users]

@router.get("/career-popularity")
def career_popularity(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    from app.models.career import Career, CareerRecommendation
    from sqlalchemy import func
    
    # Get top 5 recommended careers
    top_careers = db.query(
        Career.name,
        func.count(CareerRecommendation.id).label('count')
    ).join(CareerRecommendation).group_by(Career.name).order_by(func.count(CareerRecommendation.id).desc()).limit(5).all()
    
    total_recs = db.query(CareerRecommendation).count() or 1
    
    return [
        {
            "career": c.name, 
            "count": c.count, 
            "percentage": round((c.count / total_recs) * 100, 1)
        } for c in top_careers
    ]

@router.get("/quiz-analytics")  
def quiz_analytics(db: Session = Depends(get_db), admin = Depends(get_current_admin)):
    total = db.query(QuizSession).count()
    completed = db.query(QuizSession).filter(QuizSession.completed == 1).count()
    
    # Calculate average score (simulated or real if scores are stored)
    # Since we use complex scoring, let's just return completion metrics for now
    
    return {
        "total_sessions": total,
        "completed_sessions": completed,
        "completion_rate": round((completed / max(total, 1)) * 100, 1),
        "active_last_24h": db.query(QuizSession).filter(QuizSession.created_at >= datetime.utcnow() - timedelta(hours=24)).count()
    }

#!/usr/bin/env python3
"""
Initialize database and create admin user.
Run: python scripts/init_db.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.database import engine, SessionLocal
from app.models.user import User, Base as UserBase
from app.models.career import Career, CareerRecommendation, Base as CareerBase
from app.models.quiz import Question, QuizResponse, QuizSession, Base as QuizBase
from app.core.security import get_password_hash

def init():
    print("🗄️  Creating database tables...")
    UserBase.metadata.create_all(bind=engine)
    CareerBase.metadata.create_all(bind=engine)
    QuizBase.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create admin user
    existing = db.query(User).filter(User.email == "admin@careerpro.ai").first()
    if not existing:
        admin = User(
            email="admin@careerpro.ai",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="System Admin",
            is_admin=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("✅ Admin user created: admin@careerpro.ai / admin123")
    else:
        print("ℹ️  Admin user already exists")
    
    db.close()
    print("🚀 Database initialized successfully!")

if __name__ == "__main__":
    init()

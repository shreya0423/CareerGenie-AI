from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.db.database import get_db
from app.models.quiz import Question, QuizResponse, QuizSession
from app.schemas.schemas import QuestionResponse, QuizSessionSubmit
from app.core.security import get_current_user
from app.models.user import User
from app.services.question_loader import load_questions

router = APIRouter()

# Questions loaded dynamically per request

@router.get("/questions", response_model=List[dict])
def get_questions(current_user: User = Depends(get_current_user)):
    return load_questions()

@router.post("/start")
def start_quiz(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = load_questions()
    session_id = str(uuid.uuid4())
    session = QuizSession(
        user_id=current_user.id,
        session_id=session_id,
        total_questions=len(q)
    )
    db.add(session)
    db.commit()
    return {"session_id": session_id, "total_questions": len(q)}

@router.post("/submit")
def submit_quiz(
    payload: QuizSessionSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save responses
    for answer in payload.answers:
        response = QuizResponse(
            user_id=current_user.id,
            question_id=answer.question_id,
            selected_option=answer.selected_option,
            score_value=answer.score_value,
            session_id=payload.session_id
        )
        db.add(response)
    
    # Mark session complete
    session = db.query(QuizSession).filter(QuizSession.session_id == payload.session_id).first()
    if session:
        session.completed = 1
        session.answered_questions = len(payload.answers)
    
    db.commit()
    
    # Calculate career scores from answers
    q_data = load_questions()
    
    # Calculate scores per category as requested: Technical, Aptitude, Personality, Interests.
    category_scores = {"Technical": 0, "Aptitude": 0, "Personality": 0, "Interests": 0}
    career_scores = {}
    
    for answer in payload.answers:
        q = next((q for q in q_data if q["id"] == answer.question_id), None)
        if q:
            # Add to category score
            if q["category"] in category_scores:
                category_scores[q["category"]] += 1
            
            # Add to career scores
            opt = next((o for o in q["options"] if o["value"] == answer.selected_option), None)
            if opt:
                for career, score in opt["career_scores"].items():
                    career_scores[career] = career_scores.get(career, 0) + score
    
    return {
        "status": "completed", 
        "career_scores": career_scores,
        "category_scores": category_scores
    }

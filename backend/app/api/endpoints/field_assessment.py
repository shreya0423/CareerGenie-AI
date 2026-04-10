from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.field_engine import FieldEngine
from app.services.question_loader import get_field_questions
from app.services.ollama_service import OllamaService
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()
field_engine = FieldEngine()

class FieldAnswerItem(BaseModel):
    question_id: int
    score_value: int
    selected_option: str

class FieldAssessmentSubmit(BaseModel):
    field: str
    answers: List[FieldAnswerItem]
    user_interests: List[str] = []

@router.get("/list")
def get_fields_list():
    return {"fields": field_engine.get_fields()}

@router.get("/questions/{field_name}")
def get_field_questions_endpoint(field_name: str, current_user: User = Depends(get_current_user)):
    try:
        qs = get_field_questions(field_name)
        if not qs:
            # Fallback if specific field doesn't have populated JSON questions
            qs = field_engine.load_field_questions(field_name)
        return {"field": field_name, "questions": qs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit")
async def submit_field_assessment(data: FieldAssessmentSubmit, current_user: User = Depends(get_current_user)):
    try:
        ans_dicts = [{"score_value": a.score_value} for a in data.answers]
        score = field_engine.calculate_field_score(ans_dicts)
        
        ug_courses = field_engine.get_ug_courses_for_field(data.field)
        
        # Build evaluation data
        evaluation_data = {
            "score": score,
            "interests": data.user_interests,
            "available_courses": ug_courses
        }

        # Call centralized AI endpoint for evaluating field assessments
        ai_recommendation = await OllamaService.evaluate_field_assessment(data.field, evaluation_data)
        
        return {
            "field": data.field,
            "score": score,
            "ug_courses": ug_courses,
            "ai_recommendation": ai_recommendation,
            "roadmap": ai_recommendation.get("roadmap", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

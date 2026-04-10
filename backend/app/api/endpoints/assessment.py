from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.assessment_engine import AssessmentEngine
from app.services.question_loader import get_general_questions, get_field_questions
from app.services.ollama_service import OllamaService
from app.models.user import User
from app.core.security import get_current_user
import httpx

router = APIRouter()
assessment_engine = AssessmentEngine()

class AnswerItem(BaseModel):
    question_id: int
    score_value: int
    selected_option: str
    career_scores: Dict[str, int] = {}

class AssessmentSubmitRequest(BaseModel):
    answers: Dict[str, List[AnswerItem]]  # answers by category

class AssessmentResultRequest(BaseModel):
    scores: Dict[str, int]
    ml_recommendations: List[Dict[str, Any]]

@router.get("/questions")
def get_assessment_questions(current_user: User = Depends(get_current_user)):
    return get_general_questions()

@router.get("/field-questions/{field_name}")
def get_field_assessment_questions(field_name: str, current_user: User = Depends(get_current_user)):
    return get_field_questions(field_name)

@router.post("/submit")
def submit_assessment(data: AssessmentSubmitRequest, current_user: User = Depends(get_current_user)):
    try:
        answers_by_category = {}
        for cat, answers in data.answers.items():
            answers_by_category[cat] = [
                {"question_id": a.question_id, "score_value": a.score_value} for a in answers
            ]
        
        scores = assessment_engine.calculate_scores(answers_by_category)
        
        overall_career_scores = {}
        for cat, answers in data.answers.items():
            for ans in answers:
                for career, w in ans.career_scores.items():
                    overall_career_scores[career] = overall_career_scores.get(career, 0) + w

        top_fields = assessment_engine.determine_top_fields(overall_career_scores)

        return {
            "status": "success",
            "scores": scores,
            "legacy_career_scores": overall_career_scores,
            "top_fields": top_fields,
            "insights": assessment_engine.get_assessment_insights(scores)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/result")
async def get_assessment_result(data: AssessmentResultRequest, current_user: User = Depends(get_current_user)):
    try:
        payload = {
            "category_scores": data.scores,
            "ml_predictions": data.ml_recommendations
        }
        
        ai_recommendation = await OllamaService.recommend(payload)
        
        roadmap = []
        if ai_recommendation and "streams" in ai_recommendation and ai_recommendation["streams"]:
            top_career = ai_recommendation["streams"][0]
            if isinstance(top_career, str):
                roadmap_data = await OllamaService.generate_roadmap(top_career)
                roadmap = roadmap_data.get("steps", [])
        
        return {
            "scores": data.scores,
            "ml_recommendations": data.ml_recommendations,
            "ai_recommendation": ai_recommendation,
            "roadmap": roadmap
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

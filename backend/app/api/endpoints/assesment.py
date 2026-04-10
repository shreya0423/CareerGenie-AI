from fastapi import APIRouter
from app.services.question_loader import load_questions

router = APIRouter()

@router.get("/questions")
def get_questions():
    return load_questions()
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.ollama_service import OllamaService

router = APIRouter()

class AIRequest(BaseModel):
    skills: List[str]
    interests: List[str]
    education_level: str
    gpa: float
    personality_type: str
    experience_years: int
    quiz_scores: Dict[str, Any]

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []

class RoadmapRequest(BaseModel):
    career: str

class FieldAssessmentRequest(BaseModel):
    field_name: str
    data: Dict[str, Any]

@router.post("/chat")
async def ai_chat(data: ChatRequest):
    try:
        response = await OllamaService.chat(data.message, data.history)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama integration failed: {str(e)}")

@router.post("/recommend")
async def ai_recommend(data: AIRequest):
    try:
        recommendations = await OllamaService.recommend(data.model_dump())
        return {"recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama recommendation failed: {str(e)}")

@router.post("/general-assessment")
async def general_assessment(data: Dict[str, Any]):
    try:
        result = await OllamaService.evaluate_general_assessment(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/field-assessment")
async def field_assessment(req: FieldAssessmentRequest):
    try:
        result = await OllamaService.evaluate_field_assessment(req.field_name, req.data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/roadmap")
async def generate_roadmap(data: RoadmapRequest):
    try:
        roadmap = await OllamaService.generate_roadmap(data.career)
        return {"roadmap": roadmap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ollama roadmap failed: {str(e)}")

@router.post("/voice")
async def voice_advisor(data: dict):
    query = data.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    try:
        response = await OllamaService.chat(query, [])
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

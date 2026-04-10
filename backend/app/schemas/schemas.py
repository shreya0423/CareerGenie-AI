from pydantic import BaseModel, EmailStr
from pydantic import BaseModel, constr
from typing import Optional, List, Dict, Any
from datetime import datetime

# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    password: constr(min_length=6, max_length=72)  # <-- enforce max 72
    full_name: str


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

# ─── User Schemas ─────────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    age: Optional[int] = None
    education_level: Optional[str] = None
    gpa: Optional[float] = None
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    personality_type: Optional[str] = None
    work_preference: Optional[str] = None
    experience_years: Optional[int] = 0

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_admin: bool
    age: Optional[int]
    education_level: Optional[str]
    gpa: Optional[float]
    skills: Optional[List[str]]
    interests: Optional[List[str]]
    personality_type: Optional[str]
    work_preference: Optional[str]
    experience_years: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Quiz Schemas ─────────────────────────────────────────────────────────────

class QuestionResponse(BaseModel):
    id: int
    text: str
    category: str
    options: List[Dict[str, Any]]
    question_type: str
    order_num: int

    class Config:
        from_attributes = True

class QuizAnswerSubmit(BaseModel):
    question_id: int
    selected_option: str
    score_value: float

class QuizSessionSubmit(BaseModel):
    session_id: str
    answers: List[QuizAnswerSubmit]

# ─── Career Schemas ───────────────────────────────────────────────────────────

class CareerResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    avg_salary: Optional[float]
    growth_rate: Optional[float]
    required_skills: Optional[List[str]]
    education_requirement: Optional[str]
    work_environment: Optional[str]
    roadmap: Optional[Dict[str, Any]]
    resources: Optional[List[Dict[str, str]]]

    class Config:
        from_attributes = True

class CareerRecommendationResult(BaseModel):
    rank: int
    career: CareerResponse
    match_percentage: float

class PredictionRequest(BaseModel):
    skills: List[str]
    interests: List[str]
    education_level: str
    gpa: float
    personality_type: str
    experience_years: int
    quiz_scores: Optional[Dict[str, float]] = {}

# ─── Chatbot Schemas ──────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = {}

class ChatResponse(BaseModel):
    reply: str
    suggestions: Optional[List[str]] = []

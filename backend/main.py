from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, users, quiz, careers, chatbot, admin, assessment
from app.db.database import engine
from app.models import user, career, quiz as quiz_model
from app.api.endpoints import ai
from dotenv import load_dotenv
load_dotenv()

# Create tables
user.Base.metadata.create_all(bind=engine)
career.Base.metadata.create_all(bind=engine)
quiz_model.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Career Path Recommendation System",
    description="Intelligent career guidance powered by ML",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(careers.router, prefix="/api/careers", tags=["Careers"])
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["Chatbot"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(assessment.router, prefix="/api/assessment", tags=["Assessment"])
from app.api.endpoints import field_assessment
app.include_router(field_assessment.router, prefix="/api/field-assessment", tags=["Field-Assessment"])

@app.get("/")
def root():
    return {"message": "AI Career Path Recommendation API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

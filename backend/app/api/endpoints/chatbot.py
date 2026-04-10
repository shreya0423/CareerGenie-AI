from fastapi import APIRouter, Depends
from app.schemas.schemas import ChatMessage, ChatResponse
from app.core.security import get_current_user
from app.models.user import User
import re

router = APIRouter()

RESPONSES = {
    "salary": {
        "keywords": ["salary", "pay", "earn", "income", "money", "compensation"],
        "reply": "💰 Salary varies by career! Software Engineers earn ~$110K, Data Scientists ~$120K, Financial Analysts ~$95K, and UX Designers ~$85K on average in the US. Experience, location, and skills greatly impact earnings.",
        "suggestions": ["How to negotiate salary?", "Which career pays the most?", "What skills increase salary?"]
    },
    "programming": {
        "keywords": ["code", "programming", "developer", "python", "javascript", "software"],
        "reply": "💻 For a programming career, start with Python or JavaScript. Build projects, contribute to open source, and practice on platforms like LeetCode. A portfolio of real projects is more valuable than just certifications!",
        "suggestions": ["Best programming languages to learn?", "How to build a portfolio?", "Self-taught vs CS degree?"]
    },
    "data_science": {
        "keywords": ["data", "machine learning", "ai", "analytics", "statistics", "ml"],
        "reply": "📊 Data Science is one of the hottest fields! Start with Python, statistics, and Pandas. Practice on Kaggle competitions. Key skills: Python, SQL, ML algorithms, data visualization, and storytelling with data.",
        "suggestions": ["What tools do data scientists use?", "Best data science resources?", "Data Science vs Data Analytics?"]
    },
    "design": {
        "keywords": ["design", "ux", "ui", "figma", "creative", "graphic"],
        "reply": "🎨 UX/UI Design is incredibly rewarding! Master Figma, study design principles, and build a strong portfolio. User research skills are just as important as visual design. Check Dribbble and Behance for inspiration.",
        "suggestions": ["How to build a design portfolio?", "UX vs UI vs Product Design?", "Best design tools?"]
    },
    "cybersecurity": {
        "keywords": ["security", "hacking", "cyber", "network", "penetration", "ethical hacker"],
        "reply": "🔐 Cybersecurity is booming with 32% projected growth! Start with CompTIA Security+, practice on TryHackMe and HackTheBox. Python scripting and networking fundamentals are essential. CEH and CISSP certs are gold standards.",
        "suggestions": ["How to start in cybersecurity?", "Best security certifications?", "Ethical hacking resources?"]
    },
    "career_change": {
        "keywords": ["change", "switch", "transition", "new career", "start over", "different field"],
        "reply": "🔄 Career transitions are very common! The key is to identify transferable skills, take online courses (Coursera, Udemy), build projects in your new field, and network actively. Most people successfully switch careers within 1-2 years with dedication.",
        "suggestions": ["What skills transfer between careers?", "How long to switch careers?", "Best platforms for learning?"]
    },
    "education": {
        "keywords": ["degree", "university", "college", "bootcamp", "certification", "course", "study"],
        "reply": "🎓 Education paths vary by career. Tech roles increasingly value skills over degrees — bootcamps and self-study work! Finance typically requires a degree + certifications like CFA. Design needs a strong portfolio. Research your target role's requirements.",
        "suggestions": ["Is a CS degree necessary?", "Best online certifications?", "Bootcamp vs University?"]
    },
    "remote": {
        "keywords": ["remote", "work from home", "freelance", "wfh", "location"],
        "reply": "🌍 Remote work is now very common in tech! Software Engineering, Data Science, and Design roles are frequently remote. Marketing and PM roles are hybrid. Financial Analyst roles tend to be more office-based. Your skills matter more than location in tech.",
        "suggestions": ["How to find remote jobs?", "Best remote-friendly careers?", "Tips for working remotely?"]
    },
    "default": {
        "reply": "👋 I'm your AI career guide! I can help you with career recommendations, skill development, salary information, education paths, and more. Take the career quiz for personalized recommendations!",
        "suggestions": ["What career suits me?", "How to start in tech?", "Career with best growth?", "Highest paying careers?"]
    }
}

def analyze_sentiment(text: str) -> str:
    """Simple rule-based sentiment analysis"""
    positive_words = ["excited", "happy", "love", "great", "awesome", "interested", "motivated", "ready"]
    negative_words = ["confused", "lost", "scared", "worried", "stuck", "unsure", "difficult", "hard"]
    
    text_lower = text.lower()
    pos_count = sum(1 for word in positive_words if word in text_lower)
    neg_count = sum(1 for word in negative_words if word in text_lower)
    
    if pos_count > neg_count:
        return "positive"
    elif neg_count > pos_count:
        return "negative"
    return "neutral"

def get_response(message: str) -> dict:
    msg_lower = message.lower()
    
    for category, data in RESPONSES.items():
        if category == "default":
            continue
        if any(kw in msg_lower for kw in data.get("keywords", [])):
            sentiment = analyze_sentiment(message)
            reply = data["reply"]
            if sentiment == "negative":
                reply = "I understand you might be feeling uncertain. " + reply
            elif sentiment == "positive":
                reply = "That's a great attitude! " + reply
            return {"reply": reply, "suggestions": data.get("suggestions", [])}
    
    return {"reply": RESPONSES["default"]["reply"], "suggestions": RESPONSES["default"]["suggestions"]}

@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatMessage, current_user: User = Depends(get_current_user)):
    result = get_response(payload.message)
    return ChatResponse(reply=result["reply"], suggestions=result["suggestions"])

@router.post("/chat/public")
def public_chat(payload: ChatMessage):
    result = get_response(payload.message)
    return ChatResponse(reply=result["reply"], suggestions=result["suggestions"])

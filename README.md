<<<<<<< HEAD
# 🧠 AI Career Path Recommendation System

A full-stack intelligent career guidance platform powered by Machine Learning (Random Forest), NLP (TextBlob), FastAPI, React, and MySQL.

---

## 📁 Complete Folder Structure

```
career-path-system/
├── backend/
│   ├── main.py                          # FastAPI application entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── .env.example                     # Environment variables template
│   └── app/
│       ├── api/
│       │   └── endpoints/
│       │       ├── auth.py              # POST /register, POST /login
│       │       ├── users.py             # GET /me, PUT /profile
│       │       ├── quiz.py              # GET /questions, POST /start, POST /submit
│       │       ├── careers.py           # POST /predict, GET /careers, GET /roadmap
│       │       ├── chatbot.py           # POST /chat
│       │       └── admin.py             # GET /stats, GET /users
│       ├── core/
│       │   ├── config.py                # App settings via Pydantic
│       │   └── security.py             # JWT + bcrypt auth
│       ├── db/
│       │   └── database.py              # SQLAlchemy engine + session
│       ├── models/
│       │   ├── user.py                  # User ORM model
│       │   ├── career.py                # Career + Recommendation models
│       │   └── quiz.py                  # Question + Response + Session models
│       ├── schemas/
│       │   └── schemas.py               # Pydantic request/response schemas
│       └── ml/
│           ├── predictor.py             # Rule-based + ML career predictor
│           ├── train_model.py           # Random Forest training script
│           └── models/                  # Saved .pkl model files
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                      # Routes + providers
│       ├── index.js                     # Entry point
│       ├── index.css                    # Global styles + Tailwind
│       ├── context/
│       │   └── AuthContext.jsx          # JWT auth state management
│       ├── services/
│       │   └── api.js                   # Axios API client
│       └── pages/
│           ├── LandingPage.jsx          # Animated landing w/ particle canvas
│           ├── LoginPage.jsx            # JWT login
│           ├── RegisterPage.jsx         # User registration
│           ├── DashboardPage.jsx        # User dashboard
│           ├── QuizPage.jsx             # 15-question MCQ assessment
│           ├── ProfilePage.jsx          # Skills/interests/education form
│           ├── ResultsPage.jsx          # ML results + Recharts visualizations
│           ├── RoadmapPage.jsx          # Career roadmap with progress tracker
│           ├── ChatbotPage.jsx          # AI career guidance chatbot
│           ├── CareersPage.jsx          # Browse all career paths
│           └── AdminPage.jsx            # Admin analytics dashboard
│
├── docs/
│   └── schema.sql                       # MySQL DDL + sample data
├── scripts/
│   └── init_db.py                       # DB init + admin user seed
└── README.md
```

---

## 🗄️ MySQL Schema

```sql
-- 6 tables: users, careers, career_recommendations, 
--           questions, quiz_responses, quiz_sessions
-- See docs/schema.sql for complete DDL
```

**Key Tables:**
| Table | Purpose |
|-------|---------|
| `users` | Accounts + profile (skills JSON, interests JSON, GPA, education) |
| `careers` | Career definitions with roadmap JSON and resources |
| `career_recommendations` | ML prediction results per user |
| `questions` | 15 MCQ questions with scoring weights per career |
| `quiz_responses` | User answers per session |
| `quiz_sessions` | Quiz completion tracking |

---

## 🔌 REST API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT token |
| GET | `/api/users/me` | JWT | Get current user profile |
| PUT | `/api/users/profile` | JWT | Update profile |
| GET | `/api/quiz/questions` | JWT | Get all 15 quiz questions |
| POST | `/api/quiz/start` | JWT | Start a quiz session |
| POST | `/api/quiz/submit` | JWT | Submit all quiz answers |
| POST | `/api/careers/predict` | JWT | Run ML career prediction |
| GET | `/api/careers/careers` | No | List all career paths |
| GET | `/api/careers/career/{name}` | No | Get specific career info |
| GET | `/api/careers/roadmap/{name}` | JWT | Get career roadmap |
| POST | `/api/chatbot/chat` | JWT | Chat with AI guide |
| POST | `/api/chatbot/chat/public` | No | Public chatbot |
| GET | `/api/admin/stats` | Admin | Platform statistics |
| GET | `/api/admin/users` | Admin | List all users |
| GET | `/api/admin/career-popularity` | Admin | Career analytics |
| GET | `/api/admin/quiz-analytics` | Admin | Quiz completion stats |

---

## 🤖 Machine Learning Model

**Algorithm:** Scikit-learn Random Forest Classifier  
**Features (12):**
- `math_score`, `logical_score`, `creative_score`
- `communication_score`, `analytical_score`, `leadership_score`
- `tech_interest`, `business_interest`, `design_interest`
- `gpa`, `experience_years`, `education_encoded`

**Target Classes (8 careers):**
Software Engineer, Data Scientist, UX/UI Designer, Financial Analyst, Cybersecurity Engineer, Business Analyst, Project Manager, Marketing Manager

**Hyperparameters:**
- `n_estimators=200`, `max_depth=15`, `min_samples_split=5`
- Expected accuracy: ~85-92% on test set

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

---

### 1. Clone & Setup Database

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE career_db;
EXIT;

# Or run the schema directly
mysql -u root -p < docs/schema.sql
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# OR: venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL with your MySQL credentials

# Initialize database + create admin user
cd ..
python scripts/init_db.py

# Train the ML model (optional, rule-based fallback exists)
cd backend
python -m app.ml.train_model

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# REACT_APP_API_URL=http://localhost:8000

# Start development server
npm start
```

Frontend available at: http://localhost:3000

---

## 🔐 Default Admin Credentials

```
Email:    admin@careerpro.ai
Password: admin123
```

Access admin dashboard at: http://localhost:3000/admin

---

## 🎯 Key Features

1. **JWT Authentication** – Secure register/login with bcrypt password hashing
2. **15-Question MCQ Quiz** – Covering interest, personality, aptitude, skills, aspiration
3. **User Profile Form** – Skills (25 options), Interests (17 options), education, GPA, work preference
4. **ML Prediction** – Random Forest model with skill/interest weighting + GPA/experience bonuses
5. **Top 3 Career Matches** – With precise match percentages
6. **Recharts Visualizations** – Bar chart + Radar chart for results
7. **Career Roadmaps** – 4-phase roadmaps with task progress tracking
8. **AI Chatbot** – NLP-powered keyword matching with TextBlob sentiment analysis
9. **Admin Dashboard** – User stats, career popularity charts, quiz analytics
10. **RESTful API** – Full OpenAPI docs at /docs

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts, React Router v6 |
| Backend | FastAPI, Python 3.10+ |
| Database | MySQL 8.0 + SQLAlchemy ORM |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| ML | Scikit-learn Random Forest |
| NLP | TextBlob Sentiment Analysis (rule-based fallback) |
| Charts | Recharts (Bar, Radar, Pie, Line) |
=======
# 🧠 AI Career Path Recommendation System
## 📸 Screenshots

### 📊 Dashboard
<img src="screenshots/dashboard.png" width="700"/>

### 🤖 Chatbot
<img src="screenshots/chatbot.png" width="700"/>
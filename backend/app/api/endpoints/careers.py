from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.schemas.schemas import PredictionRequest, CareerRecommendationResult
from app.core.security import get_current_user
from app.models.user import User
from app.models.career import CareerRecommendation, Career
from app.ml.predictor import predict_careers
import json

router = APIRouter()

CAREER_DATA = {
    # Technology & Computer Science
    "Software Engineer": {
        "description": "Design, develop and maintain software applications and systems.",
        "category": "Technology & Computer Science",
        "avg_salary": 110000, "growth_rate": 25.0,
        "required_skills": ["Python", "JavaScript", "SQL", "Git", "System Design"],
        "roadmap": {"steps": [{"phase": "Foundation", "duration": "6m", "tasks": ["Learn programming core"]}, {"phase": "Core", "duration": "1y", "tasks": ["Web/App frameworks"]}, {"phase": "Expert", "duration": "1y+", "tasks": ["Cloud/Architecture"]}]},
        "resources": [{"title": "Odin Project", "url": "https://theodinproject.com"}]
    },
    "AI/ML Engineer": {
        "description": "Develop and deploy machine learning models and AI systems.",
        "category": "Technology & Computer Science",
        "avg_salary": 135000, "growth_rate": 35.0,
        "required_skills": ["PyTorch", "TensorFlow", "Statistics", "Linear Algebra"],
        "roadmap": {"steps": [{"phase": "Math", "duration": "6m", "tasks": ["Calculus & Stats"]}, {"phase": "ML", "duration": "1y", "tasks": ["Supervised/Unsupervised Models"]}, {"phase": "Deployment", "duration": "1y+", "tasks": ["Model serving/Cloud"]}]},
        "resources": [{"title": "fast.ai", "url": "https://fast.ai"}]
    },
    # Engineering
    "Mechanical Engineer": {
        "description": "Design and manufacture machinery and mechanical systems.",
        "category": "Engineering",
        "avg_salary": 95000, "growth_rate": 10.0,
        "required_skills": ["AutoCAD", "Thermodynamics", "Materials Science", "SolidWorks"],
        "roadmap": {"steps": [{"phase": "Foundation", "duration": "1y", "tasks": ["Physics & Calculus"]}, {"phase": "Core", "duration": "2y", "tasks": ["Applied Thermodynamics", "Fluid Mechanics"]}, {"phase": "Specialization", "duration": "1y", "tasks": ["Robotics/Aerospace"]}]},
        "resources": [{"title": "ASME", "url": "https://asme.org"}]
    },
    "Civil Engineer": {
        "description": "Design and oversee construction of infrastructure projects like roads & bridges.",
        "category": "Engineering",
        "avg_salary": 92000, "growth_rate": 7.0,
        "required_skills": ["Structural Analysis", "Project Management", "Revit", "Surveying"],
        "roadmap": {"steps": [{"phase": "Survey", "duration": "6m", "tasks": ["Land surveying basics"]}, {"phase": "Design", "duration": "2y", "tasks": ["Concrete/Steel design"]}, {"phase": "Management", "duration": "1y", "tasks": ["Site supervision"]}]},
        "resources": [{"title": "ASCE", "url": "https://asce.org"}]
    },
    # Medical & Healthcare
    "General Physician": {
        "description": "Diagnose and treat general health conditions in patients.",
        "category": "Medical & Healthcare",
        "avg_salary": 220000, "growth_rate": 15.0,
        "required_skills": ["Diagnosis", "Patient Care", "Pharmacology", "Medical Ethics"],
        "roadmap": {"steps": [{"phase": "Pre-Med", "duration": "4y", "tasks": ["Biology/Chem degree"]}, {"phase": "Medical School", "duration": "4y", "tasks": ["MD/MBBS studies"]}, {"phase": "Residency", "duration": "3y+", "tasks": ["Clinical practice"]}]},
        "resources": [{"title": "Mayo Clinic", "url": "https://mayoclinic.org"}]
    },
    "Registered Nurse": {
        "description": "Provide and coordinate patient care and educate the public on health issues.",
        "category": "Medical & Healthcare",
        "avg_salary": 82000, "growth_rate": 12.0,
        "required_skills": ["Critical Thinking", "Clinical Expertise", "Communication", "Compassion"],
        "roadmap": {"steps": [{"phase": "Degree", "duration": "4y", "tasks": ["B.Sc Nursing"]}, {"phase": "Licensing", "duration": "6m", "tasks": ["NCLEX Exam"]}, {"phase": "Practice", "duration": "Ongoing", "tasks": ["Hospital experience"]}]},
        "resources": [{"title": "ANA", "url": "https://nursingworld.org"}]
    },
    # Business & Management
    "Product Manager": {
        "description": "Guide the strategy, roadmap, and feature definition for a product.",
        "category": "Business & Management",
        "avg_salary": 125000, "growth_rate": 20.0,
        "required_skills": ["Agile", "User Research", "Data Analytics", "Strategy"],
        "roadmap": {"steps": [{"phase": "Market", "duration": "6m", "tasks": ["Analyze competitors"]}, {"phase": "Specs", "duration": "1y", "tasks": ["Write PRDs", "Feature planning"]}, {"phase": "Launch", "duration": "1y+", "tasks": ["GTM strategy"]}]},
        "resources": [{"title": "Product School", "url": "https://productschool.com"}]
    },
    "Marketing Manager": {
        "description": "Lead marketing campaigns and brand development strategies.",
        "category": "Business & Management",
        "avg_salary": 85000, "growth_rate": 10.0,
        "required_skills": ["SEO/SEM", "Content Strategy", "Digital Marketing", "Analytics"],
        "roadmap": {"steps": [{"phase": "Digital", "duration": "6m", "tasks": ["Ads & Content"]}, {"phase": "Brand", "duration": "1y", "tasks": ["Brand positioning"]}, {"phase": "Strategy", "duration": "1y+", "tasks": ["Budgeting", "KPI tracking"]}]},
        "resources": [{"title": "HubSpot", "url": "https://hubspot.com"}]
    },
    # Commerce & Finance
    "Chartered Accountant": {
        "description": "Manage financial audits, taxation, and advisory services.",
        "category": "Commerce & Finance",
        "avg_salary": 98000, "growth_rate": 8.0,
        "required_skills": ["Taxation", "Auditing", "Compliance", "Financial Reporting"],
        "roadmap": {"steps": [{"phase": "CPT", "duration": "6m", "tasks": ["Entrance Exam"]}, {"phase": "Articleship", "duration": "3y", "tasks": ["Training under CA"]}, {"phase": "Final", "duration": "1y", "tasks": ["Professional Exams"]}]},
        "resources": [{"title": "ICAI", "url": "https://icai.org"}]
    },
    "Investment Banker": {
        "description": "Help companies raise capital and advise on financial transactions.",
        "category": "Commerce & Finance",
        "avg_salary": 150000, "growth_rate": 9.0,
        "required_skills": ["M&A", "Valuation", "Financial Modeling", "Negotiation"],
        "roadmap": {"steps": [{"phase": "Analyst", "duration": "2y", "tasks": ["Excel modeling", "Pitch decks"]}, {"phase": "Associate", "duration": "3y", "tasks": ["Managing analysts"]}, {"phase": "VP", "duration": "Ongoing", "tasks": ["Deal sourcing"]}]},
        "resources": [{"title": "Investopedia", "url": "https://investopedia.com"}]
    },
    # Design & Creative Arts
    "Graphic Designer": {
        "description": "Create visual concepts to communicate ideas that inspire/inform users.",
        "category": "Design & Creative Arts",
        "avg_salary": 65000, "growth_rate": 3.0,
        "required_skills": ["Photoshop", "Illustrator", "Typography", "Branding"],
        "roadmap": {"steps": [{"phase": "Tools", "duration": "6m", "tasks": ["Master Adobe Suite"]}, {"phase": "Portfolio", "duration": "1y", "tasks": ["Personal projects"]}, {"phase": "Agency", "duration": "1y+", "tasks": ["Client work"]}]},
        "resources": [{"title": "Behance", "url": "https://behance.net"}]
    },
    "UI/UX Designer": {
        "description": "Focus on the visual and practical experience of digital products.",
        "category": "Design & Creative Arts",
        "avg_salary": 95000, "growth_rate": 15.0,
        "required_skills": ["Figma", "User Research", "Wireframing", "Prototyping"],
        "roadmap": {"steps": [{"phase": "UX", "duration": "6m", "tasks": ["Research methods"]}, {"phase": "UI", "duration": "6m", "tasks": ["Visual design basics"]}, {"phase": "Portfolio", "duration": "1y", "tasks": ["End-to-end case studies"]}]},
        "resources": [{"title": "NNG", "url": "https://nngroup.com"}]
    },
    # Science & Research
    "Biotechnologist": {
        "description": "Research biological processes to develop new technologies/medicine.",
        "category": "Science & Research",
        "avg_salary": 88000, "growth_rate": 13.0,
        "required_skills": ["Lab Techniques", "Genetics", "Microbiology", "Data Analysis"],
        "roadmap": {"steps": [{"phase": "B.Sc", "duration": "3y", "tasks": ["Core Bio subjects"]}, {"phase": "M.Sc", "duration": "2y", "tasks": ["Specialized Research"]}, {"phase": "PHD", "duration": "4y+", "tasks": ["Advanced Discovery"]}]},
        "resources": [{"title": "Nature Bio", "url": "https://nature.com/nbt"}]
    },
    "Research Scientist": {
        "description": "Conduct experiments and gather data to expand scientific knowledge.",
        "category": "Science & Research",
        "avg_salary": 105000, "growth_rate": 9.0,
        "required_skills": ["Methodology", "Academic Writing", "Statistical Tools", "Analysis"],
        "roadmap": {"steps": [{"phase": "Education", "duration": "5y", "tasks": ["Masters/PHD"]}, {"phase": "Lab Work", "duration": "2y", "tasks": ["Assisting lead researchers"]}, {"phase": "Publication", "duration": "Ongoing", "tasks": ["Publishing findings"]}]},
        "resources": [{"title": "ScienceMag", "url": "https://sciencemag.org"}]
    },
    # Law & Legal Studies
    "Corporate Lawyer": {
        "description": "Advise businesses on their legal rights, duties, and responsibilities.",
        "category": "Law & Legal Studies",
        "avg_salary": 130000, "growth_rate": 10.0,
        "required_skills": ["Contract Law", "Analytical Thinking", "Legal Research", "Drafting"],
        "roadmap": {"steps": [{"phase": "Law School", "duration": "5y", "tasks": ["LLB/JD degree"]}, {"phase": "Bar Exam", "duration": "1y", "tasks": ["Licensing"]}, {"phase": "Firm work", "duration": "Ongoing", "tasks": ["Junior Associate"]}]},
        "resources": [{"title": "Law.com", "url": "https://law.com"}]
    },
    "Human Rights Lawyer": {
        "description": "Defend basic rights and freedoms for individuals and marginalized groups.",
        "category": "Law & Legal Studies",
        "avg_salary": 85000, "growth_rate": 8.0,
        "required_skills": ["Public Policy", "Ethics", "Legal Advocacy", "Lobbying"],
        "roadmap": {"steps": [{"phase": "Legal Degree", "duration": "5y", "tasks": ["Law core subjects"]}, {"phase": "NGO", "duration": "2y", "tasks": ["Volunteering & clinics"]}, {"phase": "Advocacy", "duration": "Ongoing", "tasks": ["Litigation/Policy work"]}]},
        "resources": [{"title": "IBA", "url": "https://ibanet.org"}]
    },
    # Architecture & Planning
    "Architect": {
        "description": "Design buildings and other structures, ensuring functionality and safety.",
        "category": "Architecture & Planning",
        "avg_salary": 105000, "growth_rate": 6.0,
        "required_skills": ["CAD", "Building Codes", "Structural Design", "Creativity"],
        "roadmap": {"steps": [{"phase": "B.Arch", "duration": "5y", "tasks": ["Design studios", "Material science"]}, {"phase": "Internship", "duration": "2y", "tasks": ["NCARB training"]}, {"phase": "Licensing", "duration": "1y", "tasks": ["ARE Exams"]}]},
        "resources": [{"title": "AIA", "url": "https://aia.org"}]
    },
    "Urban Planner": {
        "description": "Develop plans and programs for the use of land and public facilities.",
        "category": "Architecture & Planning",
        "avg_salary": 78000, "growth_rate": 4.0,
        "required_skills": ["GIS", "Land Use Policy", "Sustainability", "Community Outreach"],
        "roadmap": {"steps": [{"phase": "Degree", "duration": "4y", "tasks": ["Urban studies/Geography"]}, {"phase": "Masters", "duration": "2y", "tasks": ["Urban Planning degree"]}, {"phase": "Certification", "duration": "Ongoing", "tasks": ["AICP Certification"]}]},
        "resources": [{"title": "APA", "url": "https://planning.org"}]
    },
    # Humanities & Social Sciences
    "Psychologist": {
        "description": "Study human behavior and mental processes to help people manage mental health.",
        "category": "Humanities & Social Sciences",
        "avg_salary": 95000, "growth_rate": 14.0,
        "required_skills": ["Empathy", "Research Methods", "Clinical Diagnosis", "Counseling"],
        "roadmap": {"steps": [{"phase": "Bachelors", "duration": "4y", "tasks": ["Psychology core"]}, {"phase": "Masters/PhD", "duration": "4y+", "tasks": ["Clinical Specialization"]}, {"phase": "Post-Doc", "duration": "2y", "tasks": ["Supervised hours"]}]},
        "resources": [{"title": "APA", "url": "https://apa.org"}]
    },
    "Sociologist": {
        "description": "Study society, social institutions, and social relationships.",
        "category": "Humanities & Social Sciences",
        "avg_salary": 92000, "growth_rate": 5.0,
        "required_skills": ["Data Analysis", "Critical Thinking", "Social Theory", "Survey Methods"],
        "roadmap": {"steps": [{"phase": "Education", "duration": "6y", "tasks": ["MA/PhD in Sociology"]}, {"phase": "Research", "duration": "2y", "tasks": ["Data collection & fieldwork"]}, {"phase": "Expert", "duration": "Ongoing", "tasks": ["Policy advisory/Academia"]}]},
        "resources": [{"title": "ASA", "url": "https://asanet.org"}]
    },
    # Education & Teaching
    "University Professor": {
        "description": "Teach students at the college level and conduct scholarly research.",
        "category": "Education & Teaching",
        "avg_salary": 115000, "growth_rate": 8.0,
        "required_skills": ["Public Speaking", "Research", "Writing", "Curriculum Design"],
        "roadmap": {"steps": [{"phase": "Grad School", "duration": "6y+", "tasks": ["PhD in subject domain"]}, {"phase": "Post-Doc", "duration": "2y", "tasks": ["Fellowships & research"]}, {"phase": "Tenure Track", "duration": "6y", "tasks": ["Assistant professor role"]}]},
        "resources": [{"title": "HigherEdJobs", "url": "https://higheredjobs.com"}]
    },
    "School Teacher": {
        "description": "Educate children in various subjects and facilitate development.",
        "category": "Education & Teaching",
        "avg_salary": 65000, "growth_rate": 5.0,
        "required_skills": ["Classroom Management", "Lesson Planning", "Patience", "Adaptability"],
        "roadmap": {"steps": [{"phase": "Degree", "duration": "4y", "tasks": ["B.Ed or subject degree"]}, {"phase": "Licensing", "duration": "1y", "tasks": ["Teaching Cert exams"]}, {"phase": "Induction", "duration": "1-2y", "tasks": ["Mentored teaching"]}]},
        "resources": [{"title": "Edutopia", "url": "https://edutopia.org"}]
    },
    # Media & Communication
    "Journalist": {
        "description": "Report news and information to the public via various media platforms.",
        "category": "Media & Communication",
        "avg_salary": 60000, "growth_rate": -3.0,
        "required_skills": ["Writing", "Investigative Skills", "Ethics", "Digital Media"],
        "roadmap": {"steps": [{"phase": "Education", "duration": "4y", "tasks": ["Journalism/Comm degree"]}, {"phase": "Freelancing", "duration": "1y+", "tasks": ["Building clip portfolio"]}, {"phase": "Newsroom", "duration": "Ongoing", "tasks": ["Reporter/Editor roles"]}]},
        "resources": [{"title": "Poynter", "url": "https://poynter.org"}]
    },
    "Public Relations Manager": {
        "description": "Manage the public image and communications of clients/organizations.",
        "category": "Media & Communication",
        "avg_salary": 118000, "growth_rate": 11.0,
        "required_skills": ["Strategic Comm", "Media Relations", "Crisis Management", "Networking"],
        "roadmap": {"steps": [{"phase": "Foundation", "duration": "4y", "tasks": ["Comm/Marketing degree"]}, {"phase": "PR Firm", "duration": "2y", "tasks": ["Junior Account Exec"]}, {"phase": "Leadership", "duration": "Ongoing", "tasks": ["Director of PR"]}]},
        "resources": [{"title": "PRSA", "url": "https://prsa.org"}]
    },
    # Hospitality & Culinary Arts
    "Executive Chef": {
        "description": "Oversee the kitchen department and lead the culinary team.",
        "category": "Hospitality & Culinary Arts",
        "avg_salary": 75000, "growth_rate": 15.0,
        "required_skills": ["Culinary Skills", "Kitchen Management", "Menu Creation", "Inventory"],
        "roadmap": {"steps": [{"phase": "Culinary School", "duration": "2y", "tasks": ["A.A. Culinary Arts"]}, {"phase": "Line Cook", "duration": "3y", "tasks": ["Stations rotations"]}, {"phase": "Sous Chef", "duration": "3y", "tasks": ["Managing operations"]}]},
        "resources": [{"title": "Eater", "url": "https://eater.com"}]
    },
    "Hotel Manager": {
        "description": "Plan and supervise the activities of hotel personnel to ensure profitability.",
        "category": "Hospitality & Culinary Arts",
        "avg_salary": 85000, "growth_rate": 18.0,
        "required_skills": ["Operations", "Customer Service", "Financial Mgmt", "Staffing"],
        "roadmap": {"steps": [{"phase": "Degree", "duration": "4y", "tasks": ["Hospitality Management"]}, {"phase": "Operations", "duration": "2y", "tasks": ["Front desk/Housekeeping supervisor"]}, {"phase": "General Mgr", "duration": "Ongoing", "tasks": ["Managing entire property"]}]},
        "resources": [{"title": "AHLA", "url": "https://ahla.com"}]
    },
    # Agriculture & Environmental Studies
    "Agricultural Scientist": {
        "description": "Improve the quality and safety of field crops and farm animals.",
        "category": "Agriculture & Environmental Studies",
        "avg_salary": 82000, "growth_rate": 9.0,
        "required_skills": ["Botany", "Soil Science", "Data Analysis", "Sustainable Farming"],
        "roadmap": {"steps": [{"phase": "Bachelors", "duration": "4y", "tasks": ["Agri-Science/Biology"]}, {"phase": "Field Research", "duration": "2y", "tasks": ["Crop trial management"]}, {"phase": "R&D", "duration": "Ongoing", "tasks": ["Product developer/Consultant"]}]},
        "resources": [{"title": "USDA", "url": "https://usda.gov"}]
    },
    "Environmental Consultant": {
        "description": "Advise organizations on how to minimize their environmental impact.",
        "category": "Agriculture & Environmental Studies",
        "avg_salary": 90000, "growth_rate": 12.0,
        "required_skills": ["Environmental Law", "Risk Assessment", "Auditing", "GIS"],
        "roadmap": {"steps": [{"phase": "Degree", "duration": "4y", "tasks": ["Environmental Science"]}, {"phase": "Analyst", "duration": "2y", "tasks": ["Site assessments"]}, {"phase": "Senior Consultant", "duration": "Ongoing", "tasks": ["Project management & policy"]}]},
        "resources": [{"title": "EPA", "url": "https://epa.gov"}]
    },
    # Aviation & Maritime
    "Aircraft Pilot": {
        "description": "Navigate and operate aircraft for airlines or private companies.",
        "category": "Aviation & Maritime",
        "avg_salary": 160000, "growth_rate": 13.0,
        "required_skills": ["Navigation", "Technical Systems", "Stress Mgmt", "Patience"],
        "roadmap": {"steps": [{"phase": "Flight School", "duration": "1y", "tasks": ["PPL/CPL licensing"]}, {"phase": "Hour Building", "duration": "1000hrs", "tasks": ["Flight instructor role"]}, {"phase": "First Officer", "duration": "Ongoing", "tasks": ["Regional airline entry"]}]},
        "resources": [{"title": "FAA", "url": "https://faa.gov"}]
    },
    "Marine Engineer": {
        "description": "Design, build and maintain ships and other watercraft.",
        "category": "Aviation & Maritime",
        "avg_salary": 115000, "growth_rate": 1.0,
        "required_skills": ["Mechanical Eng", "Marine Systems", "Ship Stability", "AutoCAD"],
        "roadmap": {"steps": [{"phase": "B.Tech", "duration": "4y", "tasks": ["Marine Engineering degree"]}, {"phase": "Sea Service", "duration": "1y", "tasks": ["Engine cadet training"]}, {"phase": "MEO Class IV", "duration": "1y", "tasks": ["Competency exams"]}]},
        "resources": [{"title": "IMO", "url": "https://imo.org"}]
    },
    # Sports & Physical Education
    "Sports Physiotherapist": {
        "description": "Help athletes recover from injuries and improve performance.",
        "category": "Sports & Physical Education",
        "avg_salary": 88000, "growth_rate": 17.0,
        "required_skills": ["Rehabilitation", "Anatomy", "Human Movement", "First Aid"],
        "roadmap": {"steps": [{"phase": "Degree", "duration": "4y", "tasks": ["B.Physiotherapy"]}, {"phase": "Masters", "duration": "2y", "tasks": ["Sports Med specialization"]}, {"phase": "Clinical", "duration": "Ongoing", "tasks": ["Working with clubs/National teams"]}]},
        "resources": [{"title": "APTA", "url": "https://apta.org"}]
    },
    "Fitness Director": {
        "description": "Manage gym operations and lead fitness programs for clients.",
        "category": "Sports & Physical Education",
        "avg_salary": 72000, "growth_rate": 19.0,
        "required_skills": ["Sales", "Exercise Science", "Mgmt", "Nutrition"],
        "roadmap": {"steps": [{"phase": "Cert", "duration": "6m", "tasks": ["Personal Trainer Cert (NASM/ACE)"]}, {"phase": "Instructor", "duration": "2y", "tasks": ["Lead training sessions"]}, {"phase": "Management", "duration": "Ongoing", "tasks": ["Gym manager/Director role"]}]},
        "resources": [{"title": "NASM", "url": "https://nasm.org"}]
    }
}

@router.post("/predict")
def predict(
    payload: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = predict_careers(payload.dict())
    
    # Save recommendations
    db.query(CareerRecommendation).filter(CareerRecommendation.user_id == current_user.id).delete()
    for i, result in enumerate(results[:3]):
        rec = CareerRecommendation(
            user_id=current_user.id,
            career_id=i + 1,
            match_percentage=result["match_percentage"],
            rank=i + 1
        )
        db.add(rec)
    db.commit()
    
    return {"recommendations": results}

@router.get("/careers")
def list_careers():
    careers = []
    for i, (name, data) in enumerate(CAREER_DATA.items()):
        careers.append({"id": i + 1, "name": name, **data})
    return careers

@router.get("/career/{career_name}")
def get_career(career_name: str):
    career = CAREER_DATA.get(career_name)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    return {"name": career_name, **career}

@router.get("/roadmap/{career_name}")
def get_roadmap(career_name: str, current_user: User = Depends(get_current_user)):
    career = CAREER_DATA.get(career_name)
    if not career:
        raise HTTPException(status_code=404, detail="Career not found")
    return {"career": career_name, "roadmap": career["roadmap"], "resources": career["resources"]}

import os
import pickle
import numpy as np
from typing import Dict, List, Any

# Career categories fully supported
CATEGORIES = [
    'Technology & Computer Science', 'Engineering', 'Medical & Healthcare', 
    'Business & Management', 'Commerce & Finance', 'Design & Creative Arts', 
    'Science & Research', 'Law & Legal Studies', 'Architecture & Planning', 
    'Humanities & Social Sciences', 'Education & Teaching', 'Media & Communication', 
    'Hospitality & Culinary Arts', 'Agriculture & Environmental Studies', 
    'Aviation & Maritime', 'Sports & Physical Education'
]

SKILL_CAREER_MAP = {
    # Tech
    "Python": {"Software Engineer": 0.9, "Data Scientist": 0.9, "AI/ML Engineer": 0.95},
    "JavaScript": {"Software Engineer": 0.9, "UI/UX Designer": 0.8},
    "Machine Learning": {"Data Scientist": 0.95, "AI/ML Engineer": 1.0},
    # Medical
    "Diagnosis": {"General Physician": 0.95},
    "Patient Care": {"General Physician": 0.8, "Registered Nurse": 0.95},
    # Law
    "Contrast Law": {"Corporate Lawyer": 0.9},
    "Legal Research": {"Corporate Lawyer": 0.8, "Human Rights Lawyer": 0.9},
    # Finance
    "Taxation": {"Chartered Accountant": 0.95},
    "Valuation": {"Investment Banker": 0.95, "Chartered Accountant": 0.7},
    # Engineering
    "AutoCAD": {"Mechanical Engineer": 0.9, "Civil Engineer": 0.8, "Architect": 0.9},
    "Thermodynamics": {"Mechanical Engineer": 0.95},
    # Design
    "Figma": {"UI/UX Designer": 0.95, "Graphic Designer": 0.8},
    "Photoshop": {"Graphic Designer": 0.95, "UI/UX Designer": 0.6},
    # General
    "Communication": {"Marketing Manager": 0.8, "Product Manager": 0.8, "School Teacher": 0.9, "Public Relations Manager": 0.9},
    "Leadership": {"Product Manager": 0.9, "Project Manager": 0.9, "Fitness Director": 0.8},
}

INTEREST_CAREER_MAP = {
    "Technology": {"Software Engineer": 0.9, "AI/ML Engineer": 0.9},
    "Medical": {"General Physician": 0.95, "Registered Nurse": 0.9},
    "Healthcare": {"General Physician": 0.9, "Registered Nurse": 1.0, "Sports Physiotherapist": 0.8},
    "Law": {"Corporate Lawyer": 0.95, "Human Rights Lawyer": 0.95},
    "Business": {"Product Manager": 0.9, "Marketing Manager": 0.8, "Investment Banker": 0.8},
    "Teaching": {"School Teacher": 1.0, "University Professor": 0.95},
    "Design": {"UI/UX Designer": 0.9, "Graphic Designer": 0.9, "Architect": 0.8},
    "Agriculture": {"Agricultural Scientist": 1.0, "Environmental Consultant": 0.8},
    "Aviation": {"Aircraft Pilot": 1.0},
    "Sports": {"Fitness Director": 0.9, "Sports Physiotherapist": 0.9},
}

EDUCATION_WEIGHTS = {
    "High School": 0.6,
    "Associate's Degree": 0.75,
    "Bachelor's Degree": 1.0,
    "Master's Degree": 1.15,
    "PhD": 1.25,
    "Bootcamp": 0.85,
    "Self-taught": 0.8,
}

def predict_careers(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    ML prediction engine that calculates career matches based on skills, interests, and profile.
    """
    from app.api.endpoints.careers import CAREER_DATA
    
    # Dynamically build specific careers set from available data
    ALL_CAREERS = list(CAREER_DATA.keys())
    scores = {career: 0.0 for career in ALL_CAREERS}
    
    # Score from skills
    for skill in (data.get("skills") or []):
        if skill in SKILL_CAREER_MAP:
            for career, weight in SKILL_CAREER_MAP[skill].items():
                if career in scores:
                    scores[career] += weight * 30
    
    # Score from interests
    for interest in (data.get("interests") or []):
        if interest in INTEREST_CAREER_MAP:
            for career, weight in INTEREST_CAREER_MAP[interest].items():
                if career in scores:
                    scores[career] += weight * 25
    
    # Integrated quiz scores (domain affinity)
    quiz_scores = data.get("quiz_scores", {}) or {}
    for domain, score in quiz_scores.items():
        # Map domain score to careers in that domain
        for career_name, career_info in CAREER_DATA.items():
            if career_info.get("category") == domain:
                scores[career_name] += (score / 100) * 40
    
    # Constants for adjustments
    edu = data.get("education_level", "Bachelor's Degree")
    edu_mult = EDUCATION_WEIGHTS.get(edu, 1.0)
    gpa = data.get("gpa", 3.0) or 3.0
    gpa_bonus = (gpa - 2.0) / 2.0 * 5 if gpa >= 2.0 else 0
    exp = data.get("experience_years", 0) or 0
    exp_bonus = min(exp * 2, 10)
    
    # Apply profile multipliers
    for career in scores:
        scores[career] = scores[career] * edu_mult + gpa_bonus + exp_bonus
        
    # Sort and filter results
    sorted_careers = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    max_raw = sorted_careers[0][1] if sorted_careers and sorted_careers[0][1] > 0 else 1
    
    results = []
    for i, (career_name, raw_score) in enumerate(sorted_careers[:3]):
        career_info = CAREER_DATA.get(career_name)
        if not career_info: continue
        
        # Calculate matching percentage
        match_pct = (raw_score / max_raw) * 95 if max_raw > 0 else 50
        match_pct = min(98, max(50, match_pct - (i * 5)))
        
        results.append({
            "rank": i + 1,
            "career_name": career_name,
            "match_percentage": round(match_pct, 1),
            "category": career_info.get("category", ""),
            "avg_salary": career_info.get("avg_salary", 0),
            "growth_rate": career_info.get("growth_rate", 0),
            "description": career_info.get("description", ""),
            "required_skills": career_info.get("required_skills", []),
            "roadmap": career_info.get("roadmap", {}),
            "resources": career_info.get("resources", []),
        })
    
    return results

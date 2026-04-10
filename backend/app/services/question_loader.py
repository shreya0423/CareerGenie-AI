import json
import os
from pathlib import Path
from typing import Dict, List, Any


def load_questions():
    file_path = os.path.join(os.path.dirname(__file__), "../data/assessment_questions.json")
    
    with open(file_path, "r") as f:
        questions = json.load(f)
    
    return questions

def _load_data() -> Dict[str, Any]:
    try:
        return load_questions()
    except Exception as e:
        print(f"Error loading questions: {e}")
        return {"general": {"technical": [], "aptitude": [], "personality": [], "interest": []}, "fields": {}}

def _format_questions(questions_list: List[Dict[str, Any]], category: str) -> List[Dict[str, Any]]:
    formatted = []
    letters = ["A", "B", "C", "D", "E"]
    for i, q in enumerate(questions_list):
        raw_options = q.get("options", [])
        weights = q.get("weights", {})
        
        formatted_options = []
        for j, opt_text in enumerate(raw_options):
            val = letters[j] if j < len(letters) else str(j)
            
            # Simple scoring
            score_val = 10 - (j * 2) if j < 4 else 2
            
            formatted_options.append({
                "value": val,
                "label": opt_text,
                "score_value": max(score_val, 0),
                "career_scores": weights
            })
            
        formatted.append({
            "id": i + 1,
            "text": q.get("question", "Question?"),
            "category": category,
            "options": formatted_options
        })
    return formatted

def get_general_questions(limit_per_category: int = 10) -> Dict[str, List[Dict[str, Any]]]:
    data = _load_data()
    general = data.get("general", {})
    categories = ["technical", "aptitude", "personality", "interest"]
    result = {}
    for cat in categories:
        qs = general.get(cat, [])
        formatted = _format_questions(qs, cat)
        result[cat] = formatted[:limit_per_category]
    return result

def get_field_questions(field_name: str, limit: int = 15) -> List[Dict[str, Any]]:
    data = _load_data()
    fields = data.get("fields", {})
    qs = fields.get(field_name, [])
    formatted = _format_questions(qs, field_name)
    return formatted[:limit]


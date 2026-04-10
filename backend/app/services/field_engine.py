import json
from pathlib import Path
from typing import Dict, List, Any

UG_DEGREE_MAP = {
    "Technology & Computer Science": [
        "B.Tech Computer Science", "B.Tech Artificial Intelligence", "BCA", 
        "B.Sc Computer Science", "B.Sc Data Science", "B.Sc Cyber Security"
    ],
    "Engineering": [
        "B.Tech Mechanical", "B.Tech Civil", "B.Tech Electrical", 
        "B.Tech Electronics", "B.Tech Aerospace"
    ],
    "Medical & Healthcare": [
        "MBBS", "BDS", "BAMS", "BHMS", "B.Sc Nursing", "B.Pharm"
    ],
    "Business & Management": [
        "BBA", "BBA Marketing", "BBA Finance", "BMS"
    ],
    "Commerce & Finance": [
        "B.Com", "B.Com Accounting", "B.Com Finance", "BBA Finance"
    ],
    "Design & Creative Arts": [
        "B.Des", "B.F.A", "B.Sc Animation", "B.Sc Fashion Design"
    ],
    "Science & Research": [
        "B.Sc Physics", "B.Sc Chemistry", "B.Sc Mathematics", "B.Sc Biology"
    ],
    "Law & Legal Studies": [
        "BA LLB", "BBA LLB", "B.Com LLB"
    ],
    "Architecture & Planning": [
        "B.Arch", "B.Plan", "B.Design (Interior)"
    ],
    "Humanities & Social Sciences": [
        "BA Psychology", "BA Sociology", "BA History", "BA Political Science"
    ],
    "Education & Teaching": [
        "B.Ed", "BA B.Ed", "B.Sc B.Ed"
    ],
    "Media & Communication": [
        "B.A. Journalism", "B.A. Mass Communication", "B.Sc Media Science"
    ],
    "Hospitality & Culinary Arts": [
        "BHM", "B.Sc Hotel Management", "BA Culinary Arts"
    ],
    "Agriculture & Environmental Studies": [
        "B.Sc Agriculture", "B.Sc Forestry", "B.Sc Environmental Science"
    ],
    "Aviation & Maritime": [
        "B.Sc Aviation", "B.Tech Marine Engineering", "B.Sc Nautical Science"
    ],
    "Sports & Physical Education": [
        "B.P.Ed", "B.Sc Sports Science", "BA Physical Education"
    ]
}

class FieldEngine:
    def __init__(self):
        self.file_path = Path("app/data/assesment_questions.json")
        if not self.file_path.exists():
            self.file_path = Path("app/data/assessment_questions.json")
            
    def get_fields(self):
        return list(UG_DEGREE_MAP.keys())

    def _load_raw_data(self):
        if not self.file_path.exists():
            return []
        with open(self.file_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def load_field_questions(self, field_name: str, limit=10):
        raw_data = self._load_raw_data()
        questions = []
        for group in raw_data:
            if isinstance(group, list):
                questions.extend(group)
            elif isinstance(group, dict) and "question" in group:
                questions.append(group)
                
        # Filter questions implicitly by matching their existing weights to the field's mapped degrees
        # Or just text match since JSON might not explicitly have all fields mappings clearly separated
        field_degrees = UG_DEGREE_MAP.get(field_name, [field_name])
        
        filtered_questions = []
        letters = ["A", "B", "C", "D"]
        for q in questions:
            weights = q.get("weights", {})
            q_text = q.get("question", "")
            
            # Match if any of the weights keys contain parts of the field name or degrees
            is_match = False
            for w_key in weights.keys():
                for fd in field_degrees:
                    # simplistic matching
                    if fd.lower().split()[0] in w_key.lower() or "tech" in w_key.lower() and "tech" in fd.lower():
                        is_match = True
                if field_name.split()[0].lower() in w_key.lower():
                    is_match = True
                    
            if not is_match and any(fd.split()[-1].lower() in q_text.lower() for fd in field_degrees):
                is_match = True
                
            # If still not matched, maybe check raw options
            if not is_match:
                for opt in q.get("options", []):
                    if field_name.split()[0].lower() in opt.lower():
                        is_match = True
                        break

            # Fallback if no robust matches found for esoteric fields (to ensure we always return questions)
            if not is_match and len(filtered_questions) < 2:
                is_match = True # include an initial few if none matched strictly

            if is_match:
                formatted_options = []
                for j, opt in enumerate(q.get("options", [])[:4]):
                    val = letters[j] if j < len(letters) else str(j)
                    score_val = 10 - (j * 2)
                    formatted_options.append({
                        "value": val,
                        "label": opt,
                        "score_value": max(score_val, 0)
                    })
                
                filtered_questions.append({
                    "id": len(filtered_questions) + 1,
                    "text": q_text,
                    "options": formatted_options
                })
                
                if len(filtered_questions) >= limit:
                    break
        
        # If very few matched, just pad with general questions
        if len(filtered_questions) < limit:
            for q in questions[:limit*2]:
                if any(fq["text"] == q.get("question") for fq in filtered_questions):
                    continue
                formatted_options = []
                for j, opt in enumerate(q.get("options", [])[:4]):
                    val = letters[j] if j < len(letters) else str(j)
                    score_val = 10 - (j * 2)
                    formatted_options.append({
                        "value": val, "label": opt, "score_value": max(score_val, 0)
                    })
                filtered_questions.append({
                    "id": len(filtered_questions) + 1,
                    "text": q.get("question", ""),
                    "options": formatted_options
                })
                if len(filtered_questions) >= limit:
                    break

        return filtered_questions

    def get_ug_courses_for_field(self, field_name: str) -> List[str]:
        return UG_DEGREE_MAP.get(field_name, [])

    def calculate_field_score(self, answers: List[Dict]) -> int:
        total_earned = sum(int(ans.get("score_value", 0)) for ans in answers)
        max_possible = len(answers) * 10 if answers else 100
        return int((total_earned / max_possible) * 100) if max_possible > 0 else 0

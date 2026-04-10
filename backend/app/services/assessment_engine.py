import json
import os
from pathlib import Path
from typing import Dict, List, Any

# Map 16 fields to some keywords to locate them in the JSON
FIELD_KEYWORDS = {
    "Technology & Computer Science": ["B.Tech Computer Science", "B.Tech Artificial Intelligence", "BCA", "Cyber Security", "Data Science"],
    "Engineering": ["B.Tech Mechanical", "B.Tech Civil", "B.Tech Electrical", "B.Tech Aerospace"],
    "Medical & Healthcare": ["MBBS", "B.Sc Nursing", "B.Pharm", "BDS", "BPT"],
    "Business & Management": ["BBA", "Management", "Business"],
    "Commerce & Finance": ["B.Com", "Finance", "Accounting"],
    "Design & Creative Arts": ["B.Des", "Design", "Fashion", "Animation"],
    "Science & Research": ["B.Sc Physics", "B.Sc Chemistry", "B.Sc Biology", "Research"],
    "Law & Legal Studies": ["LLB", "Law"],
    "Architecture & Planning": ["B.Arch", "Architecture", "Planning"],
    "Humanities & Social Sciences": ["BA Psychology", "BA Sociology", "BA History", "Humanities"],
    "Education & Teaching": ["B.Ed", "Teaching", "Education"],
    "Media & Communication": ["B.A. Journalism", "Mass Communication", "Media"],
    "Hospitality & Culinary Arts": ["BHM", "Hospitality", "Culinary"],
    "Agriculture & Environmental Studies": ["B.Sc Agriculture", "Environmental", "Forestry"],
    "Aviation & Maritime": ["Aviation", "Maritime", "Nautical", "Pilot"],
    "Sports & Physical Education": ["B.P.Ed", "Sports", "Physical Education"],
    "PLAY": ["B.P.Ed", "Sports", "Physical Education"]
}

class AssessmentEngine:
    def __init__(self):
        self.file_path = Path("app/data/assesment_questions.json")
        if not self.file_path.exists():
            self.file_path = Path("app/data/assessment_questions.json")
        self.categories = ["technical", "aptitude", "personality", "interests"]

    def _load_raw_data(self):
        if not self.file_path.exists():
            return []
        with open(self.file_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def get_categorized_questions(self, limit_per_category=10):
        raw_data = self._load_raw_data()
        questions = []
        for group in raw_data:
            if isinstance(group, list):
                questions.extend(group)
            elif isinstance(group, dict) and "question" in group:
                questions.append(group)
        
        unique_questions = []
        seen = set()
        for q in questions:
            if q.get("question") not in seen:
                seen.add(q.get("question"))
                unique_questions.append(q)

        categorized = {cat: [] for cat in self.categories}
        letters = ["A", "B", "C", "D", "E"]
        
        # We categorize the questions sequentially: Technical, Aptitude, Personality, Interests.
        for i, q in enumerate(unique_questions):
            cat = self.categories[i % 4]
            raw_options = q.get("options", [])
            weights = q.get("weights", {})
            
            formatted_options = []
            for j, opt_text in enumerate(raw_options):
                val = letters[j] if j < len(letters) else str(j)
                score_val = 10 - (j * 2) if j < 4 else 2
                
                # Map specific existing degrees to the 16 fields dynamically
                mapped_fields_scores = {}
                for degree, w in weights.items():
                    for field_name, keywords in FIELD_KEYWORDS.items():
                        if any(kw.lower() in degree.lower() for kw in keywords) or any(kw.lower() in str(q).lower() for kw in keywords):
                            mapped_fields_scores[field_name] = mapped_fields_scores.get(field_name, 0) + w
                
                # If no mapping matched, distribute evenly (fallback)
                if not mapped_fields_scores and weights:
                    for field_name in FIELD_KEYWORDS:
                        mapped_fields_scores[field_name] = 1 # minimal weight
                
                formatted_options.append({
                    "value": val,
                    "label": opt_text,
                    "score_value": max(score_val, 0),
                    "career_scores": mapped_fields_scores
                })
                
            categorized[cat].append({
                "id": i + 1,
                "text": q.get("question", "Question?"),
                "category": cat,
                "options": formatted_options
            })

        return {cat: categorized[cat][:limit_per_category] for cat in self.categories}

    def calculate_scores(self, answers_by_category) -> Dict[str, int]:
        results = {}
        for cat in self.categories:
            answers = answers_by_category.get(cat, [])
            total_earned = sum(int(ans.get("score_value", 0)) for ans in answers)
            max_possible = len(answers) * 10 if answers else 100
            
            percentage = int((total_earned / max_possible) * 100) if max_possible > 0 else 0
            results[cat] = percentage
        return results

    def determine_top_fields(self, overall_career_scores: Dict[str, int]) -> List[str]:
        # Sort fields by score descending
        sorted_fields = sorted(overall_career_scores.items(), key=lambda x: x[1], reverse=True)
        return [f[0] for f in sorted_fields[:3]]

    def get_assessment_insights(self, scores: Dict[str, int]) -> List[str]:
        insights = []
        for cat, score in scores.items():
            level = "Strong" if score >= 80 else "Moderate" if score >= 50 else "Needs Improvement"
            insights.append(f"{level} proficiency and alignment in {cat.capitalize()} areas.")
        return insights

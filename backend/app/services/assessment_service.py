import json
import os
from pathlib import Path

class AssessmentService:
    def __init__(self):
        # We handle the typo just in case
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
                
        # Remove duplicates
        unique_questions = []
        seen = set()
        for q in questions:
            if q.get("question") not in seen:
                seen.add(q.get("question"))
                unique_questions.append(q)

        # Categorize
        categorized = {cat: [] for cat in self.categories}
        
        letters = ["A", "B", "C", "D", "E"]
        
        for i, q in enumerate(unique_questions):
            cat = self.categories[i % 4]
            
            raw_options = q.get("options", [])
            weights = q.get("weights", {})
            
            formatted_options = []
            for j, opt_text in enumerate(raw_options):
                val = letters[j] if j < len(letters) else str(j)
                
                # To simulate scoring, first option gives max points (10), others give less, to have varied score
                score_val = 10 - (j * 2) if j < 4 else 2
                
                formatted_options.append({
                    "value": val,
                    "label": opt_text,
                    "score_value": max(score_val, 0),
                    "career_scores": weights  # keeping mapping for ML
                })
                
            categorized[cat].append({
                "id": i + 1,
                "text": q.get("question", "Question?"),
                "category": cat,
                "options": formatted_options
            })

        # Cap length
        return {cat: categorized[cat][:limit_per_category] for cat in self.categories}

    def calculate_scores(self, answers_by_category):
        """
        answers_by_category e.g.:
        {
          "technical": [ { "question_id": 1, "score_value": 10 }, ... ],
          "aptitude": [ ... ],
          ...
        }
        Returns percentages (max 100)
        """
        results = {}
        for cat in self.categories:
            answers = answers_by_category.get(cat, [])
            total_earned = sum(ans.get("score_value", 0) for ans in answers)
            max_possible = len(answers) * 10 if answers else 100
            
            if max_possible > 0:
                percentage = int((total_earned / max_possible) * 100)
            else:
                percentage = 0
            results[cat] = percentage
            
        return results

    def get_assessment_insights(self, scores):
        insights = []
        for cat, score in scores.items():
            level = "Strong" if score >= 80 else "Moderate" if score >= 50 else "Needs Improvement"
            insights.append(f"{level} in {cat.capitalize()}")
        return insights

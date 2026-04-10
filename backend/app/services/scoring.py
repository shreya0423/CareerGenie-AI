from collections import defaultdict
from app.services.question_loader import load_questions

def calculate_scores(answers):
    questions = load_questions()
    scores = defaultdict(int)

    for i, answer in enumerate(answers):
        question = questions[i]
        weights = question.get("weights", {})

        # Add scores
        for course, value in weights.items():
            scores[course] += value

    return dict(scores)
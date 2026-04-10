import json
from pathlib import Path

file_path = Path("app/data/assessment_questions.json")
with open(file_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# The mapping defining which keywords belong to which field
domain_map = {
    "Technology & Computer Science": ["Computer Science", "Artificial Intelligence", "Data Science", "Cyber Security", "Information Technology", "Software"],
    "Engineering": ["Mechanical", "Civil", "Electrical", "Electronics", "Mechatronics", "Automobile", "Chemical", "Aerospace"],
    "Medical & Healthcare": ["MBBS", "BDS", "Nursing", "Pharm", "Physiotherapy", "Radiology", "Medical Laboratory", "BPT", "Physician", "Dietitian"],
    "Business & Management": ["BBA", "Business", "Management", "Entrepreneurship", "Human Resource", "HR", "MBA", "Marketing"],
    "Commerce & Finance": ["B.Com", "Accounting", "Finance", "Taxation", "Banking", "Financial Markets", "Chartered Accountant", "Investment"],
    "Design & Creative Arts": ["B.Des", "Design", "Graphics", "Animation", "BFA", "Multimedia", "Art", "Interior"],
    "Science & Research": ["B.Sc Chemistry", "B.Sc Physics", "B.Sc Mathematics", "B.Sc Statistics", "B.Sc Biotechnology", "B.Sc Microbiology", "Science", "Research"],
    "Law & Legal Studies": ["LLB", "Law", "BA LLB", "BBA LLB", "B.Com LLB", "Corporate Lawyer", "Legal"],
    "Architecture & Planning": ["B.Arch", "B.Plan", "Architecture", "Planning", "Architect"],
    "Humanities & Social Sciences": ["BA Psychology", "BA Sociology", "BA Political Science", "BA Economics", "Social Science"],
    "Education & Teaching": ["B.Ed", "Teaching", "Education", "Professor", "Teacher"],
    "Media & Communication": ["BA Journalism", "B.Sc Animation", "Mass Communication", "Media", "Journalism", "Public Relations"],
    "Hospitality & Culinary Arts": ["Hotel Management", "Culinary", "Hospitality", "Chef"],
    "Agriculture & Environmental Studies": ["Agriculture", "Environmental Science", "Forestry"],
    "Aviation & Maritime": ["Aviation", "Maritime", "Pilot", "Marine"],
    "Sports & Physical Education": ["B.P.Ed", "Sports", "Physical Education", "Fitness"]
}

# Clear existing fields
data["fields"] = {k: [] for k in domain_map.keys()}

# Extract ALL questions from the old structure where they were dumped
all_questions = []
for k, v in data.get("general", {}).items():
    for q in v:
        if q not in all_questions:
            all_questions.append(q)

for q in all_questions:
    weights = q.get("weights", {})
    for weight_key in weights.keys():
        for domain, keywords in domain_map.items():
            if any(k.lower() in weight_key.lower() for k in keywords):
                if q not in data["fields"][domain]:
                    data["fields"][domain].append(q)

# Fallback: Generate some default questions for fields that ended up empty or have < 5 questions
default_questions = {
    "Aviation & Maritime": [
        {"question": "How do you handle high-pressure situations with split-second decisions?", "options": ["Stay calm and follow procedure", "Evaluate quick alternatives", "Communicate with team", "Analyze instrument data"], "weights": {"Pilot": 5, "Aviation": 5}},
        {"question": "What interests you about machinery?", "options": ["Aerodynamics", "Navigation systems", "Engine mechanics", "Vessel controls"], "weights": {"Pilot": 5, "Maritime": 5}}
    ],
    "Sports & Physical Education": [
        {"question": "What is the most important aspect of training?", "options": ["Consistency", "Diet and nutrition", "Mental focus", "Technique analysis"], "weights": {"Sports": 5, "Fitness": 5}},
        {"question": "How do you prefer leading a team?", "options": ["By example on the field", "Through strategic coaching", "Analyzing opponent's weakness", "Motivating individuals"], "weights": {"Sports": 5, "Fitness": 5}}
    ],
    "Hospitality & Culinary Arts": [
        {"question": "How do you ensure customer satisfaction?", "options": ["Attentive service", "Perfecting the product/food", "Creating a welcoming environment", "Efficient problem solving"], "weights": {"Hotel Management": 5, "Culinary": 5}},
        {"question": "What element of event planning excites you?", "options": ["Menu creation", "Venue staging", "Guest coordination", "Logistics"], "weights": {"Hotel Management": 5, "Culinary": 5}}
    ],
    "Education & Teaching": [
        {"question": "How do you prefer explaining a complex topic?", "options": ["Using simple analogies", "Through visual aids", "Interactive exercises", "Detailed reading material"], "weights": {"Teaching": 5}},
        {"question": "What is the key to student success?", "options": ["Engagement", "Discipline", "Curiosity", "Consistent grading"], "weights": {"Teaching": 5}}
    ]
}

for domain, qs in data["fields"].items():
    if len(qs) < 3 and domain in default_questions:
        data["fields"][domain].extend(default_questions[domain])

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("Mapping fixed!")

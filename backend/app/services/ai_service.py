import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-pro")

def get_career_recommendation(user_scores: dict):
    prompt = f"""
    Act as a career counselor.

    Based on the following assessment scores:
    {user_scores}

    Suggest:
    1. Top 3 career streams
    2. Best courses
    3. Reason for recommendation
    4. Skills to improve

    Keep it structured and clear.
    """

    response = model.generate_content(prompt)
    return response.text
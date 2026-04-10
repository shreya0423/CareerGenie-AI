import httpx
import json
from typing import Dict, Any, List

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "mistral"

class OllamaService:
    @staticmethod
    async def _generate(prompt: str) -> str:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    OLLAMA_URL,
                    json={
                        "model": MODEL,
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=60.0
                )
                response.raise_for_status()
                return response.json().get("response", "")
            except Exception as e:
                print(f"Ollama generation error: {e}")
                raise

    @staticmethod
    async def chat(message: str, history: List[Dict[str, str]] = None) -> str:
        prompt = "You are Claude, a highly intelligent and helpful conversational AI Career Advisor. You help users navigate their career paths, suggest skills, streams, and answer career-related questions like an expert counselor.\n\n"
        if history:
            for msg in history:
                role = "User" if msg.get("role") == "user" else "Claude"
                prompt += f"{role}: {msg.get('content')}\n"
        prompt += f"User: {message}\nClaude:"
        return await OllamaService._generate(prompt)
        
    @staticmethod
    def _parse_json(text: str, default: dict) -> dict:
        try:
            cleaned_text = text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
            return json.loads(cleaned_text.strip())
        except Exception:
            return default

    @staticmethod
    async def recommend(data: Dict[str, Any]) -> dict:
        # Legacy recommend hook
        return await OllamaService.evaluate_general_assessment(data)

    @staticmethod
    async def evaluate_general_assessment(data: Dict[str, Any]) -> dict:
        prompt = f"""
        You are an AI Career Advisor. Based on this general assessment score across Technical, Aptitude, Personality, and Interests, predict the best career fields.
        Data: {json.dumps(data, indent=2)}

        Return strictly ONLY a JSON object in this format (no markdown):
        {{
            "streams": ["Stream 1", "Stream 2"],
            "courses": ["Course 1", "Course 2"],
            "careers": ["Career 1", "Career 2"],
            "skills": ["Skill 1", "Skill 2"],
            "roadmap": ["Step 1", "Step 2", "Step 3"],
            "reason": "Detailed explanation of why this path suits them."
        }}
        """
        response_text = await OllamaService._generate(prompt)
        return OllamaService._parse_json(response_text, {
            "streams": [], "courses": [], "careers": [], "skills": [], "roadmap": [], "reason": "Error parsing JSON"
        })

    @staticmethod
    async def evaluate_field_assessment(field_name: str, data: Dict[str, Any]) -> dict:
        prompt = f"""
        You are an AI Career Advisor. Based on an assessment specifically for the field of '{field_name}', predict the best UG courses and careers.
        Data: {json.dumps(data, indent=2)}

        Return strictly ONLY a JSON object in this format (no markdown):
        {{
            "streams": ["{field_name} specialization 1", "{field_name} specialization 2"],
            "courses": ["UG Course 1", "UG Course 2"],
            "careers": ["Role 1", "Role 2"],
            "skills": ["Skill 1", "Skill 2"],
            "roadmap": ["Step 1", "Step 2", "Step 3"],
            "reason": "Detailed explanation of why these specific roles suit them."
        }}
        """
        response_text = await OllamaService._generate(prompt)
        return OllamaService._parse_json(response_text, {
            "streams": [], "courses": [], "careers": [], "skills": [], "roadmap": [], "reason": "Error parsing JSON"
        })

    @staticmethod
    async def generate_roadmap(career: str) -> dict:
        prompt = f"""
        Provide a comprehensive career roadmap for becoming a {career}. 
        Return strictly ONLY a JSON object in this format (no markdown):
        {{
            "steps": [
                {{
                    "phase": "Foundation",
                    "duration": "Duration (e.g. 6 months)",
                    "tasks": ["Task 1", "Task 2", "Task 3"]
                }},
                {{
                    "phase": "Core Skills",
                    "duration": "Duration (e.g. 1 year)",
                    "tasks": ["Task 1", "Task 2", "Task 3"]
                }},
                {{
                    "phase": "Advanced Specialization",
                    "duration": "Duration (e.g. 1 year+)",
                    "tasks": ["Task 1", "Task 2", "Task 3"]
                }}
            ]
        }}
        """
        response_text = await OllamaService._generate(prompt)
        return OllamaService._parse_json(response_text, {"steps": []})

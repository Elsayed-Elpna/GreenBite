import json
from openai import OpenAI
from django.conf import settings
from project.utils.normalize import normalize_ingredient_name
from .types import PlannedRecipe

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_ai_recipes(food_logs, limit):
    ingredients = [log.name for log in food_logs]

    prompt = f"""
Generate {limit} simple home recipes using ONLY these ingredients:
{ingredients}

Rules:
- JSON ONLY
- Each recipe: title, ingredients (list)
- No extra ingredients except salt, oil, water

JSON format:
[
  {{
    "title": "string",
    "ingredients": ["string"]
  }}
]
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    try:
        data = json.loads(response.choices[0].message.content)
    except Exception:
        raise ValueError("AI returned invalid JSON")

    recipes = []
    for r in data:
        recipes.append(
            PlannedRecipe(
                title=r["title"],
                ingredients=[
                    normalize_ingredient_name(i)
                    for i in r["ingredients"]
                ],
                source="ai"
            )
        )

    return recipes
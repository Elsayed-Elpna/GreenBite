import json
import os
from django.conf import settings
from django.core.cache import cache

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False




PROMPT_TEMPLATE = """
You are a professional chef.

Generate EXACTLY 5 recipes using ONLY these ingredients:
{ingredients}

RULES:
- Return JSON only (no text)
- Max 5 recipes
- No extra ingredients unless basic (salt, oil, water)
- Title ≤ 8 words
- Description ≤ 25 words
- Steps: short, numbered
- Simple home recipes only
- waste_items MUST contain ONLY inedible items. Never put edible food in waste_items.
- If no waste is expected, waste_items must be [].

JSON format:
[
  {{
    "recipe": "string",
  "ingredients": ["string", "..."],
  "serving": integer,
  "calories": integer,
  "cuisine": "string",
  "mealTime": "breakfast|lunch|dinner|snack|brunch",
  "title": "",
  "description": "",
  "ingredients": [],
  "steps": [],
  "estimated_time": "",
  "difficulty": "easy|medium|hard"
  "waste": [
    {
      "name": "string",
      "reason": "inedible part (peel/shell/bone/tea bag/etc.)",
      "disposal": "compost|trash|recycle",
      "estimated_amount": number,
      "unit": "g|piece|tbsp"
    }
  ],
  }}
]
"""

def get_openai_client():
    if OPENAI_AVAILABLE and hasattr(settings, 'OPENAI_API_KEY'):
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    return None

def generate_meals_openai(ingredients):
    client = get_openai_client()
    if not client:
        return []
        
    ingredients = ingredients[:10]  # HARD LIMIT

    prompt = PROMPT_TEMPLATE.format(ingredients=", ".join(ingredients))

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=700        
        )

        content = response.choices[0].message.content

        return json.loads(content)
    except (json.JSONDecodeError, Exception):
        return []

def generate_recipes_with_cache(ingredients):
    key = "recipes:" + ",".join(sorted(ingredients))
    
    cached = cache.get(key)
    if cached:
        return cached

    recipes = generate_meals_openai(ingredients)
    cache.set(key, recipes, timeout=86400)  # 24 hours
    return recipes


# HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct"
# HF_TOKEN = os.getenv("HF_API_TOKEN")

# HEADERS = {
#     "Authorization": f"Bearer {HF_TOKEN}",
#     "Content-Type": "application/json"
# }

# def generate_recipes_from_ai(ingredients):
#     ingredients = ingredients[:10]

#     prompt = f"""
# You are a professional chef.

# TASK:
# Generate EXACTLY 5 simple recipes using ONLY these ingredients:
# {ingredients}

# RULES:
# - Maximum recipes: 5
# - JSON output ONLY
# - No markdown
# - Titles max 8 words
# - Descriptions max 25 words
# - Steps must be short
# - No extra commentary

# FORMAT:
# [
#   {{
#     "title": "",
#     "description": "",
#     "ingredients": [],
#     "steps": [],
#     "estimated_time": "",
#     "difficulty": "easy | medium | hard"
#   }}
# ]
# """

#     payload = {
#         "inputs": prompt,
#         "parameters": {
#             "max_new_tokens": 700,
#             "temperature": 0.5,
#             "return_full_text": False
#         }
#     }

#     response = requests.post(
#         HF_API_URL,
#         headers=HEADERS,
#         json=payload,
#         timeout=30
#     )

#     if response.status_code != 200:
#         return []

#     try:
#         text = response.json()[0]["generated_text"]
#         return json.loads(text)
#     except:
#         return []

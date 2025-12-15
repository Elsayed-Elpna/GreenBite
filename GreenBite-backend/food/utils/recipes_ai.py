import json
import os
from django.conf import settings
from django.core.cache import cache
from .prompts import waste_prompt

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


#returns a dict of meal, waste_items, general_tips
def generate_waste_profile_openai(meal: str, context: str = ""):
  client = get_openai_client()
  if not client:
    return {"meal": meal, "waste_items": [], "general_tips":[]}
  meal_clean = (meal or "").strip()[:120]
  context_clean = (context or "").strip()[:500]

  prompt = waste_prompt(meal, context).format(meal=meal_clean, context=context_clean)

  try:
    response = client.chat.completions.create(
      model= "gpt-4o-mini", 
      messages = [
          {"role": "system", "content": "Return JSON only. Do not include markdown."},
          {"role": "user", "content": prompt},
      ], temperature=0.5,
      max_tokens=650,
    )

    content = (response.choices[0].message.content or "").strip()
    data = json.loads(content)

    if not isinstance(data, dict):
      return {"meal": meal_clean, "waste_items": [], "general_tips":[]}
    
    if "meal" not in data:
      data["meal"] = meal_clean

    if "waste_items" not in data or not isinstance(data["waste_items"], list):
      data["waste_items"] = []

    if "general_tips" not in data or not isinstance(data["general_tips"], list):
      data["general_tips"] = []

    return data
  
  except (json.JSONDecodeError, Exception):
    return {"meal": meal_clean, "waste_items":[], "general_tips": []}

#cache result for 24 hrs
def generate_waste_profile_with_cache(meal: str, context: str = ""):
  meal_key = (meal or "").strip().lower()
  context_key = (context or "").strip().lower()

  key = "meal_waste:" + meal_key[:80] + ":" + context_key[:80]

  cached = cache.get(key)
  if cached:
    return cached
  
  data = generate_waste_profile_openai(meal=meal, context=context)
  cache.set(key, data, timeout=86400) #1 day
  return data





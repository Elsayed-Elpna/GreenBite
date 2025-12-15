import json
import os
import logging
from django.conf import settings
from django.core.cache import cache
from .prompts import waste_prompt

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """
You are a professional chef.

Create EXACTLY 5 meal ideas using ONLY these ingredients:
<<INGREDIENTS>>

STRICT RULES:
- Output MUST be valid JSON only (no markdown, no extra text).
- Do NOT add extra ingredients except: salt, pepper, oil, water.
- Name ≤ 8 words.
- Description ≤ 25 words.
- Steps must be a list of short strings (no numbering text).
- waste_items MUST contain ONLY inedible parts (peel/shell/bone/tea bag/etc.). Never include edible food.
- If no waste is expected, waste_items must be an empty list [] (not null).

RESPONSE SHAPE (return exactly this JSON object shape):
{
  "meals": [
    {
      "name": "string",
      "description": "string",
      "ingredients": ["string"],
      "steps": ["string"],
      "servings": 2,
      "time_minutes": 20,
      "difficulty": "easy",
      "cuisine": "string",
      "meal_time": "breakfast|lunch|dinner|snack|brunch",
      "waste_items": [
        {
          "name": "string",
          "reason": "inedible part",
          "disposal": "compost|trash|recycle",
          "estimated_amount": 0,
          "unit": "g|piece|tbsp"
        }
      ]
    }
  ]
}
"""

def get_openai_client():
    if not OPENAI_AVAILABLE:
        return None

    api_key = getattr(settings, "OPENAI_API_KEY", None)
    if not api_key:
        return None

    return OpenAI(api_key=api_key)


def fallback_meals(ingredients):
    ing = [str(i).strip() for i in (ingredients or []) if str(i).strip()]
    ing = ing[:10]
    base = ", ".join(ing) if ing else "available ingredients"
    return [
        {
            "name": f"Quick {base} Bowl",
            "description": "Simple meal suggestion (AI unavailable).",
            "ingredients": ing,
            "steps": [
                "Prep and wash ingredients.",
                "Cook main ingredient until done.",
                "Combine and season to taste.",
            ],
            "servings": 2,
            "time_minutes": 25,
            "difficulty": "easy",
            "cuisine": "",
            "meal_time": "lunch",
            "waste_items": [],
        },
        {
            "name": f"{base} Stir-Fry",
            "description": "Fast stir-fry style meal suggestion (AI unavailable).",
            "ingredients": ing,
            "steps": [
                "Slice ingredients into bite-size pieces.",
                "Stir-fry with oil and seasoning.",
                "Serve hot.",
            ],
            "servings": 2,
            "time_minutes": 20,
            "difficulty": "easy",
            "cuisine": "",
            "meal_time": "dinner",
            "waste_items": [],
        },
        {
            "name": f"{base} Soup",
            "description": "Light soup suggestion (AI unavailable).",
            "ingredients": ing,
            "steps": [
                "Simmer ingredients in water/stock.",
                "Add spices and adjust salt.",
                "Serve warm.",
            ],
            "servings": 3,
            "time_minutes": 35,
            "difficulty": "easy",
            "cuisine": "",
            "meal_time": "dinner",
            "waste_items": [],
        },
        {
            "name": f"{base} Omelet",
            "description": "Quick omelet-style idea (AI unavailable).",
            "ingredients": ing,
            "steps": [
                "Whisk eggs (if available) and prep fillings.",
                "Cook on a pan with oil.",
                "Fold and serve.",
            ],
            "servings": 1,
            "time_minutes": 12,
            "difficulty": "easy",
            "cuisine": "",
            "meal_time": "breakfast",
            "waste_items": [],
        },
        {
            "name": f"{base} Sandwich",
            "description": "Quick sandwich idea (AI unavailable).",
            "ingredients": ing,
            "steps": [
                "Prepare fillings.",
                "Assemble in bread/wrap (if available).",
                "Serve.",
            ],
            "servings": 1,
            "time_minutes": 10,
            "difficulty": "easy",
            "cuisine": "",
            "meal_time": "snack",
            "waste_items": [],
        },
    ]

def generate_meals_openai(ingredients):
    client = get_openai_client()
    if not client:
        logger.warning("OpenAI client unavailable; using fallback meals")
        return fallback_meals(ingredients)

    ing = [str(i).strip() for i in (ingredients or []) if str(i).strip()]
    ing = ing[:10]  # HARD LIMIT

    prompt = PROMPT_TEMPLATE.replace("<<INGREDIENTS>>", ", ".join(ing) if ing else "")

    try:
        # Prefer structured JSON responses where supported.
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Return JSON only. Do not include markdown."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.6,
                max_tokens=900,
                response_format={"type": "json_object"},
            )
        except TypeError:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Return JSON only. Do not include markdown."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.6,
                max_tokens=900,
            )

        content = (response.choices[0].message.content or "").strip()
        data = json.loads(content)

        # Accept either {"meals": [...]} or a raw list (backward compatibility)
        meals = None
        if isinstance(data, dict):
            meals = data.get("meals")
        elif isinstance(data, list):
            meals = data

        if not isinstance(meals, list):
            return fallback_meals(ing)

        normalized = []
        for m in meals[:5]:
            if not isinstance(m, dict):
                continue

            name = (m.get("name") or m.get("title") or m.get("recipe") or "").strip()
            description = (m.get("description") or "").strip()
            ingredients_list = m.get("ingredients") or []
            steps = m.get("steps") or m.get("instructions") or []
            waste_items = m.get("waste_items") or m.get("waste") or []

            if not isinstance(ingredients_list, list):
                ingredients_list = []
            if not isinstance(steps, list):
                steps = []
            if not isinstance(waste_items, list):
                waste_items = []

            normalized.append(
                {
                    "name": name or "Meal suggestion",
                    "description": description,
                    "ingredients": ingredients_list,
                    "steps": [str(s) for s in steps if str(s).strip()],
                    "servings": int(m.get("servings") or m.get("serving") or 2),
                    "time_minutes": int(m.get("time_minutes") or 20),
                    "difficulty": (m.get("difficulty") or "easy"),
                    "cuisine": (m.get("cuisine") or ""),
                    "meal_time": (m.get("meal_time") or m.get("mealTime") or "lunch"),
                    "waste_items": waste_items,
                }
            )

        return normalized if normalized else fallback_meals(ing)

    except Exception as e:
        logger.exception("Meal generation failed; using fallback meals. Error: %s", e)
        return fallback_meals(ing)

def generate_recipes_with_cache(ingredients):
    safe = [str(i).strip().lower() for i in (ingredients or []) if str(i).strip()]
    key = "recipes:" + ",".join(sorted(safe))

    cached = cache.get(key)
    if cached is not None:
        return cached

    recipes = generate_meals_openai(safe)
    cache.set(key, recipes, timeout=86400)  # 24 hours
    return recipes


#returns a dict of meal, waste_items, general_tips
def generate_waste_profile_openai(meal: str, context: str = ""):
  client = get_openai_client()
  if not client:
    return {"meal": meal, "waste_items": [], "general_tips":[]}
  meal_clean = (meal or "").strip()[:120]
  context_clean = (context or "").strip()[:500]

  prompt_template = waste_prompt(meal_clean, context_clean)
  prompt = (
    prompt_template
    .replace("{meal}", meal_clean)
    .replace("{context}", context_clean)
  )

  try:
    response = client.chat.completions.create(
      model= "gpt-4o-mini", 
      messages = [
          {"role": "system", "content": "Return JSON only. Do not include markdown."},
          {"role": "user", "content": prompt},
      ],
      temperature=0.5,
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





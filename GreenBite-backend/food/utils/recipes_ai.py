
from django.db.models import Q
from recipes.models import MealDBRecipe
from food.utils.meal_fallback import fallback_meals_from_mealdb
import json
import os
import logging
from django.conf import settings
from django.core.cache import cache
from .prompts import waste_prompt, recipe_prompt

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

logger = logging.getLogger(__name__)


def get_openai_client():
    if not OPENAI_AVAILABLE:
        return None

    api_key = getattr(settings, "OPENAI_API_KEY", None)
    if not api_key:
        return None

    return OpenAI(api_key=api_key)
def generate_meals_openai(ingredients):
    client = get_openai_client()
    if not client:
        logger.warning("OpenAI client unavailable; using fallback meals")
        scored = fallback_meals_from_mealdb(ingredients)
        return [mealdb_recipe_to_ai_shape(m) for _, m in scored]

    ing = [str(i).strip() for i in (ingredients or []) if str(i).strip()]
    ing = ing[:10]  # HARD LIMIT

    prompt = recipe_prompt(", ".join(ing) if ing else "")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": "You are a JSON API. Return ONLY valid JSON. No explanations. No markdown. No code blocks. Start with { and end with }."
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.6,
            max_tokens=1500,  
            response_format={"type": "json_object"},
        )

        content = (response.choices[0].message.content or "").strip()
        
        # Clean up potential markdown code blocks
        if content.startswith("```"):
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            content = "\n".join(lines).strip()
        
        content = content.strip()
        
        logger.debug(f"Raw OpenAI response (first 500 chars): {content[:500]}")
        
        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            logger.error(f"Problematic content: {content}")
            # Try to fix incomplete JSON by checking if it's just missing closing braces
            if not content.endswith("}"):
                logger.warning("Attempting to fix truncated JSON...")
                # Count opening vs closing braces
                open_braces = content.count("{")
                close_braces = content.count("}")
                missing = open_braces - close_braces
                if missing > 0:
                    content += "}" * missing
                    try:
                        data = json.loads(content)
                        logger.info("Successfully fixed truncated JSON")
                    except:
                        scored = fallback_meals_from_mealdb(ingredients)
                        return [mealdb_recipe_to_ai_shape(m) for _, m in scored]
            else:
                # scored = fallback_meals_from_mealdb(ingredients)
                return [mealdb_recipe_to_ai_shape(m) for _, m in scored]

        # Accept either {"meals": [...]} or a raw list
        meals = None
        if isinstance(data, dict):
            meals = data.get("meals")
        elif isinstance(data, list):
            meals = data

        if not isinstance(meals, list):
            logger.warning("No valid meals list found in response")
            return [mealdb_recipe_to_ai_shape(m) for _, m in fallback_meals_from_mealdb(ing)]

        normalized = []
        for m in meals[:5]:
            if not isinstance(m, dict):
                continue

            recipe = (m.get("name") or m.get("title") or m.get("recipe") or "").strip()
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
                    "recipe": recipe or "Meal suggestion",
                    "description": description,
                    "ingredients": ingredients_list,
                    "steps": [str(s) for s in steps if str(s).strip()],
                    "servings": int(m.get("servings") or m.get("serving") or 2),
                    "time_minutes": int(m.get("time_minutes") or 20),
                    "difficulty": (m.get("difficulty") or "easy"),
                    "cuisine": (m.get("cuisine") or ""),
                    "mealTime": (m.get("meal_time") or m.get("mealTime") or "lunch"),
                    "waste_items": waste_items,
                }
            )

        scored = fallback_meals_from_mealdb(ingredients)
        return normalized if normalized else [mealdb_recipe_to_ai_shape(m) for _, m in scored]

    except Exception as e:
        logger.exception("Meal generation failed; using fallback meals. Error: %s", e)
        scored = fallback_meals_from_mealdb(ing)
        return [mealdb_recipe_to_ai_shape(m) for _, m in scored]

def mealdb_recipe_to_ai_shape(meal: MealDBRecipe):
    ingredient_names = [
        it.get("name")
        for it in (meal.ingredients or [])
        if it.get("name")
    ]

    steps = [
        s.strip()
        for s in (meal.instructions or "").split("\n")
        if s.strip()
    ]

    return {
        "recipe": meal.recipe,
        "description": meal.category or "",
        "ingredients": ingredient_names,
        "steps": steps[:12],
        "servings": 2,
        "time_minutes": 30,
        "difficulty": meal.difficulty or "easy",
        "cuisine": meal.cuisine or "",
        "mealTime": meal.mealTime or "lunch",
        "waste_items": [],
        "source": "mealdb_fallback",
    }

def generate_recipes_with_cache(ingredients):
    safe = [str(i).strip().lower() for i in ingredients if str(i).strip()]
    key = "recipes:" + ",".join(sorted(safe))

    cached = cache.get(key)
    if cached:
        return cached

    ai_recipes = generate_meals_openai(safe)

    if ai_recipes:
        cache.set(key, ai_recipes, 86400)
        return ai_recipes

    meals = fallback_meals_from_mealdb(safe)

    serialized = [
        {
            "recipe": m.recipe,
            "ingredients": m.ingredients,
            "steps": m.instructions.split("\n"),
            "mealTime": "lunch",
            "difficulty": "easy",
            "waste_items": []
        }
        for m in meals
    ]

    cache.set(key, serialized, 86400)
    return serialized



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





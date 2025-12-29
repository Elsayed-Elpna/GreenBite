from django.db.models import Q
from recipes.models import MealDBRecipe
from food.utils.meal_fallback import fallback_meals_from_mealdb
import json
import os
import logging
from django.conf import settings
from django.core.cache import cache
from .prompts import waste_prompt, recipe_prompt, waste_ingredients_only_prompt

try:
    from openai import OpenAI
    # NEW: import OpenAI exception types (best-effort; names differ by SDK versions)
    try:
        from openai import APIError, APIConnectionError, RateLimitError, AuthenticationError, PermissionDeniedError, BadRequestError, NotFoundError
    except Exception:  # pragma: no cover
        APIError = APIConnectionError = RateLimitError = AuthenticationError = PermissionDeniedError = BadRequestError = NotFoundError = Exception

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

logger = logging.getLogger(__name__)


def get_openai_client():
    if not OPENAI_AVAILABLE:
        logger.warning("OpenAI SDK not installed (OPENAI_AVAILABLE=False).")
        return None

    # Note: inside Docker you must have OPENAI_API_KEY set in the container env
    api_key = getattr(settings, "OPENAI_API_KEY", None)
    if not api_key:
        logger.warning("OPENAI_API_KEY is missing in Django settings.")
        return None

    logger.info("OpenAI client initialized (key present: %s).", "yes")
    return OpenAI(api_key=api_key)


def _norm(s: str) -> str:
    return " ".join((s or "").lower().strip().split())

def _meal_mentions_any_ingredient(meal: dict, ing_norm: list[str]) -> bool:
    recipe = _norm(meal.get("recipe") or meal.get("title") or meal.get("name"))
    desc = _norm(meal.get("description"))
    ingredients_list = meal.get("ingredients") or []
    ingredients_text = " ".join(_norm(str(x)) for x in ingredients_list)

    blob = f"{recipe} {desc} {ingredients_text}"
    return any(i and i in blob for i in ing_norm)


def generate_meals_openai(ingredients):
    client = get_openai_client()
    if not client:
        logger.warning("OpenAI client unavailable; using fallback meals.")
        scored = fallback_meals_from_mealdb(ingredients or [])
        return [mealdb_recipe_to_ai_shape(m) for _, m in scored]

    ing = [str(i).strip() for i in (ingredients or []) if str(i).strip()][:10]
    ing_norm = [_norm(i) for i in ing]

    # IMPORTANT: Make your prompt strict (edit recipe_prompt too if needed)
    prompt = recipe_prompt(", ".join(ing) if ing else "")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a JSON API. Return ONLY valid JSON. "
                        "No explanations. No markdown. No code blocks."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.6,
            max_tokens=3500,
            response_format={"type": "json_object"},
           
        )

        content = (response.choices[0].message.content or "").strip()

        # If the model ever wraps in fences despite response_format, strip them.
        if content.startswith("```"):
            lines = content.splitlines()
            if lines and lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            content = "\n".join(lines).strip()

        logger.debug("OpenAI raw content (first 500): %r", content[:500])

        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            logger.exception("OpenAI returned invalid JSON. Falling back.")
            scored = fallback_meals_from_mealdb(ing)
            return [mealdb_recipe_to_ai_shape(m) for _, m in scored]

        meals = data.get("meals") if isinstance(data, dict) else (data if isinstance(data, list) else None)
        if not isinstance(meals, list):
            logger.warning(
                "OpenAI JSON didn't contain a valid 'meals' list. Falling back. data_type=%s data_keys=%s",
                type(data),
                list(data.keys()) if isinstance(data, dict) else None,
            )
            scored = fallback_meals_from_mealdb(ing)
            return [mealdb_recipe_to_ai_shape(m) for _, m in scored]

        normalized = []
        for m in meals[:6]:
            if not isinstance(m, dict):
                continue

            recipe = (m.get("name") or m.get("title") or m.get("recipe") or "").strip()
            description = (m.get("description") or "").strip()
            ingredients_list = m.get("ingredients") or []
            steps = m.get("steps") or m.get("instructions") or []

            if not isinstance(ingredients_list, list):
                ingredients_list = []
            if not isinstance(steps, list):
                steps = []
            # if not isinstance(waste_items, list):
            #     waste_items = []

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
                    "source": "openai",
                }
            )

        # ✅ Validate relevance: at least 1 meal must mention at least 1 input ingredient
        if not normalized or not any(_meal_mentions_any_ingredient(x, ing_norm) for x in normalized):
            logger.warning("AI meals not relevant to ingredients=%s. Falling back.", ing)
            scored = fallback_meals_from_mealdb(ing)
            return [mealdb_recipe_to_ai_shape(m) for _, m in scored]

        return normalized

    except Exception:
        logger.exception("OpenAI failed; using fallback meals.")
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
        "recipe": meal.title,
        "description": meal.category or "",
        "ingredients": ingredient_names,
        "steps": steps[:12],
        "servings": 2,
        "time_minutes": 30,
        "difficulty": meal.difficulty or "easy",
        "cuisine": meal.cuisine or "",
        "mealTime": (meal.meal_time or "lunch"),
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
        }
        for m in meals
    ]

    cache.set(key, serialized, 86400)
    return serialized


#returns a dict of meal, waste_items, general_tips
def generate_waste_profile_openai(meal: str = "", ingredients: str = ""):
  client = get_openai_client()
  if not client:
    return {"meal": meal, "waste_items": [], "general_tips":[]}
  meal_clean = (meal or "").strip()[:120]
  ingredients_clean = (ingredients or "").strip()[:500]

  ingredients_only_mode = (not meal_clean) and bool(ingredients_clean)
  if ingredients_only_mode:
    prompt = waste_ingredients_only_prompt(ingredients_clean)

  else:  
    prompt_template = waste_prompt(meal_clean, ingredients_clean)
    prompt = (
        prompt_template
        .replace("{meal}", meal_clean)
        .replace("{ingredients}", ingredients_clean)
    )

  try:
    response = client.responses.create(
      model= "gpt-4.1-mini", 
      store = False,
      input = [{"role": "user", "content": prompt}],
      text = {"format":{"type": "json_object"}},
    )

    content = (getattr(response, "output_text", None) or "").strip()
    if not content:
       raise ValueError("Empty model output")
    
    data = json.loads(content)

    if not isinstance(data, dict):
      if ingredients_only_mode:
        return {"meal": "", "ingredients_waste":[], "general_tips": []}
      return {"meal": meal_clean, "waste_items": [], "general_tips":[]}
    
    if ingredients_only_mode:
       data.setdefault("meal", "")
       if "ingredients_waste" not in data or not isinstance(data["ingredients_waste"],list):
          data["ingredients_waste"] = []
       if "general_tips" not in data or not isinstance(data["general_tips"], list):
          data["general_tips"] = []
       return data
    
    data.setdefault("meal", meal_clean)
    if "waste_items" not in data or not isinstance(data["waste_items"], list):
      data["waste_items"] = []

    if "general_tips" not in data or not isinstance(data["general_tips"], list):
      data["general_tips"] = []

    return data
  
  except (json.JSONDecodeError, Exception):
    if ingredients_only_mode:
       return {"meal" : "" ,"ingredients_waste": [], "general_tips": []}
    return {"meal": meal_clean, "waste_items": [], "general_tips": []}

#cache result for 24 hrs
def generate_waste_profile_with_cache(meal: str, ingredients: str = ""):
  meal_key = (meal or "").strip().lower()
  ingredients_key = (ingredients or "") #.strip().lower()

  key = "meal_waste:" + meal_key[:80] + ":" + ingredients_key[:80]

  cached = cache.get(key)
  if cached:
    return cached
  
  data = generate_waste_profile_openai(meal=meal, ingredients=ingredients)
  cache.set(key, data, timeout=86400) #1 day
  return data





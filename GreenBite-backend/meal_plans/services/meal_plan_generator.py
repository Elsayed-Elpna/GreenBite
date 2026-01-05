from datetime import timedelta
import logging
from django.db import transaction
from meal_plans.models import (
    MealPlan,
    MealPlanDay,
    MealPlanMeal,
)
from food.models import Meal
from .inventory import InventoryService
from .recipeProvider import CompositeRecipeProvider, RecipeProvider
from recipes.models import MealDBRecipe

logger = logging.getLogger(__name__)


@transaction.atomic
def generate_meal_plan(user, start_date, num_days, meals_per_day, use_ai_fallback=True):
    # Initialize inventory service
    inventory = InventoryService(user)
    
    if not inventory.get_available_logs().exists():
        raise ValueError("No available food logs to base the meal plan on.")
    
    # Use composite provider (MealDB + AI fallback)
    provider = CompositeRecipeProvider(inventory, use_ai=use_ai_fallback)
    
    total_meals = num_days * meals_per_day
    logger.info(f"Generating plan for {num_days} days × {meals_per_day} meals = {total_meals} total")
    
    # Get recipes from provider
    recipe_candidates = provider.find_recipes(limit=total_meals)
    
    if not recipe_candidates:
        raise ValueError("No suitable recipes found to generate the meal plan.")
    
    logger.info(f"Found {len(recipe_candidates)} recipe candidates")
    
    # Create meal plan
    meal_plan = MealPlan.objects.create(
        user=user,
        start_date=start_date,
        days=num_days
    )
    
    # Define meal times
    MEAL_TIMES = ["lunch", "dinner", "breakfast",  "snack"][:meals_per_day]
    
    recipe_index = 0
    for day_offset in range(num_days):
        plan_day = MealPlanDay.objects.create(
            meal_plan=meal_plan,
            date=start_date + timedelta(days=day_offset)
        )
        
        for meal_time in MEAL_TIMES:
            if recipe_index >= len(recipe_candidates):
                logger.warning(f"Ran out of recipes at day {day_offset+1}, {meal_time}")
                break
            
            recipe = recipe_candidates[recipe_index]
            meta = getattr(recipe, "metadata", {}) or {} 
            logger.info(
                "Generating meal for plan: title=%s, source=%s, meta=%s",
                getattr(recipe, "title", None),
                getattr(recipe, "source", None),
                meta,
            )
            source_recipe = None
            if meta.get("recipe_id"):
                try:
                    source_recipe = MealDBRecipe.objects.get(id=meta["recipe_id"])
                except MealDBRecipe.DoesNotExist:
                    source_recipe = None
                MealPlanMeal.objects.create(
                meal_plan_day=plan_day,
                meal_time=meal_time,
                meal=None, 
                draft_title=recipe.get("title") or recipe.get("recipe") or "",
                draft_ingredients=recipe.get("ingredients") or [],
                draft_steps=recipe.get("steps") or [],
                draft_cuisine=recipe.get("cuisine") or "",
                draft_calories=recipe.get("calories"),
                draft_serving=recipe.get("serving"),
                draft_photo=recipe.get("photo") or recipe.get("thumbnail") or "",
                draft_source_mealdb_id=str(recipe.get("source_mealdb_id") or ""),
            )

            
            # meal = Meal.objects.create(
            #     user=user,
            #     recipe=recipe.title,
            #     ingredients=recipe.ingredients,
            #     mealTime=meal_time,
            #     photo=recipe.thumbnail,
            #     source_mealdb_id=meta.get("mealdb_id"),

            # )
            # logger.info(
            #     "CREATED MEAL: id=%s, recipe=%s, source_mealdb_id=%s",
            #     meal.id,
            #     meal.recipe,
            #     meal.source_mealdb_id,
            # )
            
            # MealPlanMeal.objects.create(
            #     meal_plan_day=plan_day,
            #     meal_time=meal_time,
            #     meal=meal
            # )
            
            recipe_index += 1
    
    logger.info(f"Successfully created meal plan {meal_plan.id} with {recipe_index} meals")
    return meal_plan

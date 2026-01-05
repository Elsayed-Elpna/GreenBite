"""
MealPlanBuilder - Constructs MealPlan, MealPlanDay, and MealPlanMeal objects.
"""
from datetime import timedelta
import logging
from django.db import transaction
from meal_plans.models import MealPlan, MealPlanDay, MealPlanMeal
from food.models import Meal

logger = logging.getLogger(__name__)
def _val(obj, key, default=None):
    """
    Safe getter that supports:
    - dict-like candidates: obj.get("title")
    - object candidates: obj.title
    """
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)
def _s(x):
    # ✅ string-safe
    return "" if x is None else str(x)

def _list(x):
    if x is None:
        return []
    return x if isinstance(x, list) else [x]

class MealPlanBuilder:
    """
    Builds MealPlan database objects from a list of recipe candidates.
    """
    
    def __init__(self, user, start_date, days, meals_per_day):
        """
        Initialize the builder.
        
        Args:
            user: User instance
            start_date: datetime.date for plan start
            days: Number of days in plan
            meals_per_day: Number of meals per day
        """
        self.user = user
        self.start_date = start_date
        self.days = days
        self.meals_per_day = meals_per_day
        self.meal_times = ["breakfast", "lunch", "dinner", "snack"][:meals_per_day]
    
    @transaction.atomic
    def build(self, recipes):
        """
        Build complete meal plan from recipe candidates.
        
        Args:
            recipes: List of RecipeCandidate objects
        
        Returns:
            MealPlan instance
        
        Raises:
            ValueError: If not enough recipes provided
        """
        total_meals_needed = self.days * self.meals_per_day
        
        if len(recipes) < total_meals_needed:
            logger.warning(
                f"Not enough recipes: got {len(recipes)}, need {total_meals_needed}. "
                f"Will create partial plan."
            )
        
        # Create the meal plan
        meal_plan = MealPlan.objects.create(
            user=self.user,
            start_date=self.start_date,
            days=self.days,
            is_confirmed=False
        )
        
        logger.info(f"Created MealPlan {meal_plan.id} for user {self.user.id}")
        
        recipe_index = 0
        meals_created = 0
        
        # Build each day
        for day_offset in range(self.days):
            current_date = self.start_date + timedelta(days=day_offset)
            
            # Create day
            plan_day = MealPlanDay.objects.create(
                meal_plan=meal_plan,
                date=current_date,
                is_confirmed=False
            )
            
            logger.debug(f"Created MealPlanDay for {current_date}")
            
            # Add meals for this day
            for meal_time in self.meal_times:
                # Check if we have more recipes
                if recipe_index >= len(recipes):
                    logger.warning(
                        f"Ran out of recipes at day {day_offset + 1}, {meal_time}. "
                        f"Created {meals_created} meals total."
                    )
                    break
                
                recipe = recipes[recipe_index]
                
                # Create Meal object
                MealPlanMeal.objects.create(
                meal_plan_day=plan_day,
                meal_time=meal_time,
                meal=None,  # ✅ no saving Meals yet
                draft_title=_s(_val(recipe, "title") or _val(recipe, "recipe") or ""),
                draft_ingredients=_list(_val(recipe, "ingredients")),
                draft_steps=_list(_val(recipe, "steps")),
                draft_cuisine=_s(_val(recipe, "cuisine")),
                draft_calories=_s(_val(recipe, "calories")),
                draft_serving=_s(_val(recipe, "serving")),
                draft_photo=_s(_val(recipe, "photo") or _val(recipe, "thumbnail")),
                draft_source_mealdb_id=_s(_val(recipe, "source_mealdb_id")),
                is_skipped=False
            )
                
                # Link meal to plan day
                # MealPlanMeal.objects.create(
                #     meal_plan_day=plan_day,
                #     meal_time=meal_time,
                #     meal=meal,
                   
                # )
                
                meals_created += 1
                recipe_index += 1
                
                logger.debug(
                    f"Added {meal_time} meal: {recipe.title} (source: {recipe.source})"
                )
        
        logger.info(
            f"Successfully built meal plan {meal_plan.id} with {meals_created} meals "
            f"across {self.days} days"
        )
        
        return meal_plan
    
    def build_partial(self, recipes, skip_incomplete_days=False):
        """
        Build a partial meal plan (useful when not enough recipes available).
        
        Args:
            recipes: List of available recipe candidates
            skip_incomplete_days: If True, skip days that can't be fully filled
        
        Returns:
            MealPlan instance
        """
        if skip_incomplete_days:
            # Calculate how many complete days we can make
            complete_days = len(recipes) // self.meals_per_day
            if complete_days == 0:
                raise ValueError("Not enough recipes to create even one complete day")
            
            logger.info(
                f"Building partial plan: {complete_days} complete days from "
                f"{len(recipes)} recipes"
            )
            
            # Temporarily adjust days
            original_days = self.days
            self.days = complete_days
            
            meal_plan = self.build(recipes)
            
            # Restore original
            self.days = original_days
            
            return meal_plan
        else:
            # Just build with what we have
            return self.build(recipes)
"""
Service for confirming meal plan days and logging food consumption.
"""
import logging
import re
from django.db import transaction
from django.utils import timezone
from meal_plans.models import MealPlanDay, MealPlanMeal, MealPlanFoodUsage
from food.models import FoodLogSys,Meal
from decimal import Decimal
from food.utils.caching import bump_list_version, invalidate_cache


logger = logging.getLogger(__name__)

_UNIT_WORDS = {
    "g", "kg", "mg", "lb", "lbs", "oz", "ml", "l",
    "tsp", "tbsp", "cup", "cups", "teaspoon", "tablespoon",
    "pinch", "clove", "cloves", "slice", "slices"
}


def _core_ingredient_name(text: str) -> str:
    """
    Best-effort normalization for matching inventory items.
    Example: "2 tbsp Olive Oil" -> "olive oil"
    """
    s = (text or "").strip().lower()
    s = re.sub(r"[\d/]+", " ", s)          # remove qty like 2, 1/2
    s = re.sub(r"[^a-z\s-]", " ", s)       # remove punctuation
    tokens = [t for t in s.split() if t and t not in _UNIT_WORDS]
    return " ".join(tokens).strip()


@transaction.atomic
def confirm_meal_plan_day(meal_plan_day, user):
    """
    Confirm a meal plan day and update food log consumption.

    Args:
        meal_plan_day: MealPlanDay instance or ID
        user: User instance

    Raises:
        ValueError: If day already confirmed or invalid
    """
    # Handle if passed as ID
    if isinstance(meal_plan_day, int):
        try:
            meal_plan_day = MealPlanDay.objects.select_related('meal_plan').get(
                id=meal_plan_day,
                meal_plan__user=user
            )
        except MealPlanDay.DoesNotExist:
            raise ValueError("Meal plan day not found or you don't have permission")

    # Verify ownership
    if meal_plan_day.meal_plan.user != user:
        raise ValueError("You don't have permission to confirm this day")

    # Check if already confirmed
    if meal_plan_day.is_confirmed:
        logger.warning(f"Day {meal_plan_day.id} already confirmed at {meal_plan_day.confirmed_at}")
        raise ValueError("This day is already confirmed")
    bump_list_version("meals", user.id)

    # Optional: if you create/update FoodLogSys during confirmation
    bump_list_version("foodlog", user.id)

    # Get all meals for this day (QuerySet, not list)
    meals = MealPlanMeal.objects.filter(
        meal_plan_day=meal_plan_day
    ).select_related('meal').prefetch_related('planned_usages__food_log')

    if not meals.exists():
        raise ValueError("No meals found for this day")

    logger.info(f"Confirming day {meal_plan_day.date} with {meals.count()} meals")

    # Track consumption per food log
    consumption_tracker = {}

    for meal in meals:
        # Skip skipped meals
        if meal.is_skipped:
            logger.debug(f"Skipping meal {meal.id} ({meal.meal_time}) - skipped")
            continue
        if meal.meal_id:
            logger.debug(f"Skipping meal {meal.id} ({meal.meal_time}) - already confirmed")
            continue

        # ✅ Create Meal only on confirmation
        if meal.meal is None:
            meal.meal = Meal.objects.create(
                user=user,
                recipe=meal.draft_title or "",
                ingredients=meal.draft_ingredients or [],
                steps=meal.draft_steps or [],
                cuisine=meal.draft_cuisine or None,
                calories=meal.draft_calories,
                serving=meal.draft_serving,
                photo=meal.draft_photo or "",
                mealTime=meal.meal_time,
                source_mealdb_id=(meal.draft_source_mealdb_id or None),
            )
            meal.save(update_fields=["meal"])


        planned_usages_qs = meal.planned_usages.select_related("food_log")

        if planned_usages_qs.exists():  # ✅ FIX: correct check
            for usage in planned_usages_qs:
                food_log = usage.food_log
                quantity = usage.planned_quantity

                if food_log.id not in consumption_tracker:
                    consumption_tracker[food_log.id] = {"food_log": food_log, "total_quantity": Decimal("0")}

                consumption_tracker[food_log.id]["total_quantity"] += quantity

                logger.debug(
                    f"Meal {meal.meal_time}: {food_log.name} - {quantity}g (from planned usage)"
                )
        else:
            logger.debug(f"No planned usages for meal {meal.id}, using ingredient estimation")

            ingredients = getattr(meal.meal, "ingredients", []) or []
            if not ingredients:
                logger.warning(f"Meal {meal.meal.id} has no ingredients; cannot estimate consumption")
                continue

            for ingredient in ingredients:
                if isinstance(ingredient, dict):
                    ingredient_text = ingredient.get("name") or ingredient.get("ingredient") or ""
                else:
                    ingredient_text = str(ingredient or "")

                core = _core_ingredient_name(ingredient_text)
                if not core:
                    continue

                # Try matching using core tokens
                matching_logs = FoodLogSys.objects.filter(
                    user=user,
                    is_consumed=False,
                    name__icontains=core
                )

                if not matching_logs.exists():
                    logger.debug(f"No inventory match for ingredient='{ingredient_text}' core='{core}'")
                    continue

                # Estimate quantity (default 100g per ingredient)
                estimated_quantity = Decimal('100.00')

                if matching_logs.first().id not in consumption_tracker:
                    consumption_tracker[matching_logs.first().id] = {
                        'food_log': matching_logs.first(),
                        'total_quantity': Decimal('0')
                    }

                consumption_tracker[matching_logs.first().id]['total_quantity'] += estimated_quantity

                logger.debug(
                    f"Meal {meal.meal_time}: {ingredient} → {matching_logs.first().name} - "
                    f"{estimated_quantity}g (estimated)"
                )

    # Apply consumption to food logs
    for food_log_id, data in consumption_tracker.items():
        food_log = data['food_log']
        consume_quantity = data['total_quantity']

        # Check if enough quantity available
        if food_log.quantity < consume_quantity:
            logger.warning(
                f"Not enough {food_log.name}: have {food_log.quantity}g, "
                f"need {consume_quantity}g. Using available quantity."
            )
            consume_quantity = food_log.quantity

        # Deduct quantity
        food_log.quantity -= consume_quantity

        # Mark as consumed if quantity reaches zero
        if food_log.quantity <= 0:
            food_log.is_consumed = True
            food_log.quantity = Decimal('0')
            logger.info(f"✅ {food_log.name} fully consumed")

        food_log.save(update_fields=['quantity', 'is_consumed'])

        logger.info(
            f"📉 Consumed {consume_quantity}g of {food_log.name} "
            f"(remaining: {food_log.quantity}g)"
        )

    # Mark day as confirmed
    meal_plan_day.is_confirmed = True
    meal_plan_day.confirmed_at = timezone.now()
    meal_plan_day.save(update_fields=['is_confirmed', 'confirmed_at'])

    logger.info(
        f"✅ Confirmed day {meal_plan_day.date} - "
        f"consumed from {len(consumption_tracker)} food logs"
    )

    return meal_plan_day


def get_day_consumption_preview(meal_plan_day):
    """
    Get a preview of what will be consumed without actually confirming.

    Args:
        meal_plan_day: MealPlanDay instance

    Returns:
        dict: {food_log_id: {'name': str, 'quantity': Decimal}}
    """
    meals = MealPlanMeal.objects.filter(
        meal_plan_day=meal_plan_day,
        is_skipped=False
    ).select_related('meal').prefetch_related('planned_usages__food_log')

    consumption = {}

    for meal in meals:
        if not meal.meal:
            continue

        planned_usages = meal.planned_usages.all()

        for usage in planned_usages:
            food_log = usage.food_log

            if food_log.id not in consumption:
                consumption[food_log.id] = {
                    'name': food_log.name,
                    'quantity': Decimal('0'),
                    'available': food_log.quantity
                }

            consumption[food_log.id]['quantity'] += usage.planned_quantity

    return consumption
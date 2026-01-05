from celery import shared_task
import logging
from datetime import datetime

logger = logging.getLogger(__name__)
from django.contrib.auth import get_user_model

from meal_plans.models import MealPlanDay
from food.serializers import WasteLogSerializer
from food.utils.recipes_ai import generate_waste_profile_with_cache
from food.utils.caching import invalidate_cache

logger = logging.getLogger(__name__)
User = get_user_model()




@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def generate_and_store_waste_logs_for_day(self, day_id: int, user_id: int):
    user = User.objects.get(id=user_id)

    day = (
        MealPlanDay.objects
        .select_related("meal_plan")
        .prefetch_related("meals__meal")
        .get(id=day_id, meal_plan__user=user)
    )

    fake_request = type("Req", (), {"user": user})

    results = []
    created = 0

    for pm in day.meals.select_related("meal").all():
        if pm.is_skipped or not pm.meal:
            continue

        meal_obj = pm.meal
        meal_name = str(getattr(meal_obj, "recipe", None) or getattr(meal_obj, "title", None) or "").strip()
        if not meal_name:
            continue

        try:
            waste_profile = generate_waste_profile_with_cache(meal_name)
            waste_items = (waste_profile or {}).get("waste_items") or []
            if not isinstance(waste_items, list):
                waste_items = []

            meal_item_results = []

            for wi in waste_items:
                if not isinstance(wi, dict):
                    continue

                payload = {
                    "name": wi.get("name", ""),
                    "why": wi.get("why", ""),
                    "estimated_amount": wi.get("estimated_amount", None),
                    "unit": wi.get("unit", ""),
                    "disposal": wi.get("disposal", ""),
                    "reuse_ideas": wi.get("reuse_ideas", []),
                }

                payload["meal"] = meal_obj.id

                serializer = WasteLogSerializer(data=payload, context={"request": fake_request})
                if serializer.is_valid():
                    wl = serializer.save(user=user)
                    created += 1

                    invalidate_cache("wastelog", user.id, detail_id=wl.id)
                    invalidate_cache("meals", user.id, detail_id=meal_obj.id)

                    meal_item_results.append({"waste_log_id": wl.id, "status": "created"})
                else:
                    meal_item_results.append({"status": "invalid", "errors": serializer.errors, "payload": payload})

            results.append({
                "meal_plan_meal_id": pm.id,
                "meal_id": meal_obj.id,
                "meal_name": meal_name,
                "created_items": len([x for x in meal_item_results if x.get("status") == "created"]),
                "items": meal_item_results,
                "general_tips": (waste_profile or {}).get("general_tips", []),
            })

        except Exception as e:
            logger.exception(f"[waste-task] failed meal_plan_meal={pm.id}: {e}")
            results.append({
                "meal_plan_meal_id": pm.id,
                "meal_id": meal_obj.id,
                "meal_name": meal_name,
                "status": "error",
                "error": str(e),
            })

    return {"day_id": day_id, "user_id": user_id, "created_count": created,"results": results}


@shared_task(bind=True, max_retries=3)
def async_generate_meal_plan(
    self,
    user_id,
    start_date_str,
    days,
    meals_per_day,
    use_ai_fallback=True
):
    from django.contrib.auth import get_user_model
    from datetime import datetime
    from .services.meal_planning_service import MealPlanningService
    from .services.inventory import InventoryService
    from .services.recipeProvider import MealDBRecipeProvider, AIRecipeProvider
    
    try:
        User = get_user_model()
        user = User.objects.get(pk=user_id)
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        
        # Initialize providers
        inventory = InventoryService(user)
        providers = [MealDBRecipeProvider(inventory)]
        
        if use_ai_fallback:
            providers.append(AIRecipeProvider(inventory))
        
        # Create service and generate
        service = MealPlanningService(
            user=user,
            start_date=start_date,
            days=days,
            meals_per_day=meals_per_day,
            providers=providers,
            use_diversity=True
        )
        
        meal_plan = service.generate()
        
        logger.info(f"✅ Task completed: Generated meal plan {meal_plan.id}")
        
        return {
            'status': 'success',
            'meal_plan_id': meal_plan.id,
            'message': f'Successfully generated {days}-day meal plan'
        }
        
    except Exception as exc:
        logger.exception(f"Task failed for user {user_id}: {exc}")
        
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
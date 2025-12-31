"""
Celery tasks for asynchronous meal plan generation.
"""
from celery import shared_task
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def async_generate_meal_plan(
    self,
    user_id,
    start_date_str,
    days,
    meals_per_day,
    use_ai_fallback=True
):
    """
    Asynchronously generate a meal plan.
    
    Args:
        user_id: User primary key
        start_date_str: Start date as string (YYYY-MM-DD)
        days: Number of days
        meals_per_day: Meals per day
        use_ai_fallback: Whether to use AI if MealDB insufficient
    
    Returns:
        dict with meal_plan_id and status
    """
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
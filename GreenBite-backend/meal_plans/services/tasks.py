from celery import shared_task
from .services.mealplan import MealPlanningService

@shared_task
def async_generate_meal_plan(user_id, start_date, days, meals_per_day):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    user = User.objects.get(pk=user_id)
    service = MealPlanningService(user, start_date, days, meals_per_day, providers=[MealDBProvider(), AIRecipeProvider()])
    meal_plan = service.generate()
    return meal_plan.id

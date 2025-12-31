from multiprocessing import context
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from meal_plans.services.meal_plan_generator import generate_meal_plan
from meal_plans.services.confirmeal import confirm_meal_plan_day
from .models import  MealPlanMeal, MealPlanDay
from .services.meal_planning_service import MealPlanningService
from .services.inventory import InventoryService
from .services.recipeProvider import MealDBRecipeProvider, AIRecipeProvider
from .tasks import async_generate_meal_plan
import logging

logger = logging.getLogger(__name__)

class MealPlanGeneratorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        days = int(request.data.get("days", 3))
        meals_per_day = int(request.data.get("meals_per_day", 3))
        use_ai = request.data.get("use_ai_fallback", True)
        async_mode = request.data.get("async", False)  # Optional async generation

        start_date_raw = request.data.get("start_date")
        if start_date_raw:
            start_date = parse_date(str(start_date_raw))
            if not start_date:
                return Response({"error": "Invalid start_date. Use YYYY-MM-DD."}, status=400)
        else:
            start_date = timezone.now().date()

        try:
            if async_mode:
                # Queue task for background processing
                task = async_generate_meal_plan.delay(
                    request.user.id,
                    start_date.strftime("%Y-%m-%d"),
                    days,
                    meals_per_day,
                    use_ai
                )
                return Response({
                    "status": "queued",
                    "task_id": task.id,
                    "message": "Meal plan generation started in background"
                }, status=202)
            
            # Synchronous generation
            inventory = InventoryService(request.user)
            providers = [MealDBRecipeProvider(inventory)]

            if use_ai:
                providers.append(AIRecipeProvider(inventory))
            
            service = MealPlanningService(
                user=request.user,
                start_date=start_date,
                days=days,
                meals_per_day=meals_per_day,
                providers=providers
            )
            
            meal_plan = service.generate()
            
            # Serialize response (use your existing serializers)
            # ... return meal plan data ...
            
            return Response({
                "meal_plan_id": meal_plan.id,
                "days": days,
                "start_date": start_date,
                "message": "Meal plan generated successfully"
            }, status=201)
            
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.exception(f"Meal plan generation failed: {e}")
            return Response({"error": "Internal server error"}, status=500)
from meal_plans.models import MealPlan
from .serializers import MealPlanDetailSerializer

class MealPlanDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            plan = MealPlan.objects.prefetch_related(
                "days_plan__meals__meal",
                "days_plan__meals__planned_usages__food_log",
            ).get(id=pk, user=request.user)
        except MealPlan.DoesNotExist:
            return Response({"error": "Meal plan not found"}, status=404)

        serializer = MealPlanDetailSerializer(plan, context={"request": request})
        return Response(serializer.data)


class MealPlanDayConfirmAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            day = MealPlanDay.objects.select_related(
                "meal_plan"
            ).get(
                id=pk,
                meal_plan__user=request.user
            )
        except MealPlanDay.DoesNotExist:
            return Response({"error": "Day not found"}, status=404)

        try:
            confirm_meal_plan_day(day, request.user)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        return Response({"status": "Day confirmed"})
class MealPlanMealSkipAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            meal = MealPlanMeal.objects.get(
                id=pk,
                meal_plan_day__meal_plan__user=request.user
            )
        except MealPlanMeal.DoesNotExist:
            return Response({"error": "Meal not found"}, status=404)

        meal.is_skipped = True
        meal.save(update_fields=["is_skipped"])

        return Response({"status": "Meal skipped"})
class MealPlanDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            plan = MealPlan.objects.get(id=pk, user=request.user)
        except MealPlan.DoesNotExist:
            return Response({"error": "Meal plan not found"}, status=404)

        if plan.is_confirmed:
            return Response(
                {"error": "Cannot delete confirmed plan"},
                status=400
            )

        plan.delete()
        return Response(status=204)

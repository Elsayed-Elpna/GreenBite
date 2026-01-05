from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response 
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory
from rest_framework import status
from meal_plans.services.meal_plan_generator import generate_meal_plan
from meal_plans.services.confirmeal import confirm_meal_plan_day
from meal_plans.services.meal_replacement import replace_meal
from .models import MealPlanMeal, MealPlanDay, MealPlan
from .services.meal_planning_service import MealPlanningService
from .services.inventory import InventoryService
from .services.recipeProvider import MealDBRecipeProvider, AIRecipeProvider
from .tasks import async_generate_meal_plan, generate_and_store_waste_logs_for_day
from .serializers import MealPlanDetailSerializer
import logging
from celery.result import AsyncResult
from food.serializers import WasteLogSerializer
from food.utils.recipes_ai import generate_waste_profile_with_cache

from django.core.cache import cache
from food.utils.caching import invalidate_cache

logger = logging.getLogger(__name__)


class MealPlanGeneratorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        days = int(request.data.get("days", 3))
        meals_per_day = int(request.data.get("meals_per_day", 3))
        
        if days < 1 or days > 30:
            return Response({"error": "Days must be between 1 and 30"}, status=400)
        
        if meals_per_day < 1 or meals_per_day > 4:
            return Response({"error": "Meals per day must be between 1 and 4"}, status=400)
        
        use_ai = request.data.get("use_ai_fallback", True)
        async_mode = request.data.get("async", False)

        start_date_raw = request.data.get("start_date")
        if start_date_raw:
            start_date = parse_date(str(start_date_raw))
            if not start_date:
                return Response({"error": "Invalid start_date. Use YYYY-MM-DD."}, status=400)
        else:
            start_date = timezone.now().date()

        try:
            if async_mode:
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


class MealPlanDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            plan = MealPlan.objects.prefetch_related(
                "days_plan__meals__meal",
                "days_plan__meals__planned_usages__food_log",
                "days_plan__meals__original_meal",  # ✅ Include original meal
            ).get(id=pk, user=request.user)
        except MealPlan.DoesNotExist:
            return Response({"error": "Meal plan not found"}, status=404)

        serializer = MealPlanDetailSerializer(plan, context={"request": request})
        return Response(serializer.data)


class MealPlanConfirmAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            plan = MealPlan.objects.prefetch_related("days_plan").get(
                id=pk, 
                user=request.user
            )
        except MealPlan.DoesNotExist:
            return Response({"error": "Meal plan not found"}, status=404)

        if plan.is_confirmed:
            return Response({"error": "Meal plan already confirmed"}, status=400)

        # Confirm all unconfirmed days
        unconfirmed_days = plan.days_plan.filter(is_confirmed=False)
        
        confirmed_count = 0
        errors = []
        
        for day in unconfirmed_days:
            try:
                confirm_meal_plan_day(day, request.user)

                confirmed_count += 1
            except ValueError as e:
                errors.append(f"Day {day.date}: {str(e)}")
                logger.warning(f"Failed to confirm day {day.date}: {e}")
            
            except Exception as e:
                errors.append(f"Day {day.date}: {str(e)}")
                logger.exception(f"Failed to confirm day {day.date}: {e}")

        remaining_unconfirmed = plan.days_plan.filter(is_confirmed=False).count()
        
        if remaining_unconfirmed == 0:
            plan.is_confirmed = True
            plan.save(update_fields=["is_confirmed"])
            logger.info(f" Meal plan {plan.id} fully confirmed")

        return Response({
            "status": "completed",
            "message": f"Confirmed {confirmed_count} day(s)",
            "errors": errors if errors else None,
            "plan_fully_confirmed": plan.is_confirmed,
            "remaining_days": remaining_unconfirmed
        }, status=status.HTTP_200_OK)

class MealPlanDayConfirmAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            day = MealPlanDay.objects.select_related("meal_plan").get(
                id=pk,
                meal_plan__user=request.user
            )
        except MealPlanDay.DoesNotExist:
            return Response(
                {"error": "Day not found or you don't have permission"},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            confirmed_day = confirm_meal_plan_day(day, request.user)

            # ✅ enqueue slow work
            task = generate_and_store_waste_logs_for_day.delay(confirmed_day.id, request.user.id)

            return Response({
                "status": "confirmed",
                "day_id": confirmed_day.id,
                "date": confirmed_day.date,
                "confirmed_at": confirmed_day.confirmed_at,
                "message": "Day confirmed. Waste logs generation started in background.",
                "waste_task_id": task.id,
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception(f"Day confirmation failed: {e}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# class MealPlanDayConfirmAPIView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, pk):
#         try:
#             # ✅ Fetch the day with proper error handling
#             day = MealPlanDay.objects.select_related("meal_plan").get(
#                 id=pk,
#                 meal_plan__user=request.user
#             )
#         except MealPlanDay.DoesNotExist:
#             return Response(
#                 {"error": "Day not found or you don't have permission"}, 
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         try:
#             # Pass the day object (not ID) to the service
#             confirmed_day = confirm_meal_plan_day(day, request.user)
#             meals = confirmed_day.meals.select_related("meal").all()

#             waste_results = []
#             for m in meals:
#                 if m.is_skipped:
#                     continue
#                 if not m.meal:
#                     continue

#                 meal_name = getattr(m.meal, "recipe", None) or getattr(m.meal, "title", None) or ""
#                 meal_name = str(meal_name).strip()
#                 if not meal_name:
#                     continue

#                 try:
#                     # 1) generate waste profile from AI helper
                    
#                     waste_profile = generate_waste_profile_with_cache(meal_name)
#                     serializer = WasteLogSerializer(data=waste_profile, context={"request": request})
#                     if serializer.is_valid():
#                         waste_log = serializer.save(user=request.user)
#                         invalidate_cache("wastelog", request.user.id, detail_id=waste_log.id)
#                         if getattr(waste_log, "meal", None):
#                             invalidate_cache("meals", request.user.id, detail_id=waste_log.meal.id)
#                         waste_results.append({
#                             "meal_plan_meal_id": m.id,
#                             "meal_id": m.meal.id,
#                             "meal_name": meal_name,
#                             "waste_log_id": waste_log.id,
#                             "status": "created",
#                             })
#                     else:
#                         waste_results.append({
#                             "meal_plan_meal_id": m.id,
#                             "meal_id": m.meal.id,
#                             "meal_name": meal_name,
#                             "status": "invalid",
#                             "errors": serializer.errors,
#                         })

#                 except Exception as e:
#                     logger.exception(f"Failed waste profile/log for meal_plan_meal={m.id}: {e}")
#                     waste_results.append({
#                         "meal_plan_meal_id": m.id,
#                         "meal_id": m.meal.id if m.meal else None,
#                         "meal_name": meal_name,
#                         "error": str(e),
#                     })

            
#             return Response({
#                 "status": "confirmed",
#                 "day_id": confirmed_day.id,
#                 "date": confirmed_day.date,
#                 "confirmed_at": confirmed_day.confirmed_at,
#                 "message": "Day confirmed successfully",
#                 "waste_logs": waste_results,
#             }, status=status.HTTP_200_OK)
            
#         except ValueError as e:
#             return Response(
#                 {"error": str(e)}, 
#                 status=status.HTTP_400_BAD_REQUEST
#             )
#         except Exception as e:
#             logger.exception(f"Day confirmation failed: {e}")
#             return Response(
#                 {"error": "Internal server error"}, 
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


class MealPlanMealReplaceAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        use_ai = request.data.get("use_ai_fallback", True)
        
        try:
            updated_meal = replace_meal(pk, request.user, use_ai=use_ai)
            
            return Response({
                "status": "replaced",
                "meal_id": updated_meal.id,
                "new_recipe": updated_meal.meal.recipe if updated_meal.meal else None,
                "original_recipe": updated_meal.original_meal.recipe if updated_meal.original_meal else None,
                "message": "Meal replaced successfully"
            })
            
        except ValueError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            logger.exception(f"Meal replacement failed: {e}")
            return Response({"error": "Internal server error"}, status=500)


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
            return Response({"error": "Cannot delete confirmed plan"}, status=400)

        plan.delete()
        return Response(status=204)
class MealPlanListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plans = MealPlan.objects.filter(user=request.user).order_by('-created_at')
        
        # Simple serialization (without nested data for list view)
        data = [
            {
                "id": plan.id,
                "start_date": plan.start_date,
                "days": plan.days,
                "is_confirmed": plan.is_confirmed,
                "created_at": plan.created_at,
                "days_plan": [
                    {
                        "id": day.id,
                        "date": day.date,
                        "is_confirmed": day.is_confirmed,
                        "meals": [
                            {"id": meal.id, "meal_time": meal.meal_time}
                            for meal in day.meals.all()
                        ]
                    }
                    for day in plan.days_plan.all()
                ]
            }
            for plan in plans
        ]
        
        return Response(data)

class MealPlanTaskStatusAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        res = AsyncResult(task_id)

        payload = {
            "task_id": task_id,
            "state": res.state,
        }

        if res.state == "SUCCESS":
            # task returns plan id (per your task code)
            result = res.result
            if isinstance(result, dict):
                payload["meal_plan_id"] = result.get("meal_plan_id")
                payload["result"] = result
            else:
                payload["meal_plan_id"] = res.result
                payload["result"] = res.result
            return Response(payload, status=status.HTTP_200_OK)

        if res.state in ("FAILURE", "REVOKED"):
            payload["error"] = str(res.result)
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)

        return Response(payload, status=status.HTTP_202_ACCEPTED)

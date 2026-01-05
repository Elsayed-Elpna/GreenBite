from django.urls import path 
from .views import (
    MealPlanDetailAPIView, 
    MealPlanGeneratorView, 
    MealPlanDeleteAPIView,
    MealPlanConfirmAPIView,  
    MealPlanDayConfirmAPIView, 
    MealPlanMealReplaceAPIView,  
    MealPlanMealSkipAPIView,
    MealPlanListAPIView, 
    MealPlanTaskStatusAPIView,
)

app_name = 'meal_plans'

urlpatterns = [
    path('', MealPlanListAPIView.as_view(), name='meal_plan_list'),

    path('generate/', MealPlanGeneratorView.as_view(), name='meal_plan_generator'),
    path('<int:pk>/', MealPlanDetailAPIView.as_view(), name='meal_plan_detail'),
    
    path('<int:pk>/confirm/', MealPlanConfirmAPIView.as_view(), name='confirm_meal_plan'),
    
    path('days/<int:pk>/confirm/', MealPlanDayConfirmAPIView.as_view(), name='confirm_meal_plan_day'),
    
    path('meals/<int:pk>/replace/', MealPlanMealReplaceAPIView.as_view(), name='replace_meal'),
    
    path('meals/<int:pk>/skip/', MealPlanMealSkipAPIView.as_view(), name='skip_meal'),
    
    path('<int:pk>/delete/', MealPlanDeleteAPIView.as_view(), name='delete_meal_plan'), 
    path("tasks/<str:task_id>/", MealPlanTaskStatusAPIView.as_view(), name="mealplan-task-status"),

]

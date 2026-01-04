from django.urls import path
from food.views import foodlogsysviews, mealsGenViews, wasteLogviews , meals_operation, imageProcessing


app_name = 'food'

urlpatterns = [
    # Combined list and create view
    path('food-logs/', foodlogsysviews.food_log_list_create, name='food-log-list-create'),
    
    # Detailed view with get, update, and delete
    path('food-logs/<int:pk>/', foodlogsysviews.food_log_detail, name='food-log-detail'),

    # Separate endpoints (alternative approach)
    # path('food-logs/create/', foodlogsysviews.food_log_create, name='food-log-create'),
    # path('food-logs/<int:pk>/update/', foodlogsysviews.food_log_update, name='food-log-update'),
    # path('food-logs/<int:pk>/delete/', foodlogsysviews.food_log_delete, name='food-log-delete'),
    path("meals/generate/", mealsGenViews.GenerateMealsAPIView.as_view()),
    path("meals/save-ai/", mealsGenViews.SaveAIMealAPIView.as_view()),
    path("meals/waste/", mealsGenViews.ai_meal_waste_profile),
    path("meals/", meals_operation.UserMealListAPIView.as_view()),
    path("meals/<int:pk>/", meals_operation.MealDetailAPIView.as_view()),
    path("meals/<int:pk>/delete/", meals_operation.DeleteMealAPIView.as_view()),
    path("meals/<int:pk>/save-leftovers/", meals_operation.SaveMealLeftoversAPIView.as_view()),
    # path("foodcomrecipes/", views.foodcom_recipe_list, name='foodcom-recipe-list'),
    # path("foodcomrecipes/<int:pk>/", views.foodcom_recipe_detail),
    path("waste-log/", wasteLogviews.waste_log_list_create, name="waste-log-list-create"),
    path("waste-log/<int:pk>/", wasteLogviews.waste_log_detail, name="waste-log-detail"),
    # path("mealdb/random/", views.mealdb_random),
    # path("mealdb/<str:mealdb_id>/", views.mealdb_detail),
    path("food-safety/scan/", imageProcessing.food_safety_scan, name = "food-safety-scan")
]

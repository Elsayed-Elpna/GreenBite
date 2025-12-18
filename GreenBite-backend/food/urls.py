from django.urls import path
from . import views

app_name = 'food'

urlpatterns = [
    # Combined list and create view
    path('food-logs/', views.food_log_list_create, name='food-log-list-create'),
    
    # Detailed view with get, update, and delete
    path('food-logs/<int:pk>/', views.food_log_detail, name='food-log-detail'),
    
    # Separate endpoints (alternative approach)
    path('food-logs/create/', views.food_log_create, name='food-log-create'),
    path('food-logs/<int:pk>/update/', views.food_log_update, name='food-log-update'),
    path('food-logs/<int:pk>/delete/', views.food_log_delete, name='food-log-delete'),
    path("meals/generate/", views.GenerateMealsAPIView.as_view()),
    path("meals/save-ai/", views.SaveAIMealAPIView.as_view()),
    path("meals/waste/", views.ai_meal_waste_profile),
    path("foodcomrecipes/", views.foodcom_recipe_list),
    path("foodcomrecipes/<int:pk>/", views.foodcom_recipe_detail),
    path("mealdb/random/", views.mealdb_random),
    path("mealdb/<str:mealdb_id>/", views.mealdb_detail)
]

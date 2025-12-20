from django.urls import path
from .views import RecommendRecipesAPIView, ConsumePreviewAPIView, ConsumeConfirmAPIView,mealdb_random, mealdb_detail

urlpatterns = [
    path("recipes/recommend/", RecommendRecipesAPIView.as_view()),
    path("recipes/consume/preview/", ConsumePreviewAPIView.as_view()),
    path("recipes/consume/confirm/", ConsumeConfirmAPIView.as_view()),
    path("mealdb/random/", mealdb_random, name="mealdb-random"),
    path("mealdb/<str:mealdb_id>/", mealdb_detail, name="mealdb-detail"),
]


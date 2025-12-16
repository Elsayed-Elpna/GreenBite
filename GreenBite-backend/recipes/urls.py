from django.urls import path
from .views import RecommendRecipesAPIView, ConsumePreviewAPIView, ConsumeConfirmAPIView

urlpatterns = [
    path("recipes/recommend/", RecommendRecipesAPIView.as_view()),
    path("recipes/consume/preview/", ConsumePreviewAPIView.as_view()),
    path("recipes/consume/confirm/", ConsumeConfirmAPIView.as_view()),
]

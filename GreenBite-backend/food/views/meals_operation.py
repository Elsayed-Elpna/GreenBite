from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from ..models import Meal #, FoodComRecipe
from ..serializers import MealSerializer #, FoodComRecipeSerializer

from rest_framework.views import APIView
from ..serializers import LeftoversSerializer


class MealDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        meal = get_object_or_404(Meal, pk=pk, user=request.user)
        return Response(MealSerializer(meal).data, status=200)
    

class SaveMealLeftoversAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        meal = get_object_or_404(Meal, pk=pk, user=request.user)

        if meal.leftovers_saved:
            return Response(
                {"detail": "Leftovers already saved for this meal"},
                status=400
            )
        serializer = LeftoversSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        meal.leftovers = serializer.validated_data["leftovers"]
        meal.has_leftovers = True
        meal.save(update_fields=["leftovers", "has_leftovers", "updated_at"])
        meal.save_leftovers_to_food_log()

        return Response(
            {"detail": "Leftovers added successfully"},
            status=200
        )


    
class UserMealListAPIView(generics.ListAPIView):
    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Meal.objects.filter(user=self.request.user)
    

    
class DeleteMealAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        meal = get_object_or_404(Meal, pk=pk, user=request.user)
        meal.delete()
        return Response(
            {"detail": "Meal deleted successfully"},
            status=204
        )

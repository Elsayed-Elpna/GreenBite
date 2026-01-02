from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from ..models import Meal, FoodLogSys #, FoodComRecipe
from ..serializers import MealSerializer, LeftoversSerializer #, FoodComRecipeSerializer
from datetime import date, timedelta
from rest_framework.views import APIView


class MealDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        meal = get_object_or_404(Meal, pk=pk, user=request.user)
        return Response(MealSerializer(meal).data, status=200)
    

class SaveMealLeftoversAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        meal = get_object_or_404(Meal, pk=pk, user=request.user)

        serializer = LeftoversSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # assign leftovers
        meal.leftovers = serializer.validated_data["leftovers"]

        # convert any expiry_date that is a Python date to ISO string

        for leftover in meal.leftovers:
            if isinstance(leftover.get("expiry_date"), date):
                leftover["expiry_date"] = leftover["expiry_date"].isoformat()

        meal.leftovers_saved = False
        meal.has_leftovers = True
        meal.save(update_fields=[
            "leftovers",
            "has_leftovers",
            "leftovers_saved",
            "updated_at"
        ])

        meal.save_leftovers_to_food_log()

        response_data = MealSerializer(meal).data
        return Response(response_data, status=200)


 
class UserMealListAPIView(generics.ListAPIView):
    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Meal.objects.filter(user=self.request.user)
    

    
class DeleteMealAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        meal = get_object_or_404(Meal, pk=pk, user=request.user)
        FoodLogSys.objects.filter(meal=meal).delete()
        meal.delete()
        return Response(
            {"detail": "Meal deleted successfully"},
            status=204
        )

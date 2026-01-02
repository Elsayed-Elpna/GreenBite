from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from ..models import Meal #, FoodComRecipe
from ..serializers import MealSerializer #, FoodComRecipeSerializer

from rest_framework.views import APIView
from ..serializers import MealGenerationSerializer, SaveAIMealSerializer
from ..utils.recipes_ai import generate_recipes_with_cache, generate_waste_profile_with_cache, generate_meals_openai, mealdb_recipe_to_ai_shape

import random, logging, base64

class MealDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        meal = get_object_or_404(Meal, pk=pk, user=request.user)
        return Response(MealSerializer(meal).data, status=200)

class GenerateMealsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MealGenerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ingredients = serializer.validated_data["ingredients"]

        ai_recipes = generate_recipes_with_cache(ingredients)

        if not ai_recipes:
            return Response(
                {"detail": "Could not generate meals"},
                status=503,
            )

        return Response(
            {"meals": ai_recipes},
            status=200
        )
    


class SaveAIMealAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SaveAIMealSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        meal = Meal.objects.create(
            user=request.user,
            recipe=serializer.validated_data["recipe"],
            ingredients=serializer.validated_data["ingredients"],
            serving=serializer.validated_data.get("serving"),
            calories=serializer.validated_data.get("calories"),
            cuisine=serializer.validated_data.get("cuisine"),
            mealTime=serializer.validated_data["mealTime"],
            steps=serializer.validated_data["steps"],
            has_leftovers=False,
            leftovers=[],
            leftovers_saved=False,
            waste=serializer.validated_data.get("waste", [])
        )


        return Response(
            MealSerializer(meal).data,
            status=201
        )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_meal_waste_profile(request):
    meal = request.data.get("meal", "")
    ingredients = request.data.get("ingredients", "")

    #normalize the meal
    if meal in (None, ""):
        meal_str = ""

    elif isinstance(meal, str):
        meal_str = meal.strip()
    else:
        return Response({
            "detail":"meal must be a string"
        }, status = status.HTTP_400_BAD_REQUEST)
    
    #normalize ingredients into list[str]
    if ingredients in (None, ""):
        ingredients_list = []
    elif isinstance(ingredients, list):
        ingredients_list = [str(i).strip() for i in ingredients if str(i).strip()]
    elif isinstance(ingredients, str):
        ingredients_list = [s.strip() for s in ingredients.split(",") if s.strip()]
    else:
        return Response({
            "detail":"ingredients must be a list of strings OR a comma seperated string"
        }, status= status.HTTP_400_BAD_REQUEST)

    if not meal_str and not ingredients_list:
        return Response({
            "detail": "provide the meal or ingredients or both!"
        }, status=status.HTTP_400_BAD_REQUEST)

    if not meal_str and ingredients_list:
        meal_str = ", ". join(ingredients_list[:5])
    ingredients_str = ", ".join(ingredients_list)
    try:
        result = generate_waste_profile_with_cache(meal = meal_str, ingredients = ingredients_str)
    except Exception:
        logging.getLogger(__name__).exception("ai_meal_waste_profile failed")
        return Response({
            "detail":"failed to generate waste"
        }, status= status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response(result, status.HTTP_200_OK)

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def foodcom_recipe_list(request):
#     qs = FoodComRecipe.objects.all().order_by("-id")
#     q = request.query_params.get("q") 
#     if q:
#         qs = qs.filter(title__icontains=q)
    
#     ingredient = request.query_params.get("ingredient")
#     if ingredient:
#         qs.filter(ingredients__contains=[ingredient])

#     tag = request.query_params.get("tag")
#     if tag:
#         qs = qs.filter(tags__contains=[tag])  

#     serializer = FoodComRecipeSerializer(qs, many = True)
#     return Response(serializer.data, status=status.HTTP_200_OK)

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def foodcom_recipe_detail(request, pk):
#     recipe = get_object_or_404(FoodComRecipe, pk = pk)
#     serializer = FoodComRecipeSerializer(recipe)
#     return Response(serializer.data, status=status.HTTP_200_OK)



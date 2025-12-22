from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from .models import FoodLogSys, Meal, FoodComRecipe, WasteLog
from .serializers import FoodLogSysSerializer, MealSerializer, FoodComRecipeSerializer

from rest_framework.views import APIView
from .serializers import MealGenerationSerializer, SaveAIMealSerializer, WasteLogSerializer
from .utils.recipes_ai import generate_recipes_with_cache, generate_waste_profile_with_cache
from .filters import FoodLogFilter

import random

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def food_log_list_create(request):
    """
    List all food logs for the authenticated user or create a new food log.
    """
    if request.method == 'GET':
        # Get all food logs for the current user
        food_logs = FoodLogSys.objects.filter(user=request.user)
        food_filter = FoodLogFilter(request.GET, queryset=food_logs)
        if not food_filter.is_valid():
            return Response(
                food_filter.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        serializer = FoodLogSysSerializer(food_filter.qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Create a new food log
        serializer = FoodLogSysSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def food_log_detail(request, pk):
    """
    Retrieve, update or delete a specific food log.
    """
    # Get the food log and ensure it belongs to the current user
    food_log = get_object_or_404(FoodLogSys, pk=pk, user=request.user)
    
    if request.method == 'GET':
        # Retrieve a specific food log
        serializer = FoodLogSysSerializer(food_log)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        # Update a food log (PUT for full update, PATCH for partial update)
        partial = request.method == 'PATCH'
        serializer = FoodLogSysSerializer(food_log, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Delete a food log
        food_log.delete()
        return Response(
            {'message': 'Food log deleted successfully'}, 
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def food_log_create(request):
    """
    Create a new food log entry.
    """
    serializer = FoodLogSysSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def food_log_update(request, pk):
    """
    Update an existing food log entry.
    """
    food_log = get_object_or_404(FoodLogSys, pk=pk, user=request.user)
    partial = request.method == 'PATCH'
    serializer = FoodLogSysSerializer(food_log, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def food_log_delete(request, pk):
    """
    Delete a food log entry.
    """
    food_log = get_object_or_404(FoodLogSys, pk=pk, user=request.user)
    food_log.delete()
    return Response(
        {'message': f'Food log "{food_log.name}" deleted successfully'}, 
        status=status.HTTP_204_NO_CONTENT
    )

class GenerateMealsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        input_serializer = MealGenerationSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)

        ingredients = input_serializer.validated_data["ingredients"]

        ai_recipes = generate_recipes_with_cache(ingredients)

        if not ai_recipes:

            return Response(
                {"detail": "Could not generate meals",
                },
                status=503,  
            )

        meals = []
        for r in (ai_recipes or [])[:5]:
            meals.append({
                "recipe": r["description"] + "\n" + "\n".join(r["steps"]),
                "ingredients": r["ingredients"],
                "serving": r.get("serving", 2),
                "calories": r.get("calories"),
                "cuisine": r.get("cuisine"),
                "mealTime": "lunch"
            })

        return Response(meals, status=200)

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
            has_leftovers=False
        )

        return Response(
            MealSerializer(meal).data,
            status=201
        )

# =======================
# waste views 
# =======================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ai_meal_waste_profile(request):
    meal = request.data.get("meal", "")
    context = request.data.get("context", "")

    if not isinstance(meal, str) or not meal.strip():
        return Response({
            "detail":"meal is required and must be a string"
        }, status = status.HTTP_400_BAD_REQUEST)

    result = generate_waste_profile_with_cache(meal=meal, context=context)

    return Response(result, status.HTTP_200_OK)

# ======================== 
# FoodCom views
# ========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def foodcom_recipe_list(request):
    
    qs = FoodComRecipe.objects.all().order_by("-id")
    q = request.query_params.get("q") 
    if q:
        qs = qs.filter(title__icontains=q)
    
    ingredient = request.query_params.get("ingredient")
    if ingredient:
        qs.filter(ingredients__contains=[ingredient])

    tag = request.query_params.get("tag")
    if tag:
        qs = qs.filter(tags__contains=[tag])  

    serializer = FoodComRecipeSerializer(qs, many = True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def foodcom_recipe_detail(request, pk):
    recipe = get_object_or_404(FoodComRecipe, pk = pk)
    serializer = FoodComRecipeSerializer(recipe)
    return Response(serializer.data, status=status.HTTP_200_OK)





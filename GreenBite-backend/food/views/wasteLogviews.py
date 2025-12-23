from django.shortcuts import render, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from ..models import FoodLogSys, Meal, WasteLog #, FoodComRecipe
from ..serializers import FoodLogSysSerializer, MealSerializer #, FoodComRecipeSerializer

from rest_framework.views import APIView
from ..serializers import MealGenerationSerializer, SaveAIMealSerializer, WasteLogSerializer
from ..utils.recipes_ai import generate_recipes_with_cache, generate_waste_profile_with_cache
from ..filters import FoodLogFilter

import random

@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def waste_log_list_create(request):
    if request.method == "GET":
        qs = WasteLog.objects.filter(user=request.user).select_related("meal").order_by("-created_at")
        meal_id = request.query_params.get("meal")
        if meal_id:
            qs = qs.filter(meal_id = meal_id)

        serializer = WasteLogSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    #post
    serializer = WasteLogSerializer(data = request.data, context ={"request": request})
    if serializer.is_valid():
        serializer.save(user = request.user)
        return Response(serializer.data, status = status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def waste_log_detail(request, pk):
    try:
        waste_log = WasteLog.objects.select_related("meal").get(pk = pk, user = request.user)
    except WasteLog.DoesNotExist:
        return Response({"detail" : "Not found"}, status =status.HTTP_404_NOT_FOUND)
    
    if request.method == "GET":
        serializer = WasteLogSerializer(waste_log)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    if request.method in ["PUT", "PATCH"]:
        partial = request.method == "GET"
        serializer = WasteLogSerializer(
            waste_log,
            data=request.data,
            partial = partial,
            context = {"request": request},
        )
        if serializer.is_valid():
            serializer.save(user = request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    waste_log.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

from django.shortcuts import render, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics, permissions, filters as drf_filters
from ..models import Meal, FoodLogSys, WasteLog #, FoodComRecipe
from ..serializers import MealSerializer, LeftoversSerializer #, FoodComRecipeSerializer
from datetime import date, timedelta
from rest_framework.views import APIView
from ..pagination import MealPagination
from ..filters import MealFilter
from django_filters.rest_framework import DjangoFilterBackend

from ..utils.caching import detail_key,list_key, invalidate_cache, bump_list_version
from django.core.cache import cache

CACHE_TTL_SECONDS = 60 * 5
NAMESPACE = "meals"
class MealDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user_id = request.user.id
        key = detail_key(NAMESPACE, user_id, pk)
        cached = cache.get(key)
        if cached is not None:
            return Response(cached, status=status.HTTP_200_OK)
        
        meal = get_object_or_404(Meal, pk=pk, user=request.user)
        data = MealSerializer(meal).data
        cache.set(key, data, timeout = CACHE_TTL_SECONDS)
        return Response(data, status=200)
    

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
        #invalidating cache
        invalidate_cache(NAMESPACE,request.user.id, detail_id=meal.id)
        return Response(response_data, status=200)


 
class UserMealListAPIView(generics.ListAPIView):
    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = MealPagination
    filter_backends = [DjangoFilterBackend, drf_filters.OrderingFilter]
    filterset_class = MealFilter
    ordering_fields = ['created_at', 'calories']

    def get_queryset(self):
        return Meal.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        user_id = request.user.id
        full_path = request.get_full_path()

        key = list_key(NAMESPACE,user_id, full_path)
        cached = cache.get(key) 
        if cached is not None:
            return Response(cached, status=200)
        
        response = super().list(request, *args, **kwargs)
        cache.set(key, response.data, timeout=CACHE_TTL_SECONDS)
        return response

    
class DeleteMealAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        meal = get_object_or_404(Meal, pk=pk, user=request.user)

        # Delete related data
        FoodLogSys.objects.filter(meal=meal).delete()
        WasteLog.objects.filter(meal=meal).delete()

        meal_id = meal.id
        meal.delete()


        invalidate_cache("meals", request.user.id, detail_id=meal_id)

        bump_list_version("foodlog", request.user.id)

        bump_list_version("wastelog", request.user.id)

        return Response(
            {"detail": "Meal deleted successfully"},
            status=204
        )


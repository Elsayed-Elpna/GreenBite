from django.shortcuts import render, get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from ..models import Meal
from ..serializers import MealSerializer, LeftoversSerializer
from rest_framework.views import APIView

from ..utils.caching import detail_key,list_key, invalidate_cache
from django.core.cache import cache

CACHE_TTL_SECONDS = 60 * 60 * 24
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
        #invalidating cache
        invalidate_cache(NAMESPACE,request.user.id, detail_id=meal.id)

        return Response(
            {"detail": "Leftovers added successfully"},
            status=200
        )


    
class UserMealListAPIView(generics.ListAPIView):
    serializer_class = MealSerializer
    permission_classes = [IsAuthenticated]

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
        meal_id = meal.id
        meal.delete()
        invalidate_cache(NAMESPACE, request.user.id, detail_id=meal_id)
        return Response(
            {"detail": "Meal deleted successfully"},
            status=204
        )

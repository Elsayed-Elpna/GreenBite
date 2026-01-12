from django.shortcuts import get_object_or_404
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import FoodLogSys
from ..serializers import FoodLogSysSerializer
from ..filters import FoodLogFilter 
from ..utils.caching import bump_list_version, detail_key, list_key, invalidate_cache
from ..pagination import FoodLogPagination
from meal_plans.services.inventory import InventoryService
from datetime import date, timedelta
import logging
logger = logging.getLogger(__name__)


NAMESPACE = "foodlog"
SORTABLE_FIELDS = {"name", "category", "storage_type", "quantity", "expiry_date"}
DUAL_SORT_FIELDS = {"quantity", "expiry_date"}

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def food_log_list_create(request):
    """
    List all food logs for the authenticated user or create a new food log.
    """
    if request.method == 'GET':
        cache_key = list_key(NAMESPACE, request.user.id, request.get_full_path())
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached, status=status.HTTP_200_OK)
        
        queryset = FoodLogSys.objects.filter(user=request.user)
        #FoodLogFilter
        food_filter = FoodLogFilter(request.GET,queryset=queryset)
        if not food_filter.is_valid():
            return Response (
                food_filter.errors,
                status=status.HTTP_400_BAD_REQUEST
                )
        queryset = food_filter.qs

        #SORTING
        sort_by = request.GET.get("sort_by", "")
        sort_order = request.GET.get("sort_order","asc")

        if sort_by in SORTABLE_FIELDS:
            if sort_by in DUAL_SORT_FIELDS:
                if sort_order == "desc":
                    queryset = queryset.order_by(f"-{sort_by}")
                else:
                    queryset = queryset.order_by(sort_by)
            else:
                queryset = queryset.order_by(sort_by)
        else:
            queryset = queryset.order_by("expiry_date")

        #PAGINATION 

        paginator = FoodLogPagination()
        paginated_queryset = paginator.paginate_queryset(
            queryset, request
        )
        serializer = FoodLogSysSerializer(
            paginated_queryset, many=True
        )
        response = paginator.get_paginated_response(serializer.data)
        cache.set(cache_key, response.data, timeout= 60*5)
        return response

    elif request.method == 'POST':
        # Create a new food log
        serializer = FoodLogSysSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            bump_list_version(NAMESPACE, request.user.id)
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
        ck = detail_key(NAMESPACE, request.user.id, pk)
        cached = cache.get(ck)
        if cached is not None:
            return Response(cached, status=status.HTTP_200_OK)
        
        data = FoodLogSysSerializer(food_log).data
        cache.set(ck, data, timeout= 60*5) 
        return Response(data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        # Update a food log (PUT for full update, PATCH for partial update)
        partial = request.method == 'PATCH'
        serializer = FoodLogSysSerializer(food_log, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()

            cache.delete(detail_key(NAMESPACE, request.user.id, pk))
            bump_list_version(NAMESPACE, request.user.id)
            if food_log.meal:
                invalidate_cache("meals", request.user.id, detail_id=food_log.meal.id)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Keep reference to the meal if this food log is a leftover
        meal = food_log.meal
        food_log_id = food_log.id

        # Delete the food log first
        food_log.delete()

        if meal and meal.leftovers:
            # Remove this leftover
            meal.leftovers = [
                l for l in meal.leftovers
                if str(l.get("food_log_id")) != str(food_log_id)
            ]

            # If no leftovers remain, reset JSON and flags
            if not meal.leftovers:
                meal.leftovers = None
                meal.has_leftovers = False
                meal.leftovers_saved = False

            # Persist changes
            meal.save(update_fields=[
                "leftovers",
                "has_leftovers",
                "leftovers_saved",
                "updated_at"
            ])



        cache.delete(detail_key(NAMESPACE, request.user.id, pk))
        bump_list_version(NAMESPACE, request.user.id)
        if meal:
            invalidate_cache("meals", request.user.id, detail_id=meal.id)

        return Response(
            {"message": "Food log deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def expiring_soon(request):
    today = date.today()
    soon = today + timedelta(days=3)
    items = (
        FoodLogSys.objects.filter(user=request.user, expiry_date__lte=soon, is_consumed=False)
        .order_by("expiry_date")
        .values("id", "name", "category", "expiry_date")
    )
    out = []
    for item in items:
        days_left = (item["expiry_date"] - today).days
        out.append({
            "id": item["id"],
            "name": item["name"],
            "category": item["category"],
            "expiryDate": item["expiry_date"],
            "daysLeft": days_left,
        })
    return Response(out)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def food_log_summary(request):
    try:
        inv = InventoryService(request.user)
        summary = inv.get_food_log_summary()
        return Response(summary, status=status.HTTP_200_OK)
    except Exception as e:
        import traceback
        return Response({"error": str(e), "trace": traceback.format_exc()}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def food_log_category_breakdown(request):
    """
    Returns a breakdown of food logs by category.
    """
    inv = InventoryService(request.user)
    ava = inv.get_available_logs()
    breakdown = inv._get_category_breakdown(ava)
    return Response(breakdown, status=status.HTTP_200_OK)

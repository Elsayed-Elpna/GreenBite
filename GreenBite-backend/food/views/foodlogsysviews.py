from django.shortcuts import get_object_or_404
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import FoodLogSys
from ..serializers import FoodLogSysSerializer
from ..filters import FoodLogFilter 
from ..utils.caching import bump_list_version, detail_key, list_key
from ..pagination import FoodLogPagination

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
        cache.set(cache_key, response.data, timeout= 60*60*24)
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
        cache.set(ck, data, timeout= 60*60*24) 
        return Response(data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        # Update a food log (PUT for full update, PATCH for partial update)
        partial = request.method == 'PATCH'
        serializer = FoodLogSysSerializer(food_log, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()

            cache.delete(detail_key(NAMESPACE, request.user.id, pk))
            bump_list_version(NAMESPACE, request.user.id)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Delete a food log
        food_log.delete()
        
        cache.delete(detail_key(NAMESPACE, request.user.id, pk))
        bump_list_version(NAMESPACE, request.user.id)
        return Response(
            {'message': 'Food log deleted successfully'}, 
            status=status.HTTP_204_NO_CONTENT
        )


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def food_log_create(request):
#     """
#     Create a new food log entry.
#     """
#     serializer = FoodLogSysSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save(user=request.user)
#         return Response(serializer.data, status=status.HTTP_201_CREATED)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['PUT', 'PATCH'])
# @permission_classes([IsAuthenticated])
# def food_log_update(request, pk):
#     """
#     Update an existing food log entry.
#     """
#     food_log = get_object_or_404(FoodLogSys, pk=pk, user=request.user)
#     partial = request.method == 'PATCH'
#     serializer = FoodLogSysSerializer(food_log, data=request.data, partial=partial)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_200_OK)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# @api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
# def food_log_delete(request, pk):
#     """
#     Delete a food log entry.
#     """
#     food_log = get_object_or_404(FoodLogSys, pk=pk, user=request.user)
#     food_log.delete()
#     return Response(
#         {'message': f'Food log "{food_log.name}" deleted successfully'}, 
#         status=status.HTTP_204_NO_CONTENT
#     )

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..models import WasteLog
from ..serializers import WasteLogSerializer
from ..filters import WasteLogFilter
from ..pagination import WasteLogPagination

from django.core.cache import cache
from ..utils.caching import detail_key, list_key, invalidate_cache

CACHE_TTL_SECONDS = 60 * 5
NAMESPACE = "wastelog"

@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def waste_log_list_create(request):
    if request.method == "GET":
        user_id = request.user.id
        full_path = request.get_full_path()
        key = list_key(NAMESPACE, user_id, full_path)

        cached = cache.get(key)
        if cached is not None:
            return Response(cached, status= status.HTTP_200_OK)
        
        qs = (WasteLog.objects.filter(user=request.user).select_related("meal"))
        meal_id = request.query_params.get("meal")
        if meal_id:
            qs = qs.filter(meal_id = meal_id)
        # filters
        waste_filter = WasteLogFilter(request.GET,queryset=qs)
        if not waste_filter.is_valid():
            return Response(waste_filter.errors, status=status.HTTP_400_BAD_REQUEST)
        filtered_qs = waste_filter.qs
        # pagination
        paginator = WasteLogPagination()
        page = paginator.paginate_queryset(filtered_qs, request)
        if page is None:
            serializer = WasteLogSerializer(filtered_qs, many=True)
            data = serializer.data
            cache.set(key, data, timeout = CACHE_TTL_SECONDS)
            return Response(data, status=status.HTTP_200_OK)
        # serializer
        serializer = WasteLogSerializer(page, many=True)
        response = paginator.get_paginated_response(serializer.data)
        cache.set(key, response.data, timeout=CACHE_TTL_SECONDS)
        return response
    #post
    serializer = WasteLogSerializer(data = request.data, context ={"request": request})
    if serializer.is_valid():
        waste_log = serializer.save(user = request.user)
        invalidate_cache(NAMESPACE, request.user.id, detail_id=waste_log.id)
        if waste_log.meal:
            invalidate_cache("meals", request.user.id, detail_id=waste_log.meal.id)
        return Response(serializer.data, status = status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def waste_log_detail(request, pk):
    try:
        waste_log = WasteLog.objects.select_related("meal").get(pk = pk, user = request.user)
    except WasteLog.DoesNotExist:
        return Response({"detail" : "Not found"}, status =status.HTTP_404_NOT_FOUND)
    
    user_id = request.user.id
    detail_cache_key = detail_key(NAMESPACE, user_id, pk)

    if request.method == "GET":
        cached = cache.get(detail_cache_key)
        if cached is not None:
            return Response(cached, status=status.HTTP_200_OK)
        
        serializer = WasteLogSerializer(waste_log)
        data = serializer.data
        cache.set(detail_cache_key, data, timeout = CACHE_TTL_SECONDS)
        return Response(data, status=status.HTTP_200_OK)
    
    if request.method in ["PUT", "PATCH"]:
        partial = request.method == "PATCH"
        serializer = WasteLogSerializer(
            waste_log,
            data=request.data,
            partial = partial,
            context = {"request": request},
        )
        if serializer.is_valid():
            updated = serializer.save(user = request.user)
            invalidate_cache(NAMESPACE, request.user.id, detail_id = updated.id)
            if waste_log.meal:
                invalidate_cache("meals", request.user.id, detail_id=waste_log.meal.id)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    waste_log.delete()
    invalidate_cache(NAMESPACE, request.user.id, detail_id = waste_log.id)
    if waste_log.meal:
        invalidate_cache("meals", request.user.id, detail_id=waste_log.meal.id)
    return Response(status=status.HTTP_204_NO_CONTENT)

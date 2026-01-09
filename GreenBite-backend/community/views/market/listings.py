from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.exceptions import ValidationError
from community.models import ComMarket
from community.serializers.market import (
    MarketCreateUpdateSerializer, 
    MarketListSerializer, 
    MarketDetailSerializer
)
from community.permissions import IsActiveSeller, IsOwnerOrAdmin
from community.services.listing_service import MarketListingService
from community.filters.market_filters import MarketListingFilter
from django.shortcuts import get_object_or_404
from community.serializers.filters import MarketListingFilterSerializer

class MarketListingPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class MarketListingView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = MarketListingPagination

    def get_queryset(self):
        base_qs = ComMarket.objects.select_related("seller")
    
        # ✅ Validate query params first
        filter_serializer = MarketListingFilterSerializer(data=self.request.query_params)
        filter_serializer.is_valid(raise_exception=True)
    
        # ✅ Apply filter
        return MarketListingFilter(
            base_qs,
            filter_serializer.validated_data,
            self.request.user
        ).filter()

    def get(self, request, *args, **kwargs):
        """List all marketplace listings"""
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = MarketListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def post(self, request, *args, **kwargs):
        """Create new marketplace listing (active sellers only)"""
        # Permission check
        if not IsActiveSeller().has_permission(request, self):
            return Response(
                {"detail": "You are not allowed to create listings."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate and create
        serializer = MarketCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        listing = MarketListingService.create_listing(
            request.user, 
            serializer.validated_data
        )
        
        return Response({
            "id": listing.id,
            "title": listing.title,
            "status": listing.status,
            "created_at": listing.created_at
        }, status=status.HTTP_201_CREATED)


class MarketListingDetailView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == "GET":
            return MarketDetailSerializer
        return MarketCreateUpdateSerializer

    def get_permissions(self):
        """Apply IsOwnerOrAdmin for PATCH and DELETE"""
        if self.request.method in ["PATCH", "DELETE"]:
            return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get(self, request, listing_id):
        """Get listing details"""
        listing = get_object_or_404(
            ComMarket.objects.select_related('seller'), 
            id=listing_id
        )
        serializer = self.get_serializer(listing)
        return Response(serializer.data)

    def patch(self, request, listing_id):
        """Update listing (owner or admin only)"""
        # ✅ First check if listing exists and user has permission
        listing = get_object_or_404(ComMarket, id=listing_id)
        self.check_object_permissions(request, listing)
        
        # Validate
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Update (service handles transaction and select_for_update)
        try:
            listing = MarketListingService.update_listing(
                request.user, 
                listing_id, 
                serializer.validated_data
            )
        except ValidationError as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            "id": listing.id,
            "title": listing.title,
            "status": listing.status,
            "updated_at": listing.updated_at
        })

    def delete(self, request, listing_id):
        """Delete listing (owner or admin only)"""
        # ✅ First check if listing exists and user has permission
        listing = get_object_or_404(ComMarket, id=listing_id)
        self.check_object_permissions(request, listing)
        
        # Delete (service handles transaction and select_for_update)
        try:
            MarketListingService.delete_listing(request.user, listing_id)
        except ValidationError as e:
            msg = str(e)
            if msg == "Listing not found.":
                return Response({"detail": msg}, status=status.HTTP_404_NOT_FOUND)
            elif msg == "Cannot delete listing with active orders.":
                return Response({"detail": msg}, status=status.HTTP_409_CONFLICT)
            elif msg == "Listing already deleted.":
                return Response({"detail": msg}, status=status.HTTP_410_GONE)
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
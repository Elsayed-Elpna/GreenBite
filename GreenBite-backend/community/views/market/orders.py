from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from community.models import MarketOrder
from django_filters.rest_framework import DjangoFilterBackend
from community.serializers.orders import (
    MarketOrderCreateSerializer,
    BuyerOrderListSerializer,
    SellerOrderListSerializer,
    OrderDetailsSerializer,
)
from community.services.order_service import MarketOrderService
from community.permissions import IsActiveSeller
from community.filters.order_filters import BuyerOrderFilter, SellerOrderFilter
from community.pagination import StandardPagination
from rest_framework.exceptions import PermissionDenied


class MarketOrderCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MarketOrderCreateSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        order = MarketOrderService.create_order(
            buyer=request.user,
            market_id=serializer.validated_data["market_id"],
            validated_data=serializer.validated_data,
        )

        return Response(
            {
                "order_id": order.id,
                "status": order.status,
                "created_at": order.created_at,
            },
            status=status.HTTP_201_CREATED,
        )

class MarketOrderAcceptAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):

        order = MarketOrderService.accept_order(
            order_id=order_id,
            user=request.user,
        )

        return Response(
            {
                "order_id": order.id,
                "status": order.status,
            },
            status=200,
        )

class MarketOrderStatusUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, order_id):
        status_value = request.data.get("status")

        order = MarketOrderService.update_order_status(
            order_id=order_id,
            user=request.user,
            new_status=status_value,
        )

        return Response(
            {
                "order_id": order.id,
                "status": order.status,
            },
            status=201,
        )

class BuyerOrdersListAPIView(ListAPIView):
    serializer_class = BuyerOrderListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = BuyerOrderFilter
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        queryset = MarketOrder.objects.select_related("market")

        if not user.is_staff:
            queryset = queryset.filter(buyer=user)

        return queryset.order_by("-created_at")


class SellerOrdersListAPIView(ListAPIView):
    serializer_class = SellerOrderListSerializer
    permission_classes = [IsAuthenticated, IsActiveSeller]
    filter_backends = [DjangoFilterBackend]
    filterset_class = SellerOrderFilter
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        queryset = MarketOrder.objects.select_related("market", "buyer")

        if not user.is_staff:
            queryset = queryset.filter(seller=user)

        return queryset.order_by("-created_at")


class OrderDetailsAPIView(RetrieveAPIView):
    serializer_class = OrderDetailsSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "order_id"

    def get_queryset(self):
        return MarketOrder.objects.select_related(
            "market", "buyer", "seller", "address"
        )

    def get_object(self):
        order = super().get_object()
        user = self.request.user

        if user.is_staff or order.buyer == user or order.seller == user:
            return order

        raise PermissionDenied("Access denied.")
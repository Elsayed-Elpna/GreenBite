# community/services/order_service.py
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import (
    ValidationError,
    PermissionDenied,
    NotFound,
)

from community.models import ComMarket, MarketOrder, MarketOrderAddress


class MarketOrderService:

    ALLOWED_TRANSITIONS = {
        "PENDING": ["CANCELLED", "ACCEPTED"],
        "ACCEPTED": ["DELIVERED"],
    }

    @staticmethod
    @transaction.atomic
    def create_order(*, buyer, market_id, validated_data):

        try:
            market = ComMarket.objects.get(id=market_id)
        except ComMarket.DoesNotExist:
            raise NotFound("Listing not found.")

        if market.status != "ACTIVE":
            raise ValidationError("Listing is not active.")

        if market.is_expired():
            raise ValidationError("Listing has expired.")

        if market.seller == buyer:
            raise PermissionDenied("Cannot order your own listing.")

        quantity = validated_data["quantity"]

        if quantity < 1:
            raise ValidationError("Quantity must be at least 1.")

        if quantity > market.quantity:
            raise ValidationError("Insufficient quantity.")

        if validated_data["payment_method"] != "COD":
            raise ValidationError("Only Cash on Delivery is supported.")

        order = MarketOrder.objects.create(
            market=market,
            buyer=buyer,
            seller=market.seller,
            quantity=quantity,
            unit=market.unit,
            total_price=market.price * quantity,
            payment_method=validated_data["payment_method"],
            buyer_note=validated_data.get("buyer_note"),
        )

        MarketOrderAddress.objects.create(
            order=order,
            **validated_data["address"],
        )

        return order

    @staticmethod
    @transaction.atomic
    def accept_order(*, order_id, user):

        try:
            order = (
                MarketOrder.objects
                .select_for_update()
                .select_related("market")
                .get(id=order_id)
            )
        except MarketOrder.DoesNotExist:
            raise NotFound("Order not found.")

        market = (
            ComMarket.objects
            .select_for_update()
            .get(id=order.market_id)
        )

        # ───── PERMISSIONS ─────
        if not (user.is_staff or order.seller == user):
            raise PermissionDenied("Not authorized.")

        # ───── STATUS ─────
        if "ACCEPTED" not in MarketOrderService.ALLOWED_TRANSITIONS.get(order.status, []):
            raise ValidationError("Order cannot be accepted.")

        # ───── STOCK ─────
        if order.quantity > market.quantity:
            raise ValidationError("Insufficient quantity.")

        # ───── APPLY ─────
        market.quantity -= order.quantity
        if market.quantity == 0:
            market.status = "SOLD_OUT"

        market.save(update_fields=["quantity", "status"])

        order.status = "ACCEPTED"
        order.save(update_fields=["status"])

        return order

    @staticmethod
    @transaction.atomic
    def update_order_status(*, order_id, user, new_status):

        try:
            order = (
                MarketOrder.objects
                .select_for_update()
                .select_related("seller")
                .get(id=order_id)
            )
        except MarketOrder.DoesNotExist:
            raise NotFound("Order not found.")

        # ───── PERMISSIONS ─────
        if user.is_staff:
            pass
        elif new_status == "CANCELLED":
            if user not in (order.buyer, order.seller):
                raise PermissionDenied("Not authorized.")
        elif new_status == "DELIVERED":
            if user != order.seller:
                raise PermissionDenied("Only seller can deliver.")
        else:
            raise ValidationError("Invalid status.")

        # ───── TRANSITION ─────
        allowed = MarketOrderService.ALLOWED_TRANSITIONS.get(order.status, [])
        if new_status not in allowed:
            raise ValidationError(
                f"Invalid status transition from {order.status} to {new_status}."
            )

        order.status = new_status
        order.save(update_fields=["status"])

        # ───── SIDE EFFECT ─────
        if new_status == "DELIVERED":
            profile = order.seller.community_profile
            profile.total_sales += order.total_price
            profile.save(update_fields=["total_sales"])

        return order


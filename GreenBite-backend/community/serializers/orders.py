from rest_framework import serializers
import re
from community.models import (
    MarketOrder,
    MarketOrderAddress,
)

EMAIL_REGEX = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
class MarketOrderAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketOrderAddress
        exclude = ['id', 'order', 'created_at']

    # -----------------------------
    # Full Name Validation
    # -----------------------------
    def validate_full_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Full name is required.")

        if len(value) < 3:
            raise serializers.ValidationError(
                "Full name must be at least 3 characters long."
            )

        if not re.match(r'^[A-Za-z\s]+$', value):
            raise serializers.ValidationError(
                "Full name must contain only letters and spaces."
            )

        return value

    # -----------------------------
    # Phone Number Validation
    # -----------------------------
    def validate_phone_number(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("Phone number is required.")

        if not value.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(value) < 11 or len(value) > 15:
            raise serializers.ValidationError(
                "Phone number must be between 11 and 15 digits."
            )

        return value

    # -----------------------------
    # Email Validation (REGEX)
    # -----------------------------
    def validate_email(self, value):
        if value:
            value = value.strip().lower()

            if not re.match(EMAIL_REGEX, value):
                raise serializers.ValidationError(
                    "Enter a valid email address."
                )

            if len(value) > 255:
                raise serializers.ValidationError(
                    "Email is too long."
                )

        return value

    # -----------------------------
    # Address Line Validation
    # -----------------------------
    def validate_address_line(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Address line is required."
            )

        if len(value) < 10:
            raise serializers.ValidationError(
                "Address line must be at least 10 characters long."
            )

        return value

    # -----------------------------
    # City Validation
    # -----------------------------
    def validate_city(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError("City is required.")

        if not re.match(r'^[A-Za-z\s]+$', value):
            raise serializers.ValidationError(
                "City must contain only letters."
            )

        return value

    # -----------------------------
    # Notes Validation
    # -----------------------------
    def validate_notes(self, value):
        if value:
            value = value.strip()

            if len(value) > 500:
                raise serializers.ValidationError(
                    "Notes must not exceed 500 characters."
                )

        return value

    # -----------------------------
    # Object-Level Validation
    # -----------------------------
    def validate(self, attrs):
        phone = attrs.get('phone_number')
        email = attrs.get('email')

        if not phone and not email:
            raise serializers.ValidationError(
                "You must provide at least a phone number or an email."
            )

        return attrs


class MarketOrderCreateSerializer(serializers.ModelSerializer):
    address = MarketOrderAddressSerializer(write_only=True)
    market_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = MarketOrder
        fields = [
            'id',
            'market_id',
            'quantity',
            'payment_method',
            'buyer_note',
            'address',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        # handled in service
        raise NotImplementedError


class MarketOrderAcceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketOrder
        fields = ['id']
        read_only_fields = ['id']

    def validate(self, attrs):
        order = self.instance

        if order.status != 'PENDING':
            raise serializers.ValidationError(
                "Only pending orders can be accepted."
            )

        return attrs


class MarketOrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketOrder
        fields = ['status']

class BuyerOrderListSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="id", read_only=True)
    listing_id = serializers.IntegerField(source="market.id", read_only=True)
    listing_title = serializers.CharField(source="market.title", read_only=True)

    class Meta:
        model = MarketOrder
        fields = [
            "order_id",
            "listing_id",
            "listing_title",
            "quantity",
            "unit",
            "total_price",
            "status",
            "created_at",
        ]

class SellerOrderListSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="id", read_only=True)
    buyer_name = serializers.CharField(
        source="buyer.get_full_name",
        read_only=True
    )
    listing_title = serializers.CharField(
        source="market.title",
        read_only=True
    )

    class Meta:
        model = MarketOrder
        fields = [
            "order_id",
            "buyer_name",
            "listing_title",
            "quantity",
            "unit",
            "status",
            "created_at",
        ]


class OrderDetailsSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="id", read_only=True)

    listing = serializers.SerializerMethodField()
    address = MarketOrderAddressSerializer(read_only=True)

    class Meta:
        model = MarketOrder
        fields = [
            "order_id",
            "status",
            "payment_method",
            "buyer_note",
            "created_at",
            "listing",
            "quantity",
            "total_price",
            "address",
        ]

    def get_listing(self, obj):
        return {
            "id": obj.market.id,
            "title": obj.market.title,
            "price": obj.market.price,
            "currency": obj.market.currency,
            "unit": obj.market.unit,
        }


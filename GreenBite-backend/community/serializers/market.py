from django.utils import timezone
from rest_framework import serializers
from community.models import ComMarket


class MarketCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComMarket
        fields = [
            'title',
            'description',
            'featured_image',
            'price',
            'currency',
            'quantity',
            'unit',
            'available_from',
            'available_until',
        ]
        extra_kwargs = {
            'currency': {'required': False},
            'available_from': {'required': False},
        }

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value

    def validate_available_until(self, value):
        if value <= timezone.now().date():
            raise serializers.ValidationError(
                "available_until must be a future date."
            )
        return value


# Base serializer for common fields
class MarketBaseSerializer(serializers.ModelSerializer):
    seller = serializers.SerializerMethodField()

    def get_seller(self, obj):
        return {
            "id": obj.seller.id,
            "email": obj.seller.email
        }


class MarketListSerializer(MarketBaseSerializer):
    class Meta:
        model = ComMarket
        fields = [
            'id',
            'title',
            'price',
            'currency',
            'quantity',
            'unit',
            'status',
            'seller',
            'featured_image',
            'available_until',
            'available_from',
            'created_at',
        ]


class MarketDetailSerializer(MarketBaseSerializer):
    class Meta:
        model = ComMarket
        fields = [
            'id',
            'title',
            'description',
            'featured_image',
            'price',
            'currency',
            'quantity',
            'unit',
            'available_from',
            'available_until',
            'status',
            'seller',
            'created_at',
        ]
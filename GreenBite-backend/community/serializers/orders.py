from rest_framework import serializers

from community.models import (
    MarketOrder,
    MarketOrderAddress,
)


class MarketOrderAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketOrderAddress
        exclude = ['id', 'order', 'created_at']

    def validate_phone_number(self, value):
        if len(value) < 11:
            raise serializers.ValidationError("Invalid phone number.")
        return value


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


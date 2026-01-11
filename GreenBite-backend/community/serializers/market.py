from community.services.minio_storage import presign_get_url
from django.conf import settings
from django.conf import settings
from rest_framework import serializers

from community.models.market import ComMarket
from community.services.minio_storage import presign_get_url
from django.utils import timezone

class MarketCreateUpdateSerializer(serializers.ModelSerializer):
    featured_image = serializers.ImageField(
        required=False, allow_null=True, write_only=True
    )
    featured_image_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ComMarket
        fields = [
            "title",
            "description",
            "featured_image",  
            "featured_image_key",  
            "featured_image_url",  
            "price",
            "currency",
            "quantity",
            "unit",
            "available_from",
            "available_until",
        ]
        extra_kwargs = {
            "currency": {"required": False},
            "available_from": {"required": False},
            "featured_image_key": {"read_only": True},
        }

    def get_featured_image_url(self, obj):
        if not obj.featured_image_key:
            return ""
        if getattr(settings, "S3_PUBLIC_MEDIA_BASE_URL", ""):
            return f"{settings.S3_PUBLIC_MEDIA_BASE_URL}/{settings.S3_BUCKET_MARKET_IMAGES}/{obj.featured_image_key}"
        return presign_get_url(obj.featured_image_key, expires_seconds=3600)

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
    featured_image_url = serializers.SerializerMethodField()

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
            'featured_image_key',
            'featured_image_url',
            'available_until',
            'available_from',
            'created_at',
        ]

    def get_featured_image_url(self, obj):
        if not obj.featured_image_key:
            return ""
        if getattr(settings, "S3_PUBLIC_MEDIA_BASE_URL", ""):
            return f"{settings.S3_PUBLIC_MEDIA_BASE_URL}/{settings.S3_BUCKET_MARKET_IMAGES}/{obj.featured_image_key}"
        return presign_get_url(obj.featured_image_key, expires_seconds=3600)



class MarketDetailSerializer(MarketBaseSerializer):
    featured_image_url = serializers.SerializerMethodField()
    class Meta:
        model = ComMarket
        fields = [
            'id',
            'title',
            'description',
            'featured_image_key',
            'featured_image_url',
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
    def get_featured_image_url(self, obj):
        if not obj.featured_image_key:
            return ""
        if getattr(settings, "S3_PUBLIC_MEDIA_BASE_URL", ""):
            return f"{settings.S3_PUBLIC_MEDIA_BASE_URL}/{settings.S3_BUCKET_MARKET_IMAGES}/{obj.featured_image_key}"
        return presign_get_url(obj.featured_image_key, expires_seconds=3600)

from community.models import ComMarket, CommunityParent
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from community.services.minio_storage import upload_market_image


class MarketListingService:
    """Service class for marketplace listing operations"""
    
    @staticmethod
    def _has_active_orders(listing):
        """Check if listing has pending or accepted orders"""
        return listing.orders.filter(status__in=["PENDING", "ACCEPTED"]).exists()

    @staticmethod
    @transaction.atomic
    def create_listing(user, validated_data):
        """Create new marketplace listing"""
        today = timezone.now().date()
        data = dict(validated_data)
        image= data.pop("featured_image", None)
        
        parent = CommunityParent.objects.create(
            creator=user,
            community_type="MARKET",
            status="ACTIVE",
            visibility="PUBLIC",
        )
        
        data["available_from"] = today
        
        listing = ComMarket.objects.create(
            community_parent=parent,
            seller=user,
            status="ACTIVE",
            **data
        )
        if image is not None:
            uploaded = upload_market_image(image, user_id=user.id)
            listing.featured_image_key = uploaded.key
            listing.save(update_fields=["featured_image_key", "updated_at"])
        return listing

    @staticmethod
    @transaction.atomic
    def update_listing(user, listing_id, validated_data):
        """
        Update marketplace listing
        Permissions should be checked by view layer before calling this
        """
        # ✅ Fetch with lock inside transaction
        try:
            listing = ComMarket.objects.select_for_update().get(id=listing_id)
        except ComMarket.DoesNotExist:
            raise ValidationError("Listing not found.")
        
        # Status validation (business rule)
        if not user.is_staff and listing.status != "ACTIVE":
            raise ValidationError("Only ACTIVE listings can be updated.")
        
        if user.is_staff and listing.status not in ["ACTIVE", "EXPIRED"]:
            raise ValidationError("Cannot edit this listing.")
        
        # Active orders check (business rule)
        if MarketListingService._has_active_orders(listing):
            raise ValidationError("Cannot edit listing with active orders.")
        data = dict(validated_data)
        image = data.pop("featured_image", None)
        
        # Update allowed fields
        allowed_fields = [
            "title", "description", "featured_image",
            "price", "quantity", "unit", "available_until"
        ]
        
        for field in allowed_fields:
            if field in validated_data:
                setattr(listing, field, data[field])
        if image is not None :
            uploaded = upload_market_image(image, user_id= user.id)
            listing.featured_image_key = uploaded.key
        
        listing.save()
        return listing

    @staticmethod
    @transaction.atomic
    def delete_listing(user, listing_id):
        """
        Soft delete marketplace listing
        Permissions should be checked by view layer before calling this
        """
        # Fetch with lock inside transaction
        try:
            listing = ComMarket.objects.select_for_update().get(id=listing_id)
        except ComMarket.DoesNotExist:
            raise ValidationError("Listing not found.")
        
        # Status validation (business rule)
        if listing.status == "DELETED":
            raise ValidationError("Listing already deleted.")
        
        if listing.status != "ACTIVE":
            raise ValidationError("Only ACTIVE listings can be deleted.")
        
        # Active orders check (business rule)
        if MarketListingService._has_active_orders(listing):
            raise ValidationError("Cannot delete listing with active orders.")
        
        # Soft delete
        listing.status = "DELETED"
        listing.deleted_at = timezone.now()
        listing.save()
        
        return listing

    @staticmethod
    def get_listing(listing_id):
        """Get listing by ID (for read operations)"""
        try:
            return ComMarket.objects.select_related('seller').get(id=listing_id)
        except ComMarket.DoesNotExist:
            raise ValidationError("Listing not found.")
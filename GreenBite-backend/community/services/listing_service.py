from community.models import ComMarket, CommunityParent
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError


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
        
        parent = CommunityParent.objects.create(
            creator=user,
            community_type="MARKET",
            status="ACTIVE",
            visibility="PUBLIC",
        )
        
        validated_data["available_from"] = today
        
        return ComMarket.objects.create(
            community_parent=parent,
            seller=user,
            status="ACTIVE",
            **validated_data
        )

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
        
        # Update allowed fields
        allowed_fields = [
            "title", "description", "featured_image",
            "price", "quantity", "unit", "available_until"
        ]
        
        for field in allowed_fields:
            if field in validated_data:
                setattr(listing, field, validated_data[field])
        
        listing.save()
        return listing

    @staticmethod
    @transaction.atomic
    def delete_listing(user, listing_id):
        """
        Soft delete marketplace listing
        Permissions should be checked by view layer before calling this
        """
        # ✅ Fetch with lock inside transaction
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
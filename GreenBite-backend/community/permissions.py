from rest_framework import permissions
from rest_framework.permissions import BasePermission

class IsActiveSeller(permissions.BasePermission):
    """
    Allows access only to active sellers with subscription.
    """

    def has_permission(self, request, view):
        user = request.user
        profile = getattr(user, "community_profile", None)
        if not profile:
            return False
        if not profile.is_community_member:
            return False
        if profile.seller_status != "ACTIVE":
            return False
        if profile.subscription_plan != "SELLER":
            return False
        return True

class IsOwnerOrAdmin(BasePermission):
    """
    Allows access only to the owner of the object or admin users.
    """

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.seller == request.user

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )

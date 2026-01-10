import re

from rest_framework import serializers
from djoser.serializers import (
    UserCreatePasswordRetypeSerializer,
    UserSerializer,
)

from accounts.models import User
from accounts.serializers.profile import ProfileSerializer
from community.serializers import CommunityProfileSerializer


class UserCreateSerializer(UserCreatePasswordRetypeSerializer):
    """
    Custom user registration serializer
    with strong password & email validation
    """
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = (
            "id",
            "email",
            "password",
            "first_name",
            "last_name",
            "is_staff",
        )

    def validate(self, attrs):
        attrs = super().validate(attrs)

        password = attrs.get("password")
        email = attrs.get("email")
        errors = {}

        PASSWORD_REGEX = r'[!@#$%^&*()_+\-=\[\]{};\'":\\|,.<>/?`~]'

        if len(password) < 8:
            errors.setdefault("password", []).append(
                "Password must be at least 8 characters"
            )

        if not re.search(PASSWORD_REGEX, password):
            errors.setdefault("password", []).append(
                "Password must contain a special character"
            )

        if not any(c.isupper() for c in password):
            errors.setdefault("password", []).append(
                "Password must contain an uppercase letter"
            )

        if not any(c.isdigit() for c in password):
            errors.setdefault("password", []).append(
                "Password must contain a digit"
            )

        EMAIL_REGEX = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        if not re.fullmatch(EMAIL_REGEX, email):
            errors.setdefault("email", []).append(
                "Invalid email format"
            )

        if errors:
            raise serializers.ValidationError(errors)

        return attrs
    

class UserMeSerializer(UserSerializer):
    """
    Read-only user serializer
    Used for current user endpoint (/users/me/)
    """

    profile = ProfileSerializer(read_only=True)

    # 👇 Community Profile (Seller / Trust / Sales)
    community = CommunityProfileSerializer(
        source="community_profile",
        read_only=True
    )

    is_subscribed = serializers.SerializerMethodField()
    subscription = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        model = User

        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_subscribed",
            "profile",
            "community",
            "subscription",
        )
        read_only_fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "is_subscribed",
            "profile",
            "community",
            "subscription",
        )

    def get_is_subscribed(self, obj):
        subscription = getattr(obj, "subscription", None)
        return bool(subscription and subscription.is_active)

    def get_subscription(self, obj):
        subscription = getattr(obj, "subscription", None)

        if not subscription or not subscription.is_active:
            return None

        return {
            "plan": subscription.plan.name if subscription.plan else None,
            "ends_at": subscription.end_date,
        }


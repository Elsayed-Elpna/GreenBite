import re
from rest_framework import serializers
from djoser.serializers import (
    UserCreatePasswordRetypeSerializer,
    UserSerializer
)
from accounts.models import User
from accounts.serializers.profile import ProfileSerializer



class UserCreateSerializer(UserCreatePasswordRetypeSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = ["id", "email", "password", "first_name", "last_name"]

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
            errors.setdefault("email", []).append("Invalid email format")

        if errors:
            raise serializers.ValidationError(errors)

        return attrs


class UserMeSerializer(UserSerializer):
    """
    READ ONLY USER DATA
    """
    profile = ProfileSerializer(read_only=True)

    class Meta(UserSerializer.Meta):
        import re
from rest_framework import serializers
from djoser.serializers import (
    UserCreatePasswordRetypeSerializer,
    UserSerializer
)
from accounts.models import User
from accounts.serializers.profile import ProfileSerializer



class UserCreateSerializer(UserCreatePasswordRetypeSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = ["id", "email", "password", "first_name", "last_name"]

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
            errors.setdefault("email", []).append("Invalid email format")

        if errors:
            raise serializers.ValidationError(errors)

        return attrs


class UserMeSerializer(UserSerializer):
    """
    READ ONLY USER DATA
    """
    profile = ProfileSerializer(read_only=True)

    class Meta(UserSerializer.Meta):
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "profile",
        )


from rest_framework import serializers
from djoser.serializers import UserCreatePasswordRetypeSerializer
from .models import User
import re

class UserCreateSerializer(UserCreatePasswordRetypeSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta(UserCreatePasswordRetypeSerializer.Meta):
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name"]

    def validate(self, attrs): 
        attrs = super().validate(attrs)
        username = attrs.get("username")
        password = attrs.get("password")
        email = attrs.get("email")
        errors = {}

        # Username validation
        USERNAME_REGEX = r'^[a-zA-Z0-9_]{3,30}$'
        if not re.fullmatch(USERNAME_REGEX, username):
            errors.setdefault("username", []).append(
                "Username must contain only letters, numbers, and underscores (3–30 chars)."
            )

        # Password validation
        PASSWORD_REGEX = r'[!@#$%^&*()_+\-=\[\]{};\'":\\|,.<>/?`~]'
        if not re.search(PASSWORD_REGEX, password):
            errors.setdefault("password", []).append(
                "Password must contain at least one special character"
            )
        if username and username.lower() in password.lower():
            errors.setdefault("password", []).append(
                "Password must not contain the username"
            )
        if len(password) < 8:
            errors.setdefault("password", []).append(
                "Password must be at least 8 characters long"
            )
        if not any(c.isupper() for c in password):
            errors.setdefault("password", []).append(
                "Password must contain at least one uppercase letter"
            )
        if not any(c.isdigit() for c in password):
            errors.setdefault("password", []).append(
                "Password must contain at least one digit"
            )

        # Email validation
        EMAIL_REGEX = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        if not re.fullmatch(EMAIL_REGEX, email):
            errors.setdefault("email", []).append("Invalid email format")

        if errors:
            raise serializers.ValidationError(errors)
        
        return attrs

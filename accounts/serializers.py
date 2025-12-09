# serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from djoser.serializers import UserCreatePasswordRetypeSerializer as DjoserUserCreatePasswordRetypeSerializer
from djoser.serializers import SetPasswordRetypeSerializer
import re

User = get_user_model()


class UserCreateSerializer(DjoserUserCreatePasswordRetypeSerializer):
    class Meta():
        model = User
        fields = ["id","username" , "email" , "password" , ]
    def validate(self, attrs): 
        attrs = super().validate(attrs)
        username = attrs.get("username")
        password = attrs.get("password")
        email = attrs.get("email")
        errors = {}
        ############################################
        # username valdation 
        ############################################
        USERNAME_REGEX = r'^[a-zA-Z0-9_]{3,30}$'
        if not re.fullmatch(USERNAME_REGEX, username):
            errors.setdefault("username", []).append("Username must contain only letters, numbers, and underscores (3–30 chars).")
        
        ############################################
        # password valdation
        ############################################
        PASSWORD_REGEX = r'[!@#$%^&*()_+\-=\[\]{};\'":\\|,.<>/?`~]'
        if not re.search(PASSWORD_REGEX, password):
            errors.setdefault("password", []).append("Password must contain at least one special character")

        if username and username.lower() in password.lower():
            errors.setdefault("password", []).append("Password must not contain the username")

        if len(password) < 8 :
            errors.setdefault("password",[]).append("Password must be at least 8 characters long")

        if not any(c.isupper() for c in password):
            errors.setdefault("password",[]).append("Password must contain at least one uppercase letter")

        if not any(c.isdigit() for c in password):
            errors.setdefault("password",[]).append("Password must contain at least one digit")
        
        ############################################
        # email valdation
        ############################################
        EMAIL_REGEX = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        if not re.fullmatch(EMAIL_REGEX, email):
            errors.setdefault("email", []).append("Invalid email format")

        if errors:
            raise serializers.ValidationError(errors)
        
        return attrs
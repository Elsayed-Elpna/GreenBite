from rest_framework import serializers
from accounts.models import Profile
from django.core.files.images import get_image_dimensions


class ProfileSerializer(serializers.ModelSerializer):

    def validate_avatar(self, value):
        if value is None:
            return value
        
        max_size = 2 * 1024 * 1024  
        if value.size > max_size:
            raise serializers.ValidationError(
                "Avatar size must not exceed 2MB."
            )

        
        allowed_extensions = ["jpg", "jpeg", "png", "webp"]
        ext = value.name.split(".")[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                "Only jpg, jpeg, png, webp images are allowed."
            )

        
        try:
            get_image_dimensions(value)
        except Exception:
            raise serializers.ValidationError(
                "Uploaded file is not a valid image."
            )

        return value

    class Meta:
        model = Profile
        fields = ["username", "avatar"]

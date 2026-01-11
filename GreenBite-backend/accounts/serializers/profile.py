from rest_framework import serializers
from accounts.models import Profile
from django.core.files.images import get_image_dimensions
from django.conf import settings
from accounts.services.minio_storage import upload_profile_avatar, presign_get_profile_avatar_url
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(
        required=False, allow_null=True, write_only=True
    )
    avatar_url = serializers.SerializerMethodField(read_only=True)
    def get_avatar_url(self, obj):
        if not obj.avatar_key:
            return ""
        if getattr(settings, "S3_PUBLIC_MEDIA_BASE_URL", ""):
            url = f"{settings.S3_PUBLIC_MEDIA_BASE_URL}/{settings.S3_BUCKET_PROFILE_AVATARS}/{obj.avatar_key}"
        else:
            url = presign_get_profile_avatar_url(obj.avatar_key, expires_seconds=3600)

        # Cache-bust when avatar changes
        ts = int(getattr(obj, "updated_at", None).timestamp()) if getattr(obj, "updated_at", None) else ""
        return f"{url}{'&' if '?' in url else '?'}v={ts}"
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
        fields = ["username", "avatar", "avatar_key", "avatar_url"]
        extra_kwargs= {
            "avatar_key": {"read_only":True}
        }
    def update(self, instance, validated_data):
        image = validated_data.pop("avatar", None)

        # normal fields (username)
        for k, v in validated_data.items():
            setattr(instance, k, v)

        request = self.context.get("request")
        if image is not None and request and request.user and request.user.is_authenticated:
            uploaded = upload_profile_avatar(image, user_id=request.user.id)
            instance.avatar_key = uploaded.key

        instance.save()
        return instance

from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager


class User(AbstractUser):
    """
    Custom User model
    - Authentication via email
    - Username optional (used only if needed)
    """
    username = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


def profile_avatar_upload_path(instance, filename):
    """
    media/profiles/avatars/user_<id>/<filename>
    """
    return f"profiles/avatars/user_{instance.user.id}/{filename}"


class Profile(models.Model):
    """
    Profile model (separated from User)
    - Holds user-related UI data
    """
    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="profile"
    )
    username = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )
    avatar = models.ImageField(
        upload_to=profile_avatar_upload_path,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username or f"profile-{self.id}"

from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager

class User(AbstractUser):
    is_active = models.BooleanField(default=False)
    email = models.EmailField(unique=True, blank=False)
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    USERNAME_FIELD = 'email'

    objects = UserManager()

    def __str__(self):
        return self.username

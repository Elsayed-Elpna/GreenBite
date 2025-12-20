from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_active = models.BooleanField(default=False)
    email = models.EmailField(unique=True, blank=False)
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.username

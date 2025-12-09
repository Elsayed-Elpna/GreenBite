from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True, blank=False)
    frist_name = models.CharField(blank=False)
    last_name = models.CharField(blank=False)
    
    def __str__(self):
        return self.username
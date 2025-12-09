from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True, blank=False)
    frist_name = models.CharField(blank=False, max_length=20 , )
    last_name = models.CharField(blank=False , max_length=20 , )
    REQUIRED_FIELDS = ['email', 'frist_name', 'last_name']
    
    def __str__(self):
        return self.username
    
    
# import uuid
from django.db import models
from django.utils import timezone

class CommunityParent(models.Model):
    # Primary Key
    id = models.BigAutoField(primary_key=True)


    # Creator of the content
    creator = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='community_contents'
    )

    # Type of community content
    COMMUNITY_TYPE_CHOICES = [
        ('BLOG', 'Blog'),
        ('SHARING', 'Sharing'),
        ('MARKET', 'Market'),
    ]
    community_type = models.CharField(
        max_length=20,
        choices=COMMUNITY_TYPE_CHOICES,
        default='MARKET'
    )

    # Status of the content
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('CLOSED', 'Closed'),
        ('COMPLETED', 'Completed'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='ACTIVE'
    )

    # Visibility of the content
    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('PRIVATE', 'Private'),
    ]
    visibility = models.CharField(
        max_length=20,
        choices=VISIBILITY_CHOICES,
        default='PUBLIC'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'community_parent'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.community_type} by {self.creator.email} ({self.status})"

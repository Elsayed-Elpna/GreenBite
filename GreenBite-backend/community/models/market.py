# import uuid
from django.db import models
from django.utils import timezone

class ComMarket(models.Model):
    id = models.BigAutoField(primary_key=True)

    # Relations
    community_parent = models.ForeignKey(
        'CommunityParent',
        on_delete=models.CASCADE,
        related_name='market_listings',

    )
    seller = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='market_listings',

    )

    # Product info
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    featured_image = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10)

    # Quantity & unit
    quantity = models.IntegerField()
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('l', 'Liter'),
        ('pcs', 'Pieces'),
        ('portion', 'Portion'),
    ]
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)

    # Availability
    available_from = models.DateField(null=True, blank=True)
    available_until = models.DateField()

    # Status
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('SOLD_OUT', 'Sold Out'),
        ('EXPIRED', 'Expired'),
        ('DELETED', 'Deleted'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'com_market'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.seller.email} ({self.status})"

    def soft_delete(self):
        self.status = 'DELETED'
        self.deleted_at = timezone.now()
        self.save()

    def is_expired(self):
        return self.available_until and timezone.now().date() > self.available_until


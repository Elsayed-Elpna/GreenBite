# import uuid
from django.db import models
from django.utils import timezone

class MarketOrder(models.Model):
    id = models.BigAutoField(primary_key=True)

    # Relations
    market = models.ForeignKey(
        'ComMarket',
        on_delete=models.CASCADE,
        related_name='orders',

    )
    buyer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='buyer_orders',

    )
    seller = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='seller_orders',

    )

    # Order info
    quantity = models.IntegerField()
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('l', 'Liter'),
        ('pcs', 'Pieces'),
        ('portion', 'Portion'),
    ]
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    PAYMENT_CHOICES = [
        ('COD', 'Cash on Delivery'),
        # future-proofing for other payment methods
    ]
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='COD')

    buyer_note = models.TextField(null=True, blank=True)

    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'market_order'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} - {self.market.title} - {self.status}"


class MarketOrderAddress(models.Model):
    id = models.BigAutoField(primary_key=True)
    order = models.OneToOneField(
        'MarketOrder',
        on_delete=models.CASCADE,
        related_name='address',

    )
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=30)
    email = models.EmailField(null=True, blank=True)
    address_line = models.TextField()
    city = models.CharField(max_length=100)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'market_order_address'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.city}"

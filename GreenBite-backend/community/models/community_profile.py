from django.db import models
from django.utils import timezone


class CommunityProfile(models.Model):
    id = models.BigAutoField(primary_key=True)
    
    # Relation to User
    user = models.OneToOneField(
        'accounts.User', 
        on_delete=models.CASCADE, 
        related_name='community_profile'
    )
    
    # Membership info
    is_community_member = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    # Reputation / Trust
    trust_score = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_shares = models.IntegerField(default=0)
    total_sales = models.IntegerField(default=0)
    
    # Seller status & subscription
    seller_status = models.CharField(
        max_length=20, 
        choices=[
            ('NONE', 'None'),
            ('ACTIVE', 'Active'),
            ('SUSPENDED', 'Suspended')
        ],
        default='NONE'
    )
    subscription_plan = models.CharField(
        max_length=30, 
        choices=[
            ('SELLER', 'Seller')
        ],
        null=True, 
        blank=True,
        default=None
    )
    
    # Ban info
    banned_until = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'community_profile'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.seller_status}"

    def is_banned(self):
        """Check if user is currently banned"""
        if self.banned_until:
            return timezone.now() < self.banned_until
        return False
    
    def suspend_seller(self):
        self.seller_status = "SUSPENDED"
        self.subscription_plan = None
        self.save(
            update_fields=[
                "seller_status",
                "subscription_plan",
                "updated_at"
            ]
        )

    @property
    def effective_seller_status(self):
        """Returns the real seller status taking into account banned_until"""
        if self.banned_until and timezone.now() < self.banned_until:
            return "SUSPENDED"
        return self.seller_status
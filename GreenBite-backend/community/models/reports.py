from django.db import models
from django.conf import settings


class CommunityReport(models.Model):
    class TargetType(models.TextChoices):
        MARKET = 'MARKET', 'Marketplace Listing'
        USER = 'USER', 'User'
        BLOG = 'BLOG', 'Blog Post'      # future
        SHARE = 'SHARE', 'Shared Food'  # future

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        DISMISSED = 'DISMISSED', 'Dismissed'
        APPROVED = 'APPROVED', 'Approved'

    class AdminAction(models.TextChoices):
        NONE = "NONE", "No Action"
        SUSPEND_SELLER = "SUSPEND_SELLER", "Suspend Seller"
        BAN_USER = "BAN_USER", "Ban User"
        DELETE_MARKET = "DELETE_MARKET", "Delete Market"

    id = models.BigAutoField(primary_key=True)
    
    # Reporter
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submitted_reports',
        db_column='reporter_id'
    )
    
    # Target info
    target_type = models.CharField(
        max_length=20,
        choices=TargetType.choices
    )
    target_id = models.BigIntegerField()
    
    # Report content
    reason = models.CharField(max_length=100)
    details = models.TextField(null=True, blank=True)
    
    # Moderation fields
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    admin_action = models.CharField(
        max_length=20, 
        choices=AdminAction.choices, 
        null=True, 
        blank=True
    )
    admin_notes = models.TextField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_reports',
        db_column='reviewed_by_id'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('reporter', 'target_type', 'target_id')
        db_table = 'community_report'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Report #{self.id} ({self.target_type}) - {self.status}"
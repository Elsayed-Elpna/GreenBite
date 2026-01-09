from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from accounts.models import User
from community.models import CommunityProfile, ComMarket
from django.utils import timezone


@receiver(post_save, sender=User)
def create_community_profile(sender, instance, created, **kwargs):
    """Create CommunityProfile when User is created"""
    if created:
        CommunityProfile.objects.create(user=instance)

@receiver(pre_save, sender=ComMarket)
def auto_expire_market_listing(sender, instance, **kwargs):
    if instance.available_until and instance.available_until < timezone.now().date():
        instance.status = "EXPIRED"

@receiver(pre_save, sender=CommunityProfile)
def check_unban(sender, instance, **kwargs):
    """
    Automatically set seller_status back to ACTIVE if banned_until has passed.
    Using pre_save to avoid infinite loop.
    """
    if instance.banned_until and instance.banned_until <= timezone.now():
        if instance.seller_status == "SUSPENDED":
            instance.seller_status = "ACTIVE"
            instance.banned_until = None
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from accounts.models import User
from community.models import CommunityProfile
from django.utils import timezone


@receiver(post_save, sender=User)
def create_community_profile(sender, instance, created, **kwargs):
    """Create CommunityProfile when User is created"""
    if created:
        CommunityProfile.objects.create(user=instance)


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
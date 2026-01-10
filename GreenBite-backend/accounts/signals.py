from django.db.models.signals import post_save
from django.db.models.signals import pre_save
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.conf import settings
import shutil
import os 
from accounts.services.minio_storage import delete_profile_avatar
from .models import Profile

User = get_user_model()


def generate_username(first_name, last_name):
    first = (first_name or "").strip()
    last = (last_name or "").strip()

    full_name = f"{first} {last}".strip().lower()

    return full_name or None

@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
  if created:
    username = generate_username(instance.first_name, instance.last_name)
    Profile.objects.create(user=instance, username=username)


@receiver(pre_save, sender=Profile)
def delete_old_avatar(sender, instance, **kwargs):
    # On update only
    if not instance.pk:
        return

    try:
        old_instance = Profile.objects.get(pk=instance.pk)
    except Profile.DoesNotExist:
        return

    old_key = old_instance.avatar_key
    new_key = instance.avatar_key

    # If avatar changed, delete old object from MinIO
    if old_key and old_key != new_key:
        delete_profile_avatar(old_key)


@receiver(post_delete, sender=Profile)
def delete_profile_media(sender, instance, **kwargs):
    # Delete avatar object when profile is deleted
    if instance.avatar_key:
        delete_profile_avatar(instance.avatar_key)
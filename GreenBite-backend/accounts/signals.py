from django.db.models.signals import post_save
from django.db.models.signals import pre_save
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.conf import settings
import shutil
import os 

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
  if not instance.pk:
    return
  
  try:
    old_instance = Profile.objects.get(pk=instance.pk)
  except Profile.DoesNotExist:
    return
  
  old_avatar = old_instance.avatar
  new_avatar = instance.avatar

  if old_avatar and not new_avatar:
    if os.path.isfile(old_avatar.path):
      os.remove(old_avatar.path)

  elif old_avatar and new_avatar and old_avatar != new_avatar:
    if os.path.isfile(old_avatar.path):
      os.remove(old_avatar.path)

@receiver(post_delete, sender=User)
def delete_user_media(sender, instance, **kwargs):
  user_media_path = os.path.join(
    settings.MEDIA_ROOT,
    "profiles",
    "avatars",
    f"user_{instance.id}"
)

  if os.path.isdir(user_media_path):
    shutil.rmtree(user_media_path)
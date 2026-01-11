from celery import shared_task
from django.utils import timezone
import logging

from .models import Subscription
from community.models import CommunityProfile

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3, "countdown": 10},
)
def expire_subscriptions(self):
    now = timezone.now()

    expired_subscriptions = Subscription.objects.filter(
        is_active=True,
        end_date__lt=now
    )

    count = expired_subscriptions.count()

    for subscription in expired_subscriptions:
        
        subscription.is_active = False
        subscription.save(update_fields=["is_active"])

        
        try:
            community_profile = subscription.user.community_profile
            community_profile.suspend_seller()
        except CommunityProfile.DoesNotExist:
            logger.warning(
                "CommunityProfile not found | user=%s",
                subscription.user_id
            )

        logger.info(
            "Subscription expired | user=%s | ended_at=%s",
            subscription.user_id,
            subscription.end_date
        )

    return f"{count} subscription(s) expired"
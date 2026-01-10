from subscriptions.models import Subscription
from .models import Payment
from community.models import CommunityProfile
from django.utils import timezone

import logging

logger = logging.getLogger("payments")

def handle_success_payment(payment: Payment):

    if payment.status == Payment.SUCCESS:
        logger.info(
            "[PAYMENT SKIPPED] already successful | payment_id=%s",
            payment.id
        )
        return

    payment.status = Payment.SUCCESS
    payment.save(update_fields=["status"])

    subscription, _ = Subscription.objects.get_or_create(
        user=payment.user
    )
    subscription.activate(payment.subscription_plan)

    community_profile, _ = CommunityProfile.objects.get_or_create(
        user=payment.user
    )

    community_profile.seller_status = "ACTIVE"
    community_profile.subscription_plan = "SELLER"

    if not community_profile.joined_at:
        community_profile.joined_at = timezone.now()

    community_profile.save(
        update_fields=[
            "seller_status",
            "subscription_plan",
            "joined_at",
            "updated_at"
        ]
    )

    logger.info(
        "[PAYMENT SUCCESS] user=%s plan=%s payment_id=%s",
        payment.user_id,
        payment.subscription_plan_id,
        payment.id,
    )

def handle_failed_payment(payment: Payment):
    if payment.status == Payment.FAILED:
        return

    payment.status = Payment.FAILED
    payment.save(update_fields=["status"])

    logger.warning(
        "[PAYMENT FAILED] payment_id=%s",
        payment.id
    )

from celery import shared_task
from django.utils import timezone
from community.models import ComMarket, CommunityProfile

@shared_task
def expire_market_listings():
    """
    Expire all ACTIVE listings where available_until < today.
    """
    today = timezone.now().date()
    expired_count = ComMarket.objects.filter(
        status="ACTIVE",
        available_until__lt=today
    ).update(status="EXPIRED")
    return f"{expired_count} listings expired."


@shared_task
def unban_sellers():
    """
    Unban sellers whose banned_until has passed.
    """
    today = timezone.now().date()
    unbanned_count = CommunityProfile.objects.filter(
        seller_status="SUSPENDED",
        banned_until__lt=today
    ).update(
        seller_status="ACTIVE",
        banned_until=None
    )
    return f"{unbanned_count} sellers unbanned."


@shared_task
def daily_status_update():
    """
    Combined task to run daily updates:
    - Expire market listings
    - Unban sellers
    """
    listings_result = expire_market_listings()
    sellers_result = unban_sellers()
    return f"{listings_result} | {sellers_result}"

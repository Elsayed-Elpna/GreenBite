# services/review_service.py
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from community.models import MarketReview, MarketOrder, ComMarket, CommunityProfile

class ReviewService:

    @staticmethod
    def create_review(user, market_id, rating, comment=None):
        market = get_object_or_404(ComMarket, id=market_id)

        if market.seller == user:
            raise PermissionError("You cannot review your own listing.")

        if not MarketOrder.objects.filter(
            market=market,
            buyer=user,
            status='DELIVERED'
        ).exists():
            raise PermissionError("You can only review listings you have received.")

        if MarketReview.objects.filter(
            market=market,
            reviewer=user
        ).exists():
            raise ValueError("You have already reviewed this listing.")

        review = MarketReview.objects.create(
            market=market,
            reviewer=user,
            rating=rating,
            comment=comment
        )

        ReviewService.update_seller_trust_score(market.seller)
        return review

    @staticmethod
    def update_seller_trust_score(seller):
        profile = CommunityProfile.objects.filter(user=seller).first()
        if not profile:
            return

        avg_rating = MarketReview.objects.filter(
            market__seller=seller
        ).aggregate(avg=Avg('rating'))['avg'] or 0

        profile.trust_score = round(avg_rating, 2)
        profile.save(update_fields=['trust_score'])

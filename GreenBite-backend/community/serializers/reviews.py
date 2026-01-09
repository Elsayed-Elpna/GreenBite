# serializers/reviews.py
from rest_framework import serializers
from community.models import MarketReview, ComMarket

class MarketReviewCreateSerializer(serializers.Serializer):
    market_id = serializers.IntegerField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True)

class MarketReviewListSerializer(serializers.ModelSerializer):
    reviewer_email = serializers.EmailField(source='reviewer.email', read_only=True)

    class Meta:
        model = MarketReview
        fields = ['rating', 'comment', 'reviewer_email', 'created_at']

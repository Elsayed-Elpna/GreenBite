from rest_framework import serializers
from community.models import CommunityProfile

class CommunityProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityProfile
        fields = [
            'id',
            'is_community_member',
            'joined_at',
            'trust_score',
            'total_sales',
            'total_shares',
            'seller_status',
            'subscription_plan',
            'banned_until',
        ]
        read_only_fields = [
            'joined_at',
            'trust_score',
            'total_sales',
            'total_shares',
            'banned_until',
        ]

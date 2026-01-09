# community/serializers/filters.py
from rest_framework import serializers
from community.models import MarketOrder, CommunityReport, ComMarket


# ------------------------------
# Listings Filters
# ------------------------------

class MarketListingFilterSerializer(serializers.Serializer):
    search = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(
        choices=[choice[0] for choice in ComMarket._meta.get_field('status').choices],
        required=False
    )
    seller = serializers.CharField(required=False)
    min_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        min_value=0
    )
    max_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        min_value=0
    )
    available_before = serializers.DateField(required=False)

    def validate(self, data):
        min_price = data.get("min_price")
        max_price = data.get("max_price")
        if min_price is not None and max_price is not None and min_price > max_price:
            raise serializers.ValidationError("min_price cannot be greater than max_price.")
        return data


# ------------------------------
# Market Order Filters
# ------------------------------

class BuyerOrderFilterSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[choice[0] for choice in MarketOrder.STATUS_CHOICES],
        required=False
    )


class SellerOrderFilterSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[choice[0] for choice in MarketOrder.STATUS_CHOICES],
        required=False
    )


# ------------------------------
# Community Report Filters
# ------------------------------

class ReportFilterSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[choice[0] for choice in CommunityReport.Status.choices],
        required=False
    )
    target_type = serializers.ChoiceField(
        choices=[choice[0] for choice in CommunityReport.TargetType.choices],
        required=False
    )

from rest_framework import serializers
from .models import SubscriptionPlan

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    duration_label = serializers.CharField(
        source="get_duration_display",
        read_only=True
    )

    class Meta:
        model = SubscriptionPlan
        fields = (
            "id",
            "name",
            "duration",
            "duration_label",
            "price",
        )
        read_only_fields = ("id",
                            "name",
                            "duration",
                            "duration_label",
                            "price",)
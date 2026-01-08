from rest_framework import serializers
from community.models import CommunityReport, ComMarket
from accounts.models import User


class CommunityReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityReport
        fields = [
            'id',
            'target_type',
            'target_id',
            'reason',
            'details',
        ]
        read_only_fields = ['id']

class ReportTargetSnapshotMixin:

    def get_target_snapshot(self, obj):
        if obj.target_type == "MARKET":
            market = (
                ComMarket.objects
                .select_related("seller")
                .filter(id=obj.target_id)
                .first()
            )
            if not market:
                return None

            return {
                "type": "MARKET",
                "title": market.title,
                "seller": {
                    "id": market.seller.id,
                    "email": market.seller.email,
                }
            }

        if obj.target_type == "USER":
            user = User.objects.filter(id=obj.target_id).first()
            if not user:
                return None

            return {
                "type": "USER",
                "email": user.email,
            }

        return None


class ReportListSerializer(
    ReportTargetSnapshotMixin,
    serializers.ModelSerializer
):
    reporter = serializers.SerializerMethodField()
    target_snapshot = serializers.SerializerMethodField()

    class Meta:
        model = CommunityReport
        fields = [
            "id",
            "status",
            "target_type",
            "target_id",
            "reason",
            "reporter",
            "target_snapshot",
            "created_at",
        ]

    def get_reporter(self, obj):
        return {
            "id": obj.reporter.id,
            "email": obj.reporter.email,
        }


class ReportDetailSerializer(
    ReportTargetSnapshotMixin,
    serializers.ModelSerializer
):
    reporter = serializers.SerializerMethodField()
    reviewed_by = serializers.SerializerMethodField()
    target_snapshot = serializers.SerializerMethodField()

    class Meta:
        model = CommunityReport
        fields = [
            "id",
            "status",
            "target_type",
            "target_id",
            "reason",
            "details",
            "reporter",
            "target_snapshot",
            "created_at",
            "reviewed_by",
            "reviewed_at",
        ]

    def get_reporter(self, obj):
        return {
            "id": obj.reporter.id,
            "email": obj.reporter.email,
        }

    def get_reviewed_by(self, obj):
        if not obj.reviewed_by:
            return None

        return {
            "id": obj.reviewed_by.id,
            "email": obj.reviewed_by.email,
        }

class ReportModerateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["APPROVED", "DISMISSED"])
    admin_action = serializers.ChoiceField(
        choices=[
            "NONE",
            "SUSPEND_SELLER",
            "BAN_USER",
            "DELETE_MARKET",
        ],
        required=False,
        allow_null=True,
    )
    admin_notes = serializers.CharField(required=False, allow_blank=True)
    ban_until = serializers.DateField(required=False, allow_null=True)

    def validate(self, data):
        report = self.context["report"]

        if report.status != "PENDING":
            raise serializers.ValidationError("Report already reviewed.")

        if data["status"] == "APPROVED" and not data.get("admin_action"):
            raise serializers.ValidationError(
                "Admin action is required when approving."
            )
        
        if data.get("admin_action") == "BAN_USER" and not data.get("ban_until"):
            raise serializers.ValidationError(
                "ban_until is required when banning a user."
            )

        return data
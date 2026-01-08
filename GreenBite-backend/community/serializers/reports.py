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

    def validate_target_type(self, value):
        if value not in ['MARKET', 'USER']:
            raise serializers.ValidationError(
                "target_type must be either 'MARKET' or 'USER'."
            )
        return value

    def validate(self, attrs):
        request = self.context['request']
        reporter = request.user

        target_type = attrs['target_type']
        target_id = attrs['target_id']

        # Target existence check
        if target_type == 'MARKET':
            if not ComMarket.objects.filter(id=target_id).exists():
                raise serializers.ValidationError(
                    "The marketplace listing you are reporting does not exist."
                )

        elif target_type == 'USER':
            if not User.objects.filter(id=target_id).exists():
                raise serializers.ValidationError(
                    "The user you are reporting does not exist."
                )

            # Prevent self-report
            if target_id == reporter.id:
                raise serializers.ValidationError(
                    "You cannot report yourself."
                )

        # Prevent duplicate reports
        if CommunityReport.objects.filter(
            reporter=reporter,
            target_type=target_type,
            target_id=target_id
        ).exists():
            raise serializers.ValidationError(
                "You have already reported this target."
            )

        return attrs

    def create(self, validated_data):
        reporter = self.context['request'].user
        return CommunityReport.objects.create(
            reporter=reporter,
            **validated_data
        )


class ReportListSerializer(serializers.ModelSerializer):
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
        return {"id": obj.reporter.id, "email": obj.reporter.email}

    def get_target_snapshot(self, obj):
        if obj.target_type == "MARKET":
            market = ComMarket.objects.select_related('seller').filter(id=obj.target_id).first()
            if not market:
                return None
            return {
                "type": "MARKET", 
                "title": market.title, 
                "seller": {
                    "id": market.seller.id,
                    "email": market.seller.email
                }
            }

        if obj.target_type == "USER":
            user = User.objects.filter(id=obj.target_id).first()
            if not user:
                return None
            return {
                "type": "USER", 
                "email": user.email
            }

        return None


class ReportDetailSerializer(serializers.ModelSerializer):
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
        if obj.reviewed_by:
            return {
                "id": obj.reviewed_by.id,
                "email": obj.reviewed_by.email,
            }
        return None

    def get_target_snapshot(self, obj):
        if obj.target_type == "MARKET":
            market = ComMarket.objects.select_related('seller').filter(id=obj.target_id).first()
            if not market:
                return None
            return {
                "type": "MARKET",
                "title": market.title,
                "seller": {
                    "id": market.seller.id,
                    "email": market.seller.email
                }
            }

        if obj.target_type == "USER":
            user = User.objects.filter(id=obj.target_id).first()
            if not user:
                return None
            return {
                "type": "USER",
                "email": user.email
            }

        return None


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
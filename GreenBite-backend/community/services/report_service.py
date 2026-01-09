from django.utils import timezone
from django.db import transaction
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound
from community.models import CommunityReport, ComMarket, MarketOrder
from accounts.models import User


class ReportService:

    VALID_TARGETS = {"MARKET", "USER"}

    @staticmethod
    def create_report(*, reporter, target_type, target_id, reason, details=None):

        if target_type not in ReportService.VALID_TARGETS:
            raise ValidationError("Invalid target type.")

        # ───── TARGET VALIDATION ─────
        if target_type == "MARKET":
            if not ComMarket.objects.filter(id=target_id).exists():
                raise NotFound("The marketplace listing you are reporting does not exist.")

        elif target_type == "USER":
            if not User.objects.filter(id=target_id).exists():
                raise NotFound("The user you are reporting does not exist.")

            if target_id == reporter.id:
                raise PermissionDenied("You cannot report yourself.")

        # ───── DUPLICATE REPORT ─────
        if CommunityReport.objects.filter(
            reporter=reporter,
            target_type=target_type,
            target_id=target_id
        ).exists():
            raise ValidationError("You have already reported this target.")

        return CommunityReport.objects.create(
            reporter=reporter,
            target_type=target_type,
            target_id=target_id,
            reason=reason,
            details=details,
        )

    @staticmethod
    def cancel_pending_orders(*, market=None, seller=None):
        qs = MarketOrder.objects.filter(status='PENDING')

        if market:
            qs = qs.filter(market=market)

        if seller:
            qs = qs.filter(seller=seller)

        qs.update(status='CANCELLED')

    @staticmethod
    @transaction.atomic
    def moderate_report(*, report, admin, data):
        """Admin moderates a report and takes action"""
        # Update report status
        report.status = data["status"]
        report.reviewed_by = admin
        report.reviewed_at = timezone.now()
        report.admin_notes = data.get("admin_notes", "")
        report.admin_action = data.get("admin_action")

        # If approved, take action
        if report.status == "APPROVED":
            action = data.get("admin_action")
            
            # Handle MARKET target actions
            if report.target_type == "MARKET":
                market = ComMarket.objects.filter(id=report.target_id).first()
                if not market:
                    raise NotFound("Market not found")
                
                # Get the seller/owner of the market
                seller = market.seller
                if not seller:
                    raise NotFound("Market seller not found")
                
                profile = seller.community_profile
                
                # Apply action based on admin choice
                if action == "DELETE_MARKET":
                    # Only delete the market listing
                    market.status = "DELETED"
                    market.save(update_fields=['status'])
                    ReportService.cancel_pending_orders(market=market)
                
                elif action == "SUSPEND_SELLER":
                    # Suspend the seller AND delete the market
                    profile.seller_status = "SUSPENDED"
                    profile.save(update_fields=['seller_status', 'updated_at'])
                    
                    # Also delete the reported market
                    market.status = "DELETED"
                    market.save(update_fields=['status'])
                    ReportService.cancel_pending_orders(market=market)
                
                elif action == "BAN_USER":
                    # Ban the seller with date AND delete the market
                    ban_until = data.get("ban_until")
                    if not ban_until:
                        raise ValidationError("ban_until is required when banning a user")
                    
                    profile.banned_until = ban_until
                    profile.seller_status = "SUSPENDED"
                    profile.save(update_fields=['banned_until', 'seller_status', 'updated_at'])
                    
                    # Also delete the reported market
                    market.status = "DELETED"
                    market.save(update_fields=['status'])
                    ReportService.cancel_pending_orders(market=market)

            # Handle USER target actions
            elif report.target_type == "USER":
                user = User.objects.filter(id=report.target_id).first()
                if not user:
                    raise NotFound("User not found")
                
                profile = user.community_profile
                
                if action == "SUSPEND_SELLER":
                    profile.seller_status = "SUSPENDED"
                    profile.save(update_fields=['seller_status', 'updated_at'])

                    ReportService.cancel_pending_orders(market=market)
                
                elif action == "BAN_USER":
                    ban_until = data.get("ban_until")
                    if not ban_until:
                        raise ValidationError("ban_until is required when banning a user")
                    
                    profile.banned_until = ban_until
                    profile.seller_status = "SUSPENDED"
                    profile.save(update_fields=['banned_until', 'seller_status', 'updated_at'])
                    ReportService.cancel_pending_orders(market=market)

        report.save()
        return report
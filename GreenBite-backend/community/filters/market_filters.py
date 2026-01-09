from django.utils import timezone
from django.db.models import Q
from community.models import ComMarket

class MarketListingFilter:
    def __init__(self, queryset, params, user):
        self.queryset = queryset
        self.params = params
        self.user = user

    def filter(self):
        qs = self.queryset

        search = self.params.get("search")
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )

        status = self.params.get("status")
        if status:
            qs = qs.filter(status=status)
        else:
            qs = qs.filter(status="ACTIVE")

        seller = self.params.get("seller")
        if seller == "me":
            qs = qs.filter(seller=self.user)
        elif seller:
            qs = qs.filter(seller__id=seller)

        min_price = self.params.get("min_price")
        if min_price is not None:
            qs = qs.filter(price__gte=min_price)

        max_price = self.params.get("max_price")
        if max_price is not None:
            qs = qs.filter(price__lte=max_price)

        available_before = self.params.get("available_before")
        if available_before:
            qs = qs.filter(available_until__lte=available_before)

        return qs.order_by("-created_at")


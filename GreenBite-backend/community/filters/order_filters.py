import django_filters
from community.models import MarketOrder

class BuyerOrderFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")

    class Meta:
        model = MarketOrder
        fields = ["status"]


class SellerOrderFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="iexact")

    class Meta:
        model = MarketOrder
        fields = ["status"]

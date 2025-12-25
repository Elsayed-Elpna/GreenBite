import django_filters
from django.utils import timezone
from .models import FoodLogSys
from datetime import  date

class FoodLogFilter(django_filters.FilterSet):
  name = django_filters.CharFilter(field_name='name' , lookup_expr='icontains')
  category = django_filters.CharFilter(field_name='category')
  storage_type= django_filters.CharFilter(field_name='storage_type')

  expiry_before = django_filters.DateFilter(field_name='expiry_date', lookup_expr='lte'  )
  expiry_after = django_filters.DateFilter(field_name='expiry_date', lookup_expr='gte'  )

  is_expired = django_filters.BooleanFilter(method ="is_expired_filter")

  def is_expired_filter(self, queryset, name, value):
    today = date.today()
    if value:
      return queryset.filter(expiry_date__lt=today)
    else:
      return queryset.filter(expiry_date__gte=today)

  class Meta:
    model = FoodLogSys
    fields = ['name','category', 'storage_type', 'expiry_before', 'expiry_after', 'is_expired']
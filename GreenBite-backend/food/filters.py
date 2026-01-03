import django_filters
from django.utils import timezone
from .models import FoodLogSys , WasteLog, Meal, MealTime
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



class WasteLogFilter(django_filters.FilterSet):
  name = django_filters.CharFilter(field_name='name' , lookup_expr='icontains')
  
  ordering = django_filters.OrderingFilter(
        fields=(
            ("estimated_amount", "estimated_amount"),
            ("created_at", "created_at"),
            ("name", "name"),
        )
    )

  class Meta:
    model = WasteLog
    fields = ['name']


class MealFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method="filter_search")

    mealTime = django_filters.ChoiceFilter(
        field_name="mealTime",
        choices=MealTime.choices
    )

    has_leftovers = django_filters.BooleanFilter(
        field_name="has_leftovers"
    )

    calories_min = django_filters.NumberFilter(
        field_name="calories",
        lookup_expr="gte"
    )
    calories_max = django_filters.NumberFilter(
        field_name="calories",
        lookup_expr="lte"
    )

    ordering = django_filters.OrderingFilter(
        fields=(
            ("created_at", "created_at"),
            ("calories", "calories"),
        )
    )

    def filter_search(self, queryset, name, value):
        return queryset.filter(
            Q(recipe__icontains=value) |
            Q(cuisine__icontains=value)
        )

    class Meta:
        model = Meal
        fields = [
            "mealTime",
            "has_leftovers",
            "calories_min",
            "calories_max",
            "search",
        ]


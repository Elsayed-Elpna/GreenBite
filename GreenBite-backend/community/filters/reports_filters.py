import django_filters
from community.models import CommunityReport


class ReportFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(
        choices=CommunityReport.Status.choices,
        field_name='status',
    )
    target_type = django_filters.ChoiceFilter(
        choices=CommunityReport.TargetType.choices,
        field_name='target_type',
    )

    class Meta:
        model = CommunityReport
        fields = ['status', 'target_type']
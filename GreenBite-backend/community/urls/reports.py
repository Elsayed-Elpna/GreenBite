from django.urls import path
from community.views.reports import CommunityReportView, CommunityReportDetailView

urlpatterns = [
    path('', CommunityReportView.as_view(), name='community-reports'),
    path('<int:report_id>/', CommunityReportDetailView.as_view(), name='community-report-detail'),
]
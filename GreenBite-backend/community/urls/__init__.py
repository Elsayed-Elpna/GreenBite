from django.urls import path, include

urlpatterns = [
    path("market/", include("community.urls.market")),
    path("reports/", include("community.urls.reports")),
    path("profile/", include("community.urls.community_profile")),
]

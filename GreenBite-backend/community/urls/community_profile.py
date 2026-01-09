from django.urls import path
from community.views.community_profile import CommunityProfileUpdateView

urlpatterns = [
    path("join/", CommunityProfileUpdateView.as_view(), name="community-profile-update"),
]

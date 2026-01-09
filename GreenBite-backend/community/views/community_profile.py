# views/community_profile.py
from rest_framework import generics, permissions
from community.models import CommunityProfile
from community.serializers import CommunityProfileSerializer

class CommunityProfileUpdateView(generics.UpdateAPIView):
    """
    API to update a user's community profile.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CommunityProfileSerializer

    def get_object(self):
        # Always update the profile of the current user
        return CommunityProfile.objects.get(user=self.request.user)

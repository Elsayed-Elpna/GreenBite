from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.serializers.profile import ProfileSerializer

@api_view(["GET","PATCH"])
@permission_classes([IsAuthenticated])
def profile_view(request):
    profile = request.user.profile
    
    if request.method == "GET":
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    
    if request.method == "PATCH":
        serializer = ProfileSerializer(profile, data=request.data ,  partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
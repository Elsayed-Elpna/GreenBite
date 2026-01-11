from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from accounts.serializers.profile import ProfileSerializer

@api_view(["GET","PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def profile_view(request):
    profile = request.user.profile
    
    if request.method == "GET":
        serializer = ProfileSerializer(profile ,context={"request": request})
        return Response(serializer.data)
    
    serializer = ProfileSerializer(
        profile,
        data=request.data,
        partial=True,
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
from django.shortcuts import render
from rest_framework.permissions import AllowAny , IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import SubscriptionPlan , Subscription
from .serializers import SubscriptionPlanSerializer
# Create your views here.

@api_view(["GET"])
@permission_classes([AllowAny])
def subscription_plan_list(request):
  plans = SubscriptionPlan.objects.filter(is_active=True).order_by('price')
  serializer = SubscriptionPlanSerializer(plans, many=True)
  return Response(serializer.data, status=status.HTTP_200_OK)
  
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_subscription(request):
    sub, _ = Subscription.objects.get_or_create(user=request.user)
    plan = sub.plan
    return Response(
        {
            "is_active": sub.is_active,
            "start_date": sub.start_date,
            "end_date": sub.end_date,
            "plan": SubscriptionPlanSerializer(plan).data if plan else None,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def subscribe(request):
    plan_id = request.data.get("plan_id")
    if not plan_id:
        return Response({"detail": "plan_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
    except SubscriptionPlan.DoesNotExist:
        return Response({"detail": "Invalid plan_id"}, status=status.HTTP_404_NOT_FOUND)

    sub, _ = Subscription.objects.get_or_create(user=request.user)
    sub.activate(plan)

    return Response(
        {
            "detail": "Subscription activated",
            "is_active": sub.is_active,
            "start_date": sub.start_date,
            "end_date": sub.end_date,
            "plan": SubscriptionPlanSerializer(plan).data,
        },
        status=status.HTTP_200_OK,
    )
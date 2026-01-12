from rest_framework.test import APITestCase
from rest_framework import status

from subscriptions.models import SubscriptionPlan


class SubscriptionPlanListTests(APITestCase):
    def test_subscription_plan_list_returns_only_active_ordered_by_price(self):
        SubscriptionPlan.objects.create(name="Inactive", price=50, is_active=False)
        p1 = SubscriptionPlan.objects.create(name="Basic", price=10, is_active=True)
        p2 = SubscriptionPlan.objects.create(name="Pro", price=20, is_active=True)

        resp = self.client.get("/api/subscription-plans/")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.json(), list)
        self.assertEqual([p["id"] for p in resp.json()], [p1.id, p2.id])

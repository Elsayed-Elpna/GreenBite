from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from food.models import FoodLogSys
from meal_plans.models import MealPlan, MealPlanDay, MealPlanMeal, MealPlanFoodUsage


API_PREFIX = "/api/meal_plans/"


class MealPlanAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email="mealplan_user@test.com", password="123456"
        )
        self.client.force_authenticate(self.user)

        # inventory needed (services require available logs exist)
        self.food1 = FoodLogSys.objects.create(
            user=self.user,
            name="Egg",
            name_normalized="egg",
            quantity=Decimal("10"),
            unit="pcs",
            expiry_date=timezone.now().date() + timezone.timedelta(days=30),
            is_consumed=False,
        )
        self.food2 = FoodLogSys.objects.create(
            user=self.user,
            name="Rice",
            name_normalized="rice",
            quantity=Decimal("1000"),
            unit="g",
            expiry_date=timezone.now().date() + timezone.timedelta(days=30),
            is_consumed=False,
        )

    def test_generate_meal_plan_sync_success(self):
        resp = self.client.post(
            f"{API_PREFIX}generate/",
            {"days": 2, "meals_per_day": 2, "async": False, "use_ai_fallback": False},
            format="json",
        )
        self.assertIn(resp.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED), resp.data)

        # response might return meal_plan_id
        meal_plan_id = resp.data.get("meal_plan_id")
        self.assertIsNotNone(meal_plan_id)

        plan = MealPlan.objects.get(id=meal_plan_id)
        self.assertEqual(plan.user, self.user)
        self.assertEqual(plan.days, 2)
        self.assertFalse(plan.is_confirmed)

        # days should exist
        self.assertTrue(MealPlanDay.objects.filter(meal_plan=plan).exists())

    def test_generate_meal_plan_requires_inventory(self):
        # Clear inventory
        FoodLogSys.objects.filter(user=self.user).delete()

        resp = self.client.post(
            f"{API_PREFIX}generate/",
            {"days": 1, "meals_per_day": 1, "async": False, "use_ai_fallback": False},
            format="json",
        )
        # your view catches ValueError and returns 400
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", resp.data)

    def test_list_meal_plans(self):
        MealPlan.objects.create(user=self.user, start_date=timezone.now().date(), days=3)

        resp = self.client.get(f"{API_PREFIX}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, list)

    def test_get_meal_plan_detail(self):
        plan = MealPlan.objects.create(user=self.user, start_date=timezone.now().date(), days=1)
        day = MealPlanDay.objects.create(meal_plan=plan, date=timezone.now().date())
        MealPlanMeal.objects.create(meal_plan_day=day, meal_time="breakfast", meal=None)

        resp = self.client.get(f"{API_PREFIX}{plan.id}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["id"], plan.id)
        self.assertIn("days_plan", resp.data)

    def test_skip_meal(self):
        plan = MealPlan.objects.create(user=self.user, start_date=timezone.now().date(), days=1)
        day = MealPlanDay.objects.create(meal_plan=plan, date=timezone.now().date())
        pm = MealPlanMeal.objects.create(meal_plan_day=day, meal_time="breakfast", meal=None, is_skipped=False)

        resp = self.client.post(f"{API_PREFIX}meals/{pm.id}/skip/", {}, format="json")
        self.assertIn(resp.status_code, (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT), resp.data if hasattr(resp, "data") else None)

        pm.refresh_from_db()
        self.assertTrue(pm.is_skipped)

    def test_confirm_day_consumes_planned_usages(self):
        """
        Confirming a day should reduce FoodLogSys.quantity based on planned usages
        (MealPlanFoodUsage.planned_quantity).
        """
        plan = MealPlan.objects.create(user=self.user, start_date=timezone.now().date(), days=1)
        day = MealPlanDay.objects.create(meal_plan=plan, date=timezone.now().date(), is_confirmed=False)

        pm = MealPlanMeal.objects.create(meal_plan_day=day, meal_time="breakfast", meal=None, is_skipped=False)

        # Planned usage consumes 2 eggs (pcs) and 100g rice
        MealPlanFoodUsage.objects.create(meal_plan_meal=pm, food_log=self.food1, planned_quantity=Decimal("2"))
        MealPlanFoodUsage.objects.create(meal_plan_meal=pm, food_log=self.food2, planned_quantity=Decimal("100"))

        before_eggs = self.food1.quantity
        before_rice = self.food2.quantity

        resp = self.client.post(f"{API_PREFIX}days/{day.id}/confirm/", {}, format="json")
        self.assertIn(resp.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED), resp.data)

        # day confirmed
        day.refresh_from_db()
        self.assertTrue(day.is_confirmed)
        self.assertIsNotNone(day.confirmed_at)

        # inventory reduced
        self.food1.refresh_from_db()
        self.food2.refresh_from_db()
        self.assertEqual(self.food1.quantity, before_eggs - Decimal("2"))
        self.assertEqual(self.food2.quantity, before_rice - Decimal("100"))

    def test_confirm_day_requires_auth(self):
        self.client.force_authenticate(user=None)
        resp = self.client.post(f"{API_PREFIX}days/1/confirm/", {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class MealPlanUnauthorizedTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_list_requires_auth(self):
        resp = self.client.get(f"{API_PREFIX}")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_generate_requires_auth(self):
        resp = self.client.post(f"{API_PREFIX}generate/", {"days": 1, "meals_per_day": 1}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

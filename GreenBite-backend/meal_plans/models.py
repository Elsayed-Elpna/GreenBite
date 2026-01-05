from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from food.models import FoodLogSys, MealTime, Meal
from django.core.validators import MinValueValidator
from decimal import Decimal

User = get_user_model()

class MealPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="meal_plans")
    start_date = models.DateField(default=timezone.now)
    days = models.PositiveIntegerField(default=3)
    is_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __repr__(self):
        return f"MealPlan({self.user.username}) {self.start_date} ({self.days} days)"

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Meal Plan"
        verbose_name_plural = "Meal Plans"


class MealPlanDay(models.Model):
    meal_plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, related_name="days_plan")
    date = models.DateField()
    is_confirmed = models.BooleanField(default=False)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    @property
    def planned_food_usages(self):
        if not hasattr(self, "_cached_usages"):
            self._cached_usages = list(
                MealPlanFoodUsage.objects
                .select_related("food_log", "meal_plan_meal__meal")
                .filter(meal_plan_meal__meal_plan_day=self)
            )
        return self._cached_usages

    def __str__(self):
        return f"{self.meal_plan.user.username} - {self.date}"

    class Meta:
        unique_together = ("meal_plan", "date")
        ordering = ["date"]
        indexes = [models.Index(fields=["date", "is_confirmed"])]


class MealPlanMeal(models.Model):
    meal_plan_day = models.ForeignKey(MealPlanDay, on_delete=models.CASCADE, related_name="meals")
    meal_time = models.CharField(max_length=20, choices=MealTime.choices)
    meal = models.ForeignKey(Meal, on_delete=models.SET_NULL, null=True, blank=True, related_name="meal_plan_meals")
    is_skipped = models.BooleanField(default=False)
    
    is_replaced = models.BooleanField(default=False)
    replaced_at = models.DateTimeField(null=True, blank=True)
    original_meal = models.ForeignKey(
        Meal, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="replaced_from",
        help_text="Original meal before replacement"
    )
    draft_title = models.CharField(max_length=255, blank=True, default="")
    draft_ingredients = models.JSONField(blank=True, default=list)
    draft_steps = models.JSONField(blank=True, default=list)
    draft_cuisine = models.CharField(max_length=64, blank=True, default="")
    draft_calories = models.IntegerField(null=True, blank=True)
    draft_serving = models.IntegerField(null=True, blank=True)
    draft_photo = models.TextField(blank=True, default="")
    draft_source_mealdb_id = models.CharField(max_length=50, blank=True, default="")


    def __str__(self):
        return f"{self.meal_plan_day.date} - {self.meal_time}"

    class Meta:
        unique_together = ("meal_plan_day", "meal_time")
        ordering = ["meal_plan_day__date", "meal_time"]
        verbose_name = "Meal Plan Meal"
        verbose_name_plural = "Meal Plan Meals"


class MealPlanFoodUsage(models.Model):
    meal_plan_meal = models.ForeignKey(MealPlanMeal, on_delete=models.CASCADE, related_name="planned_usages")
    food_log = models.ForeignKey(FoodLogSys, on_delete=models.CASCADE, related_name="meal_plan_usages")
    planned_quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))]
    )

    def __str__(self):
        return f"{self.meal_plan_meal} uses {self.food_log.name} ({self.planned_quantity})"

    class Meta:
        verbose_name = "Meal Plan Food Usage"
        verbose_name_plural = "Meal Plan Food Usages"

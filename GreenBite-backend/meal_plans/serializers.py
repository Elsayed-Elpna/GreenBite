from rest_framework import serializers

from meal_plans.models import MealPlan, MealPlanDay, MealPlanMeal, MealPlanFoodUsage


class MealPlanFoodUsageNestedSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source="food_log.name", read_only=True)

    class Meta:
        model = MealPlanFoodUsage
        fields = ["id", "food_log", "food_name", "planned_quantity"]


class MealPlanMealNestedSerializer(serializers.ModelSerializer):
    # ✅ Use method fields so draft is used when meal is null
    title = serializers.SerializerMethodField()
    recipe = serializers.SerializerMethodField()          # keep for backward-compat if UI uses "recipe"
    cuisine = serializers.SerializerMethodField()
    calories = serializers.SerializerMethodField()
    serving = serializers.SerializerMethodField()
    ingredients = serializers.SerializerMethodField()
    steps = serializers.SerializerMethodField()
    instructions = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()       # some UI uses thumbnail naming
    source_mealdb_id = serializers.SerializerMethodField()

    planned_usages = MealPlanFoodUsageNestedSerializer(many=True, read_only=True)
    is_replaced = serializers.BooleanField(read_only=True)
    replaced_at = serializers.DateTimeField(read_only=True)
    original_recipe = serializers.SerializerMethodField()

    class Meta:
        model = MealPlanMeal
        fields = [
            "id",
            "meal_time",
            "is_skipped",
            "meal",  # may be null before confirm

            # ✅ full details for UI (works pre-confirmation)
            "title",
            "recipe",
            "cuisine",
            "calories",
            "serving",
            "ingredients",
            "steps",
            "instructions",
            "photo",
            "thumbnail",
            "source_mealdb_id",
            "draft_source_mealdb_id",
            "planned_usages",
            "is_replaced",
            "replaced_at",
            "original_recipe",
        ]

    # ---------- helpers ----------
    def _meal(self, obj: MealPlanMeal):
        return getattr(obj, "meal", None)

    def get_title(self, obj: MealPlanMeal):
        meal = self._meal(obj)
        return getattr(meal, "recipe", None) or getattr(obj, "draft_title", None) or None

    def get_recipe(self, obj: MealPlanMeal):
        # many parts of your UI use recipe/title interchangeably
        return self.get_title(obj)

    def get_cuisine(self, obj: MealPlanMeal):
        meal = self._meal(obj)
        return getattr(meal, "cuisine", None) or (getattr(obj, "draft_cuisine", None) or None)

    def get_calories(self, obj: MealPlanMeal):
        meal = self._meal(obj)
        val = getattr(meal, "calories", None)
        return val if val is not None else getattr(obj, "draft_calories", None)

    def get_serving(self, obj: MealPlanMeal):
        meal = self._meal(obj)
        val = getattr(meal, "serving", None)
        return val if val is not None else getattr(obj, "draft_serving", None)

    def get_ingredients(self, obj: MealPlanMeal):
        meal = self._meal(obj)
        val = getattr(meal, "ingredients", None)
        if val is not None:
            return val
        return getattr(obj, "draft_ingredients", None) or []

    def get_steps(self, obj: MealPlanMeal):
        meal = self._meal(obj)
        val = getattr(meal, "steps", None)
        if val is not None:
            return val
        return getattr(obj, "draft_steps", None) or []

    def get_instructions(self, obj: MealPlanMeal):
        """
        MealDB card uses `instructions` string. If you only store steps as list,
        join them here for display.
        """
        steps = self.get_steps(obj) or []
        if isinstance(steps, list):
            return "\n".join([str(s) for s in steps if s])
        return str(steps) if steps else None

    def _abs_url(self, request, url: str):
        return request.build_absolute_uri(url) if request and url and url.startswith("/") else url

    def get_photo(self, obj: MealPlanMeal):
        meal = self._meal(obj)
        value = getattr(meal, "photo", None) if meal is not None else None

        if not value:
            value = getattr(obj, "draft_photo", None)

        if not value:
            return None

        try:
            url = value.url
        except Exception:
            url = str(value)

        request = self.context.get("request")
        return self._abs_url(request, url)

    def get_thumbnail(self, obj: MealPlanMeal):
        # frontend Recipe card uses thumbnail naming; map it to same as photo
        return self.get_photo(obj)

    def get_source_mealdb_id(self, obj: MealPlanMeal):
        meal= self._meal(obj)
        confirmed = getattr(meal, "source_mealdb_id", None) if meal else None
        if confirmed:
            return confirmed
        return getattr(obj, "draft_source_mealdb_id", None) or None

    def get_original_recipe(self, obj: MealPlanMeal):
        original_meal = getattr(obj, "original_meal", None)
        if original_meal is not None:
            return getattr(original_meal, "recipe", None)
        return None


class MealPlanDayNestedSerializer(serializers.ModelSerializer):
    meals = MealPlanMealNestedSerializer(many=True, read_only=True)

    class Meta:
        model = MealPlanDay
        fields = ["id", "date", "is_confirmed", "confirmed_at", "meals"]


class MealPlanDetailSerializer(serializers.ModelSerializer):
    days_plan = MealPlanDayNestedSerializer(many=True, read_only=True)

    class Meta:
        model = MealPlan
        fields = ["id", "start_date", "days", "is_confirmed", "created_at", "days_plan"]
from rest_framework import serializers
from .models import FoodLogSys, Meal, WasteLog #FoodComRecipe
from datetime import date, timedelta

class FoodLogSysSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodLogSys
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at', 'name_normalized']

    def update(self, instance, validated_data):
        updated_food_log = super().update(instance, validated_data)

        meal = updated_food_log.meal
        if meal and meal.leftovers:
            for leftover in meal.leftovers:
                if leftover.get("food_log_id") == updated_food_log.id:
                    leftover.update({
                        "name": updated_food_log.name,
                        "quantity": float(updated_food_log.quantity),
                        "unit": updated_food_log.unit,
                        "category": updated_food_log.category,
                        "storage_type": updated_food_log.storage_type,
                        "expiry_date": updated_food_log.expiry_date.isoformat(),
                    })
                    meal.save(update_fields=["leftovers", "updated_at"])
                    break

        return updated_food_log

class LeftoverSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100, required=False)
    quantity = serializers.FloatField(default=1)
    unit = serializers.CharField(max_length=20, default='portion')
    category = serializers.CharField(max_length=20, default='other')
    storage_type = serializers.CharField(max_length=20, default='fridge')
    expiry_days = serializers.IntegerField(required=False, default=3)
    expiry_date = serializers.DateField(format="%Y-%m-%d", required=False)

    def validate(self, attrs):
        if not attrs.get("name"):
            attrs["name"] = "Leftover Item"

        today = date.today()

        # expiry_date → expiry_days
        if attrs.get("expiry_date") and not attrs.get("expiry_days"):
            attrs["expiry_days"] = (attrs["expiry_date"] - today).days

        # expiry_days → expiry_date
        if attrs.get("expiry_days") and not attrs.get("expiry_date"):
            attrs["expiry_date"] = today + timedelta(days=attrs["expiry_days"])

        return attrs


class LeftoversSerializer(serializers.Serializer):
    leftovers = LeftoverSerializer(many=True, allow_empty=False)

class MealSerializer(serializers.ModelSerializer):
    leftovers = LeftoverSerializer(many=True)
    class Meta:
        model = Meal
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at', 'consumed_at', 'leftovers_saved']


class MealGenerationSerializer(serializers.Serializer):
    #this is th input user will write 
    ingredients = serializers.ListField(
        child=serializers.CharField(max_length=50),
        min_length=1,
        max_length=10
    )
class SaveAIMealSerializer(serializers.Serializer):
    recipe = serializers.CharField(max_length=2000)
    ingredients = serializers.JSONField()
    steps = serializers.JSONField()
    serving = serializers.IntegerField(required=False, min_value=1, max_value=20)
    calories = serializers.IntegerField(required=False, min_value=0)
    cuisine = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mealTime = serializers.ChoiceField(choices=Meal._meta.get_field("mealTime").choices)
    waste = serializers.JSONField(required=False)

# class FoodComRecipeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FoodComRecipe
#         fields = ["id", "title",
#             "description",
#             "tags",
#             "ingredients",
#             "steps",
#             "n_ingredients",
#             "n_steps",
#             "source",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = ["id", "created_at", "updated_at"]

class WasteLogSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default = serializers.CurrentUserDefault())
    class Meta:
        model = WasteLog
        fields = [
            "id",
            "user",
            "meal",
            "name",
            "why",
            "estimated_amount",
            "unit",
            "disposal",
            "reuse_ideas",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_items(self, value):
        if value in (None, ""):
            return []
        
        if not isinstance(value, list):
            raise serializers.ValidationError("Items must be a list")
        
        for i, item in enumerate(value):
            if not isinstance(item, dict):
                raise serializers.ValidationError(f"items[{i}] must be an object")
            
            name = (item.get("name") or "").strip()
            if not name:
                raise serializers.ValidationError(f"items[{i}].name is required")
            
        return value
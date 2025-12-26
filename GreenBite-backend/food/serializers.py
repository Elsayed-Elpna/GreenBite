from rest_framework import serializers
from .models import FoodLogSys, Meal, WasteLog #FoodComRecipe

class FoodLogSysSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodLogSys
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at', 'name_normalized']

class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at', 'consumed_at', 'leftovers_saved']

class LeftoverSerializer(serializers.Serializer):
    """Serializer for leftover data when saving to food log"""
    name = serializers.CharField(max_length=100, required=False)
    quantity = serializers.FloatField(default=1)
    unit = serializers.CharField(max_length=20, default='portion')
    category = serializers.CharField(max_length=20, default='other')
    storage_type = serializers.CharField(max_length=20, default='fridge')
    expiry_days = serializers.IntegerField(default=3)
    expiry_date = serializers.DateField(required=False)
    def validate(self, attrs):
        name = (attrs.get("name") or "").strip()
        if not name:
            attrs["name"] = "Leftover Item"
        return attrs
class LeftoversSerializer(serializers.Serializer):
    leftovers = LeftoverSerializer(many=True, allow_empty=False)


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
    serving = serializers.IntegerField(required=False, min_value=1, max_value=20)
    calories = serializers.IntegerField(required=False, min_value=0)
    cuisine = serializers.CharField(max_length=100, required=False, allow_blank=True)
    mealTime = serializers.ChoiceField(choices=Meal._meta.get_field("mealTime").choices)

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
            "items",
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
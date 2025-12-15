from rest_framework import serializers
from .models import FoodLogSys, Meal

class FoodLogSysSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodLogSys
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

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

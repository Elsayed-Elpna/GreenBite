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
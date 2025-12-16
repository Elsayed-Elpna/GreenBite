from rest_framework import serializers

class ConsumePreviewSerializer(serializers.Serializer):
    recipe_id = serializers.IntegerField()

class ConsumeItemSerializer(serializers.Serializer):
    foodlog_id = serializers.IntegerField()
    used_quantity = serializers.DecimalField(max_digits=10, decimal_places=2)

class ConsumeConfirmSerializer(serializers.Serializer):
    recipe_id = serializers.IntegerField()
    items = ConsumeItemSerializer(many=True, allow_empty=False)

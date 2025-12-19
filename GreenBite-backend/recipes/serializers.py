from rest_framework import serializers
# from __future__ import annotations

from rest_framework import serializers
from .models import MealDBRecipe, RecipeFavorite, RecipeReview



class MealDBIngredientSerializer(serializers.Serializer):
    name = serializers.CharField()
    measure = serializers.CharField(required=False, allow_blank=True, default="")


class MealDBRecipeCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealDBRecipe
        fields = [
            "id",
            "mealdb_id",
            "title",
            "thumbnail",
            "category",
            "cuisine",
            "tags",
        ]


class MealDBRecipeDetailSerializer(serializers.ModelSerializer):
    ingredients = MealDBIngredientSerializer(many=True)

    class Meta:
        model = MealDBRecipe
        fields = [
            "id",
            "mealdb_id",
            "title",
            "category",
            "cuisine",
            "instructions",
            "thumbnail",
            "tags",
            "youtube",
            "source",
            "ingredients",
            "meal_time",
            "difficulty",
            "created_at",
            "updated_at",
        ]



class RecipeFavoriteSerializer(serializers.ModelSerializer):
    recipe = MealDBRecipeCardSerializer(read_only=True)
    recipe_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = RecipeFavorite
        fields = ["id", "recipe", "recipe_id", "created_at"]


class RecipeReviewSerializer(serializers.ModelSerializer):
    recipe = MealDBRecipeCardSerializer(read_only=True)
    recipe_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = RecipeReview
        fields = ["id", "recipe", "recipe_id", "rating", "comment", "created_at"]



class ConsumePreviewSerializer(serializers.Serializer):
    recipe_id = serializers.IntegerField()

class ConsumeItemSerializer(serializers.Serializer):
    foodlog_id = serializers.IntegerField()
    used_quantity = serializers.DecimalField(max_digits=10, decimal_places=2)

class ConsumeConfirmSerializer(serializers.Serializer):
    recipe_id = serializers.IntegerField()
    items = ConsumeItemSerializer(many=True, allow_empty=False)

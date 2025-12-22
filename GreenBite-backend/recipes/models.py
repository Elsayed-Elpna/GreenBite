from __future__ import annotations

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.fields import ArrayField

from project.utils.normalize import normalize_ingredient_name

User = get_user_model()


class MealTimeChoices(models.TextChoices):
    BREAKFAST = "breakfast", "Breakfast"
    LUNCH = "lunch", "Lunch"
    DINNER = "dinner", "Dinner"
    SNACK = "snack", "Snack"
    BRUNCH = "brunch", "Brunch"


class DifficultyChoices(models.TextChoices):
    EASY = "easy", "Easy"
    MEDIUM = "medium", "Medium"
    HARD = "hard", "Hard"


class MealDBRecipe(models.Model):
    """
    TheMealDB-backed recipe model (your single source of truth).
    `ingredients` is a JSON list of objects, e.g.
      [{"name": "chicken", "measure": "500g"}, ...]
    `ingredients_norm` is a JSON list of normalized strings for matching with FoodLogSys.name_normalized.
    """

    mealdb_id = models.CharField(max_length=20, unique=True, db_index=True)

    title = models.CharField(max_length=255, db_index=True)
    category = models.CharField(max_length=100, blank=True, default="")
    cuisine = models.CharField(max_length=100, blank=True, default="")  # MealDB strArea

    instructions = models.TextField(blank=True, default="")
    thumbnail = models.URLField(blank=True, default="")
    tags = models.JSONField(default=list, blank=True)  # ["Pasta", "Curry", ...]
    youtube = models.URLField(blank=True, default="")
    source = models.URLField(blank=True, default="")

    # Ingredients
    ingredients = models.JSONField(default=list, blank=True)       # list[{"name","measure"}]
    ingredients_norm = ArrayField(
        base_field=models.CharField(max_length=80),
        default=list,
        blank=True,
    )

    #(if you want to let user tag recipe)
    meal_time = models.CharField(
        max_length=20, choices=MealTimeChoices.choices, null=True, blank=True, db_index=True
    )
    difficulty = models.CharField(
        max_length=10, choices=DifficultyChoices.choices, null=True, blank=True, db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    embedding = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["title"]
        indexes = [
            GinIndex(fields=["ingredients_norm"], name="mealdb_ing_norm_gin"),
            GinIndex(fields=["tags"], name="mealdb_tags_gin"),
            models.Index(fields=["cuisine"]),
            models.Index(fields=["category"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} (mealdb:{self.mealdb_id})"

    def rebuild_ingredients_norm(self) -> None:
        norms = []
        for it in (self.ingredients or []):
            raw = (it.get("name") or it.get("ingredient") or "").strip()
            if not raw:
                continue
            n = normalize_ingredient_name(raw)
            if n:
                norms.append(n)

        self.ingredients_norm = sorted(set(norms))

    def save(self, *args, **kwargs):
        self.rebuild_ingredients_norm()
        super().save(*args, **kwargs)


class RecipeFavorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipe_favorites")
    recipe = models.ForeignKey(MealDBRecipe, on_delete=models.CASCADE, related_name="favorites")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "recipe"], name="uniq_favorite_user_recipe")
        ]

    def __str__(self) -> str:
        return f"Favorite(user={self.user_id}, recipe={self.recipe_id})"


class RecipeReview(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recipe_reviews")
    recipe = models.ForeignKey(MealDBRecipe, on_delete=models.CASCADE, related_name="reviews")

    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "recipe"], name="uniq_review_user_recipe")
        ]

    def __str__(self) -> str:
        return f"Review(user={self.user_id}, recipe={self.recipe_id}, rating={self.rating})"

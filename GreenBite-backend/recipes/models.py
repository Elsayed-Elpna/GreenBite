from django.db import models



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


class Ingredient(models.Model):
    name_norm = models.CharField(max_length=120, unique=True, db_index=True)
    display_name = models.CharField(max_length=120, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.display_name or self.name_norm

    class Meta:
        ordering = ["name_norm"]


class Recipe(models.Model):
    foodcom_id = models.PositiveIntegerField(unique=True, db_index=True)

    title = models.CharField(max_length=255, db_index=True)

    minutes = models.PositiveIntegerField(null=True, blank=True)

    # Food.com: tags is a list of strings -> JSON list
    tags = models.JSONField(default=list, blank=True)

    # Food.com: nutrition is a list (calories first) -> keep raw + store calories
    nutrition = models.JSONField(default=list, blank=True)
    calories = models.IntegerField(null=True, blank=True)

    # Food.com: steps is a list of strings -> JSON list
    steps = models.JSONField(default=list, blank=True)

    # Optional enrichment for your app
    cuisine = models.CharField(max_length=100, null=True, blank=True)
    meal_time = models.CharField(
        max_length=20, choices=MealTimeChoices.choices, null=True, blank=True
    )
    difficulty = models.CharField(
        max_length=10, choices=DifficultyChoices.choices, null=True, blank=True
    )
    servings = models.PositiveIntegerField(null=True, blank=True)

    ingredients = models.ManyToManyField(
        Ingredient, through="RecipeIngredient", related_name="recipes"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.title} (foodcom:{self.foodcom_id})"

    class Meta:
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["meal_time"]),
            models.Index(fields=["difficulty"]),
            models.Index(fields=["cuisine"]),
        ]


class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name="recipe_ingredients"
    )
    ingredient = models.ForeignKey(
        Ingredient, on_delete=models.CASCADE, related_name="ingredient_recipes"
    )
    raw_text = models.CharField(max_length=255, blank=True, default="")

    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True, default="")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["recipe", "ingredient"], name="uniq_recipe_ingredient"
            )
        ]
        indexes = [
            models.Index(fields=["recipe"]),
            models.Index(fields=["ingredient"]),
        ]

    def __str__(self) -> str:
        return f"{self.recipe_id} - {self.ingredient_id}"

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from recipes.models import MealDBRecipe, RecipeFavorite
from food.models import FoodLogSys
#model check 
class MealDBRecipeModelTest(TestCase):
    def test_ingredient_tokens_are_built_on_save(self):
        recipe = MealDBRecipe.objects.create(
            mealdb_id="123",
            title="Chicken Rice",
            ingredients=[
                {"name": "Chicken", "measure": "200g"},
                {"name": "Rice", "measure": "1 cup"},
            ]
        )

        self.assertIn("chicken", recipe.ingredient_tokens)
        self.assertIn("rice", recipe.ingredient_tokens)
    def test_string_representation(self):
        recipe = MealDBRecipe.objects.create(
            mealdb_id="abc",
            title="Pasta"
        )
        self.assertEqual(str(recipe), "Pasta (mealdb:abc)")

class RecipeFavoriteModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email="test@test.com", password="pass123"
        )
        self.recipe = MealDBRecipe.objects.create(
            mealdb_id="1",
            title="Pizza"
        )

    def test_user_cannot_favorite_same_recipe_twice(self):
        RecipeFavorite.objects.create(user=self.user, recipe=self.recipe)

        with self.assertRaises(Exception):
            RecipeFavorite.objects.create(user=self.user, recipe=self.recipe)
class RecipeAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email="user@test.com", password="123456"
        )
        self.client.force_authenticate(self.user)

        self.recipe = MealDBRecipe.objects.create(
            mealdb_id="10",
            title="Omelette",
            ingredients=[{"name": "Egg"}]
        )
    def test_add_recipe_to_favorites(self):
        response = self.client.post(
            "/api/recipes/favorites/add/",
            {"recipe_id": self.recipe.id},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(RecipeFavorite.objects.count(), 1)

    def test_add_duplicate_favorite(self):
        RecipeFavorite.objects.create(user=self.user, recipe=self.recipe)

        response = self.client.post(
            "/api/recipes/favorites/add/",
            {"recipe_id": self.recipe.id},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("already", response.data["detail"])

    def test_mealdb_detail(self):
        response = self.client.get(f"/api/mealdb/{self.recipe.mealdb_id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Omelette")
    def test_mealdb_random(self):
        response = self.client.get("/api/mealdb/random/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("title", response.data)
    def test_consume_preview(self):
        FoodLogSys.objects.create(
            user=self.user,
            name="Egg",
            name_normalized="egg",
            quantity=Decimal("2"),
            unit="pcs",
            expiry_date="2099-01-01",
        )

        response = self.client.post(
            "/api/recipes/consume/preview/",
            {"recipe_id": self.recipe.id},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("matches", response.data)
class UnauthorizedAccessTest(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_recommend_requires_auth(self):
        response = self.client.get("/api/recipes/recommend/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


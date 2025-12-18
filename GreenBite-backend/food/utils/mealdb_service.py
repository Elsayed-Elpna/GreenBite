import requests
from food.models import Recipe
from food.utils.mealdb_mapper import mealdb_to_recipe_fields

MEALDB_LOOKUP_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php"

def import_mealdb_recipe_by_id(id_meal: str) -> Recipe:
    r = requests.get(MEALDB_LOOKUP_URL, params={"i": id_meal}, timeout=15)
    r.raise_for_status()

    data = r.json()
    meals = data.get("meals") or []
    if not meals:
        raise ValueError("Meal not found on MealDB")

    meal = meals[0]  

    fields = mealdb_to_recipe_fields(meal)

    recipe, created = Recipe.objects.update_or_create(
        title=fields["title"],   # better: use external_id if you store it
        defaults=fields
    )
    return recipe

import requests
from food.models import Mealdb
from food.utils.mealdb_mapper import mealdb_to_mealdb_fields

LOOKUP_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php"

def import_mealdb_by_id(mealdb_id: str) -> Mealdb:
    r = requests.get(LOOKUP_URL, params={"i": mealdb_id}, timeout=15)
    r.raise_for_status()

    data = r.json()
    meal = (data.get("meals") or [None])[0]
    if not meal:
        raise ValueError("Meal not found on MealDB")

    fields = mealdb_to_mealdb_fields(meal)

    obj, _ = Mealdb.objects.update_or_create(
        mealdb_id=fields["mealdb_id"],
        defaults=fields
    )
    return obj
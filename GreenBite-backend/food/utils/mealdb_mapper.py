# food/utils/mealdb_mapper.py
def _clean(s: str | None) -> str:
    return (s or "").strip()

def extract_ingredients(meal: dict) -> list[dict]:
    items = []
    for i in range(1, 21):
        ing = _clean(meal.get(f"strIngredient{i}"))
        meas = _clean(meal.get(f"strMeasure{i}"))

        # MealDB sometimes returns "" or None; skip empty ingredients
        if not ing:
            continue

        text = f"{meas} {ing}".strip() if meas else ing

        items.append({
            "ingredient": ing,
            "measure": meas,
            "text": text,   # e.g. "1 pound penne rigate"
        })
    return items

def parse_tags(meal: dict) -> list[str]:
    raw = _clean(meal.get("strTags"))
    if not raw:
        return []
    # "Pasta,Curry" -> ["Pasta", "Curry"]
    return [t.strip() for t in raw.split(",") if t.strip()]

def mealdb_to_mealdb_fields(meal: dict) -> dict:
    return {
        "mealdb_id": _clean(meal.get("idMeal")),
        "title": _clean(meal.get("strMeal")),
        "category": _clean(meal.get("strCategory")),
        "cuisine": _clean(meal.get("strArea")),
        "instructions": _clean(meal.get("strInstructions")),
        "thumbnail": _clean(meal.get("strMealThumb")),
        "tags": parse_tags(meal),
        "ingredients": extract_ingredients(meal),
    }

import time
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from django.core.management.base import BaseCommand

from recipes.models import MealDBRecipe


BASE = "https://www.themealdb.com/api/json/v1/1"
LIST_BY_LETTER_URL = f"{BASE}/search.php"
LOOKUP_URL = f"{BASE}/lookup.php"


def build_session() -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "User-Agent": "GreenBite/1.0 (MealDB Importer)",
        "Accept": "application/json",
    })

    retry = Retry(
        total=5,
        backoff_factor=0.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET",),
        raise_on_status=False,
    )
    s.mount("https://", HTTPAdapter(max_retries=retry))
    return s


def fetch_json(session: requests.Session, url: str, params: dict, timeout: int = 20) -> dict:
    r = session.get(url, params=params, timeout=timeout)
    r.raise_for_status()
    return r.json()


def mealdb_to_recipe_fields(meal: dict) -> dict:
    # Build ingredients list from strIngredient1..20 + strMeasure1..20
    ingredients = []
    for i in range(1, 21):
        ing = (meal.get(f"strIngredient{i}") or "").strip()
        meas = (meal.get(f"strMeasure{i}") or "").strip()
        if ing:
            ingredients.append({"name": ing, "measure": meas})

    tags_raw = (meal.get("strTags") or "").strip()
    tags = [t.strip() for t in tags_raw.split(",") if t.strip()] if tags_raw else []

    return {
        "mealdb_id": str(meal.get("idMeal") or "").strip(),
        "title": (meal.get("strMeal") or "").strip(),
        "category": (meal.get("strCategory") or "").strip(),
        "cuisine": (meal.get("strArea") or "").strip(),
        "instructions": (meal.get("strInstructions") or "").strip(),
        "thumbnail": (meal.get("strMealThumb") or "").strip(),
        "youtube": (meal.get("strYoutube") or "").strip(),
        "source": (meal.get("strSource") or "").strip(),
        "tags": tags,
        "ingredients": ingredients,
        # do NOT set ingredients_norm; model.save() rebuilds it automatically
    }


def discover_ids(session: requests.Session, sleep: float = 0.25) -> set[str]:
    ids: set[str] = set()
    for ch in "abcdefghijklmnopqrstuvwxyz":
        data = fetch_json(session, LIST_BY_LETTER_URL, {"f": ch})
        meals = data.get("meals") or []
        for m in meals:
            mid = m.get("idMeal")
            if mid:
                ids.add(str(mid))
        time.sleep(sleep)
    return ids


def fetch_full_meal(session: requests.Session, mealdb_id: str) -> dict | None:
    data = fetch_json(session, LOOKUP_URL, {"i": mealdb_id})
    meals = data.get("meals") or []
    return meals[0] if meals else None


class Command(BaseCommand):
    help = "Import meals from TheMealDB into local DB (MealDBRecipe)."

    def add_arguments(self, parser):
        parser.add_argument("--sleep", type=float, default=0.25, help="Delay between API calls")
        parser.add_argument("--limit", type=int, default=0, help="Limit number of meals (0 = no limit)")

    def handle(self, *args, **options):
        sleep = options["sleep"]
        limit = options["limit"]

        session = build_session()

        ids = discover_ids(session, sleep=sleep)
        self.stdout.write(self.style.SUCCESS(f"Discovered {len(ids)} meal IDs"))

        created_count = 0
        updated_count = 0
        skipped = 0

        ids_sorted = sorted(ids)
        if limit and limit > 0:
            ids_sorted = ids_sorted[:limit]

        for i, mid in enumerate(ids_sorted, start=1):
            try:
                meal = fetch_full_meal(session, mid)
                if not meal:
                    skipped += 1
                    continue

                fields = mealdb_to_recipe_fields(meal)
                if not fields["mealdb_id"] or not fields["title"]:
                    skipped += 1
                    continue

                obj, created = MealDBRecipe.objects.update_or_create(
                    mealdb_id=fields["mealdb_id"],
                    defaults=fields,
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1

                if i % 50 == 0:
                    self.stdout.write(
                        f"[{i}/{len(ids_sorted)}] created={created_count} updated={updated_count} skipped={skipped}"
                    )

                time.sleep(sleep)

            except Exception as e:
                skipped += 1
                self.stderr.write(self.style.WARNING(f"Skip {mid}: {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"Done. created={created_count}, updated={updated_count}, skipped={skipped}"
        ))

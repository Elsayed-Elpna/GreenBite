import time
import requests
from django.core.management.base import BaseCommand
from food.models import Mealdb
from food.utils.mealdb_mapper import mealdb_to_mealdb_fields

LIST_BY_LETTER_URL = "https://www.themealdb.com/api/json/v1/1/search.php"
LOOKUP_URL = "https://www.themealdb.com/api/json/v1/1/lookup.php"


def fetch_json(url: str, params: dict, timeout: int = 20) -> dict:
    r = requests.get(url, params=params, timeout=timeout)
    r.raise_for_status()
    return r.json()


def discover_ids() -> set[str]:
    """
    MealDB doesn't provide an official 'all meals' endpoint.
    A common technique is searching by first letter a-z and collecting ids.
    """
    ids: set[str] = set()
    for ch in "abcdefghijklmnopqrstuvwxyz":
        data = fetch_json(LIST_BY_LETTER_URL, {"f": ch})
        meals = data.get("meals") or []
        for m in meals:
            mid = m.get("idMeal")
            if mid:
                ids.add(mid)
        time.sleep(0.2)  # be polite
    return ids


def fetch_full_meal(mealdb_id: str) -> dict | None:
    data = fetch_json(LOOKUP_URL, {"i": mealdb_id})
    meals = data.get("meals") or []
    return meals[0] if meals else None


class Command(BaseCommand):
    help = "Import ALL meals from TheMealDB into local Postgres (mapped to Mealdb model fields)."

    def handle(self, *args, **options):
        ids = discover_ids()
        self.stdout.write(self.style.SUCCESS(f"Discovered {len(ids)} meal IDs"))

        created_count = 0
        updated_count = 0
        skipped = 0

        for i, mid in enumerate(sorted(ids), start=1):
            try:
                meal = fetch_full_meal(mid)
                if not meal:
                    skipped += 1
                    continue

                fields = mealdb_to_mealdb_fields(meal)

                obj, created = Mealdb.objects.update_or_create(
                    mealdb_id=fields["mealdb_id"],
                    defaults=fields,
                )
                created_count += 1 if created else 0
                updated_count += 0 if created else 1

                if i % 50 == 0:
                    self.stdout.write(f"[{i}/{len(ids)}] created={created_count} updated={updated_count} skipped={skipped}")

                time.sleep(0.2)  # be polite / avoid hammering API

            except Exception as e:
                skipped += 1
                self.stderr.write(self.style.WARNING(f"Skip {mid}: {e}"))

        self.stdout.write(self.style.SUCCESS(
            f"Done. created={created_count}, updated={updated_count}, skipped={skipped}"
        ))
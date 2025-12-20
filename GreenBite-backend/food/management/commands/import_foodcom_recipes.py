import csv
import ast

from django.core.management.base import BaseCommand
from django.db import transaction

from food.models import FoodComRecipe


def parse_list(value):
    if value is None:
        return []
    value = str(value).strip()
    if not value:
        return []
    try:
        return ast.literal_eval(value)  # "['a','b']" -> ['a','b']
    except Exception:
        return []


class Command(BaseCommand):
    help = "Import Food.com RAW_recipes.csv into FoodComRecipe table"

    def add_arguments(self, parser):
        parser.add_argument("csv_path", type=str)
        parser.add_argument("--batch-size", type=int, default=2000)
        parser.add_argument("--limit", type=int, default=None)

    def handle(self, *args, **options):
        csv_path = options["csv_path"]
        batch_size = options["batch_size"]
        limit = options["limit"]

        to_create = []
        created_total = 0
        processed = 0

        self.stdout.write(f"Reading: {csv_path}")

        with open(csv_path, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)

            for row in reader:
                processed += 1
                if limit and processed > limit:
                    break

                # Map CSV -> model (ignore nutrition, contributor_id, submitted, etc.)
                recipe = FoodComRecipe(
                    title=(row.get("name") or "").strip(),
                    description=(row.get("description") or "").strip(),
                    tags=parse_list(row.get("tags")),
                    ingredients=parse_list(row.get("ingredients")),
                    steps=parse_list(row.get("steps")),
                    n_ingredients=int(row["n_ingredients"]) if row.get("n_ingredients") else None,
                    n_steps=int(row["n_steps"]) if row.get("n_steps") else None,
                    source="foodcom",
                )

                to_create.append(recipe)

                if len(to_create) >= batch_size:
                    created_total += self._flush(to_create)
                    to_create.clear()
                    self.stdout.write(f"Processed {processed}, created {created_total}")

        if to_create:
            created_total += self._flush(to_create)

        self.stdout.write(self.style.SUCCESS(
            f"Done. Processed {processed} rows. Created {created_total} new rows."
        ))

    def _flush(self, objs):
        with transaction.atomic():
            created = FoodComRecipe.objects.bulk_create(
                objs,
                batch_size=len(objs),
            )
        return len(created)
import ast
import csv
from typing import Any, Dict, List, Tuple

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from project.utils.normalize import normalize_ingredient_name
from recipes.models import Recipe, Ingredient, RecipeIngredient


def safe_list(value: str) -> List[Any]:
    if not value:
        return []
    try:
        v = ast.literal_eval(value)
        return v if isinstance(v, list) else []
    except Exception:
        return []


def infer_difficulty(n_steps: int) -> str:
    if n_steps <= 5:
        return "easy"
    if n_steps <= 10:
        return "medium"
    return "hard"


def infer_meal_time(tags: List[str]) -> str | None:
    t = {str(x).strip().lower() for x in (tags or [])}
    for k in ["breakfast", "brunch", "lunch", "dinner", "snack"]:
        if k in t:
            return k
    return None


class Command(BaseCommand):
    help = "Import Food.com RAW_recipes.csv into Recipe/Ingredient tables"

    def add_arguments(self, parser):
        parser.add_argument("--path", required=True, help="Path to RAW_recipes.csv (inside container)")
        parser.add_argument("--limit", type=int, default=0, help="Max rows to import (0 = all)")
        parser.add_argument("--batch-size", type=int, default=500, help="Rows per batch")
        parser.add_argument("--log-every", type=int, default=2000, help="Log progress every N processed rows")

    def handle(self, *args, **options):
        path = options["path"]
        limit = options["limit"]
        batch_size = options["batch_size"]
        log_every = options["log_every"]

        try:
            f = open(path, "r", encoding="utf-8")
        except OSError as e:
            raise CommandError(f"Cannot open file: {path}. Error: {e}")

        reader = csv.DictReader(f)
        required_cols = {"id", "name", "ingredients", "steps"}
        if not required_cols.issubset(set(reader.fieldnames or [])):
            raise CommandError(f"CSV missing required columns. Need: {sorted(required_cols)}")

        processed = 0
        imported = 0
        skipped = 0

        batch: List[Dict[str, str]] = []

        def flush(batch_rows: List[Dict[str, str]]):
            nonlocal imported, skipped

            if not batch_rows:
                return

            # 1) identify already-imported recipes by foodcom_id
            foodcom_ids = []
            for r in batch_rows:
                try:
                    foodcom_ids.append(int(r["id"]))
                except Exception:
                    continue

            existing = set(
                Recipe.objects.filter(foodcom_id__in=foodcom_ids).values_list("foodcom_id", flat=True)
            )

            # 2) prepare Recipe objects
            recipes_to_create: List[Recipe] = []
            row_by_id: Dict[int, Dict[str, str]] = {}

            for r in batch_rows:
                try:
                    rid = int(r["id"])
                except Exception:
                    skipped += 1
                    continue

                if rid in existing:
                    skipped += 1
                    continue

                title = (r.get("name") or "").strip()
                steps = safe_list(r.get("steps") or "")
                ingredients_raw = safe_list(r.get("ingredients") or "")

                if not title or not ingredients_raw:
                    skipped += 1
                    continue

                tags = safe_list(r.get("tags") or "")
                nutrition = safe_list(r.get("nutrition") or "")

                calories = None
                if nutrition and len(nutrition) >= 1:
                    try:
                        calories = int(round(float(nutrition[0])))
                    except Exception:
                        calories = None

                minutes = None
                try:
                    minutes = int(r.get("minutes") or 0) or None
                except Exception:
                    minutes = None

                n_steps = 0
                try:
                    n_steps = int(r.get("n_steps") or len(steps) or 0)
                except Exception:
                    n_steps = len(steps) if isinstance(steps, list) else 0

                recipes_to_create.append(
                    Recipe(
                        foodcom_id=rid,
                        title=title,
                        minutes=minutes,
                        tags=tags,
                        nutrition=nutrition,
                        calories=calories,
                        steps=steps,
                        difficulty=infer_difficulty(n_steps),
                        meal_time=infer_meal_time(tags),
                    )
                )
                row_by_id[rid] = r

            if not recipes_to_create:
                return

            # 3) collect normalized ingredients for this batch
            norm_to_display: Dict[str, str] = {}
            all_norms = set()

            parsed_ing: Dict[int, List[Tuple[str, str]]] = {}  # rid -> [(norm, raw)]
            for recipe_obj in recipes_to_create:
                rid = recipe_obj.foodcom_id
                r = row_by_id.get(rid, {})
                ingredients_raw = safe_list(r.get("ingredients") or "")
                pairs: List[Tuple[str, str]] = []
                for raw in ingredients_raw:
                    raw_s = str(raw).strip()
                    norm = normalize_ingredient_name(raw_s)
                    if not norm:
                        continue
                    pairs.append((norm, raw_s))
                    all_norms.add(norm)
                    norm_to_display.setdefault(norm, raw_s)
                parsed_ing[rid] = pairs

            # 4) DB write (atomic per batch)
            with transaction.atomic():
                Recipe.objects.bulk_create(recipes_to_create, ignore_conflicts=True)

                # ensure ingredients exist
                Ingredient.objects.bulk_create(
                    [Ingredient(name_norm=n, display_name=norm_to_display.get(n, "")) for n in all_norms],
                    ignore_conflicts=True,
                )
                ing_map = dict(
                    Ingredient.objects.filter(name_norm__in=all_norms).values_list("name_norm", "id")
                )

                # fetch recipe ids for created recipes
                recipe_map = dict(
                    Recipe.objects.filter(foodcom_id__in=[r.foodcom_id for r in recipes_to_create])
                    .values_list("foodcom_id", "id")
                )

                through: List[RecipeIngredient] = []
                for rid, pairs in parsed_ing.items():
                    recipe_id = recipe_map.get(rid)
                    if not recipe_id:
                        continue
                    for norm, raw_text in pairs:
                        ing_id = ing_map.get(norm)
                        if not ing_id:
                            continue
                        through.append(
                            RecipeIngredient(
                                recipe_id=recipe_id,
                                ingredient_id=ing_id,
                                raw_text=raw_text,
                            )
                        )

                RecipeIngredient.objects.bulk_create(through, ignore_conflicts=True)

            imported += len(recipes_to_create)

        try:
            for row in reader:
                batch.append(row)
                processed += 1

                if limit and processed >= limit:
                    break

                if len(batch) >= batch_size:
                    flush(batch)
                    batch = []

                if processed % log_every == 0:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Processed {processed} rows | Imported {imported} | Skipped {skipped}"
                        )
                    )

            # flush last batch
            flush(batch)

        finally:
            f.close()

        self.stdout.write(
            self.style.SUCCESS(f"DONE Processed {processed} | Imported {imported} | Skipped {skipped}")
        )

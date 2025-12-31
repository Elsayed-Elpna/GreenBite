"""
Backfill normalized ingredient tokens for all recipes in the database.
Run this after importing MealDB recipes or when updating normalization logic.
"""
from django.core.management.base import BaseCommand
from recipes.models import MealDBRecipe
from project.utils.ingredient_tokens import extract_tokens_from_recipe, extract_tokens_with_synonyms


class Command(BaseCommand):
    help = "Backfill normalized ingredient tokens for all MealDB recipes"

    def add_arguments(self, parser):
        parser.add_argument(
            "--with-synonyms",
            action="store_true",
            help="Include synonyms in token extraction (richer matching)",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=0,
            help="Limit number of recipes to process (0 = all)",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=100,
            help="Batch size for bulk updates",
        )

    def handle(self, *args, **options):
        use_synonyms = options["with_synonyms"]
        limit = options["limit"]
        batch_size = options["batch_size"]

        # Get recipes that need token processing
        qs = MealDBRecipe.objects.all()
        
        if limit > 0:
            qs = qs[:limit]

        total = qs.count()
        self.stdout.write(f"Processing {total} recipes...")

        processed = 0
        updated = 0
        to_update = []

        for recipe in qs.iterator(chunk_size=200):
            # Extract tokens based on mode
            if use_synonyms:
                tokens = extract_tokens_with_synonyms(recipe.ingredients or [])
            else:
                tokens = extract_tokens_from_recipe(recipe.ingredients or [])

            # ✅ FIXED: Use the correct field name from your model
            if tokens != recipe.ingredient_tokens:
                recipe.ingredient_tokens = tokens  # Changed from ingredients_norm
                to_update.append(recipe)
                updated += 1

            processed += 1

            # Bulk update in batches
            if len(to_update) >= batch_size:
                MealDBRecipe.objects.bulk_update(to_update, ["ingredient_tokens"], batch_size=batch_size)  # Changed field name
                self.stdout.write(
                    self.style.SUCCESS(f"[{processed}/{total}] Updated {updated} recipes")
                )
                to_update.clear()

        # Final batch
        if to_update:
            MealDBRecipe.objects.bulk_update(to_update, ["ingredient_tokens"], batch_size=batch_size)  # Changed field name

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Done. Processed {processed} recipes, updated {updated} with {'synonym-expanded' if use_synonyms else 'basic'} tokens."
            )
        )
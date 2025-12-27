from django.core.management.base import BaseCommand
from recipes.models import MealDBRecipe
from food.utils.embeddings import embed_text

class Command(BaseCommand):
    help = "Generate embeddings for meal database"

    def handle(self, *args, **kwargs):
        qs = MealDBRecipe.objects.filter(embedding__isnull=True)

        for meal in qs:
            ingredient_names = [
                it.get("name", "").strip()
                for it in (meal.ingredients or [])
                if it.get("name")
            ]

            text = (
                f"Recipe title: {meal.title}. "
                f"Cuisine: {meal.cuisine}. "
                f"Ingredients: {', '.join(ingredient_names)}."
            )

            meal.embedding = embed_text(text)
            meal.save(update_fields=["embedding"])

            self.stdout.write(self.style.SUCCESS(
                f"Embedded: {meal.title}"
            ))

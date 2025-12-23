from recipes.models import MealDBRecipe
from food.utils.embeddings import embed_text
from food.utils.similarity import cosine_similarity

from recipes.models import MealDBRecipe
from food.utils.embeddings import embed_text
from food.utils.similarity import cosine_similarity
from food.utils.normalize import normalize_ingredient_name

def fallback_meals_from_mealdb(
    ingredients: list[str],
    top_k: int = 5,
    similarity_threshold: float = 0.60,
):
    """
    Semantic fallback: find closest MealDB recipes using embeddings.
    """

    # Normalize ingredient names
    norms = [
        normalize_ingredient_name(i)
        for i in ingredients
        if normalize_ingredient_name(i)
    ]

    # Stage 1 — keyword overlap filter
    qs = MealDBRecipe.objects.exclude(embedding__isnull=True)

    if norms:
        qs = qs.filter(ingredients_norm__overlap=norms)

    candidates = list(qs[:800])  # safety cap

    # If nothing matched, broaden search
    if not candidates:
        # Try any embedded meals
        candidates = list(MealDBRecipe.objects.exclude(embedding__isnull=True)[:800])

    # Stage 2 — semantic ranking
    query_text = "Ingredients: " + ", ".join(norms or ingredients)
    query_embedding = embed_text(query_text)

    scored = []
    for meal in candidates:
        score = cosine_similarity(query_embedding, meal.embedding)
        if score >= similarity_threshold:
            scored.append((score, meal))

    scored.sort(key=lambda x: x[0], reverse=True)

    # FINAL SAFETY NET: if still nothing, return any meals (even without embeddings)
    if not scored:
        qs_any = MealDBRecipe.objects.all().order_by("-id")[:top_k]
        return [(0.0, m) for m in qs_any]

    return scored[:top_k]   # [(score, MealDBRecipe), ...]

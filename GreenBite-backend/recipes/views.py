import json
import random
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import Q, Func, Value
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


from food.models import FoodLogSys, FoodLogUsage
from recipes.models import MealDBRecipe
from recipes.serializers import ConsumePreviewSerializer, ConsumeConfirmSerializer

# OpenAI is optional fallback
try:
    from openai import OpenAI
except Exception:
    OpenAI = None

client = None
if OpenAI and getattr(settings, "OPENAI_API_KEY", None):
    client = OpenAI(api_key=settings.OPENAI_API_KEY)


class RecommendRecipesAPIView(APIView):
    """
    GET /recipes/recommend?limit=5
    Recommends recipes from MealDBRecipe based on user's non-expired inventory.
    Uses LLM ONLY as a selector among DB candidates (never generates recipes).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get("limit", 5))
        limit = max(1, min(limit, 10))

        today = timezone.now().date()

        # 1) User inventory (not consumed, not expired) ordered by expiry
        inventory_qs = FoodLogSys.objects.filter(
            user=request.user,
            is_consumed=False,
            expiry_date__gte=today,
        ).order_by("expiry_date")

        inv_rows = list(inventory_qs.values("name_normalized", "expiry_date", "quantity", "unit"))
        inv_norms = sorted({x["name_normalized"] for x in inv_rows if x["name_normalized"]})

        if not inv_norms:
            return Response([], status=status.HTTP_200_OK)
        inv_set = set(inv_norms)
        # map ingredient -> min days left
        inv_days = {}
        for x in inv_rows:
            norm = x["name_normalized"]
            if not norm:
                continue
            days = (x["expiry_date"] - today).days
            inv_days[norm] = min(inv_days.get(norm, 10**9), days)
        candidates_qs = MealDBRecipe.objects.all().only(
            "id", "mealdb_id", "title", "thumbnail", "category", "cuisine", "ingredients_norm",
            "meal_time", "difficulty"
        )

        try:
            # Cast inv_norms to text[] explicitly in the query
            candidates_qs = candidates_qs.extra(
                where=["ingredients_norm && %s::text[]"],
                params=[inv_norms]
            )[:400]
        except Exception:
            # Fallback: just take first N and rank in python (OK if dataset isn't huge)
            candidates_qs = candidates_qs[:1200]

        candidates_scored = []
        for r in candidates_qs:
            ing_norms = r.ingredients_norm or []
            ing_set = set(ing_norms)

            matched = list(ing_set & inv_set)
            match_count = len(matched)
            if match_count < 1:
                continue

            min_days = min([inv_days[m] for m in matched], default=999999)

            candidates_scored.append({
                "recipe_id": r.id,
                "mealdb_id": r.mealdb_id,
                "title": r.title,
                "thumbnail": r.thumbnail,
                "category": r.category,
                "cuisine": r.cuisine,
                "meal_time": r.meal_time,
                "difficulty": r.difficulty,
                "ingredients_norm": list(ing_set)[:30],
                "match_count": match_count,
                "min_days_left": min_days,
            })

        if not candidates_scored:
            return Response([], status=status.HTTP_200_OK)

        # deterministic ranking as base:
        candidates_scored.sort(key=lambda x: (-x["match_count"], x["min_days_left"]))
        top_for_llm = candidates_scored[:150]

        # 3) LLM selector (optional): choose ONLY recipe_id from candidates
        selected_ids = []
        why_map = {}

        if client:
            try:
                payload = {
                    "limit": limit,
                    "inventory": [
                        {"name_norm": x["name_normalized"], "days_left": (x["expiry_date"] - today).days}
                        for x in inv_rows if x["name_normalized"]
                    ],
                    "candidates": [
                        {
                            "recipe_id": c["recipe_id"],
                            "title": c["title"],
                            "ingredients_norm": c["ingredients_norm"],
                            "match_count": c["match_count"],
                            "min_days_left": c["min_days_left"],
                            "meal_time": c["meal_time"],
                            "difficulty": c["difficulty"],
                        }
                        for c in top_for_llm
                    ],
                }

                messages = [
                    {
                        "role": "system",
                        "content": (
                            "You are a recipe recommendation assistant.\n"
                            "RULES:\n"
                            "- You MUST select recipe_id values ONLY from the provided candidates.\n"
                            "- Do NOT invent recipes, ingredients, steps, or ids.\n"
                            "- Output JSON only in this format:\n"
                            "{\"selected\":[{\"recipe_id\":123,\"why\":\"...\"}]}\n"
                            "- If none fit, output: {\"selected\":[]}\n"
                        ),
                    },
                    {"role": "user", "content": json.dumps(payload)},
                ]

                resp = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0.2,
                    response_format={"type": "json_object"},
                )

                data = json.loads(resp.choices[0].message.content)
                picked = data.get("selected", []) or []

                allowed = {c["recipe_id"] for c in top_for_llm}
                for item in picked:
                    rid = item.get("recipe_id")
                    if isinstance(rid, int) and rid in allowed:
                        selected_ids.append(rid)
                        why_map[rid] = (item.get("why") or "").strip()[:220]

                selected_ids = selected_ids[:limit]

            except Exception:
                selected_ids = []

        # 4) Fallback: deterministic top matches
        if not selected_ids:
            selected_ids = [c["recipe_id"] for c in top_for_llm[:limit]]

        # 5) Return full recipes from DB (never from LLM)
        recipes = list(MealDBRecipe.objects.filter(id__in=selected_ids))
        rmap = {r.id: r for r in recipes}
        ordered = [rmap[i] for i in selected_ids if i in rmap]

        out = []
        for r in ordered:
            ing_norms = r.ingredients_norm or []
            matched = [n for n in ing_norms if n in inv_days]

            expiring_soon = sorted(
                [{"name_norm": n, "days_left": inv_days[n]} for n in matched],
                key=lambda d: d["days_left"]
            )[:5]

            out.append({
                "recipe_id": r.id,
                "mealdb_id": r.mealdb_id,
                "title": r.title,
                "thumbnail": r.thumbnail,
                "category": r.category,
                "cuisine": r.cuisine,
                "instructions": r.instructions,
                "tags": r.tags,
                "ingredients": r.ingredients,  # list of {"name","measure"}
                "mealTime": r.meal_time,
                "difficulty": r.difficulty,
                "why": why_map.get(r.id, ""),
                "match": {
                    "matched_ingredients_norm": matched,
                    "expiring_soon": expiring_soon,
                }
            })

        return Response(out, status=status.HTTP_200_OK)


class ConsumePreviewAPIView(APIView):
    """
    POST /recipes/consume/preview
    { "recipe_id": 123 }
    Returns matching FoodLogSys records grouped by ingredient.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = ConsumePreviewSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        recipe = get_object_or_404(MealDBRecipe, id=s.validated_data["recipe_id"])

        today = timezone.now().date()
        recipe_norms = sorted(set([x for x in (recipe.ingredients_norm or []) if x]))

        logs = (
            FoodLogSys.objects.filter(user=request.user,is_consumed=False,expiry_date__gte=today,name_normalized__in=recipe_norms,).order_by("expiry_date")
        )

        grouped = {}
        for fl in logs:
            grouped.setdefault(fl.name_normalized, []).append({
                "foodlog_id": fl.id,
                "name": fl.name,
                "name_normalized": fl.name_normalized,
                "quantity_available": str(fl.quantity),
                "unit": fl.unit,
                "expiry_date": str(fl.expiry_date),
                "days_left": (fl.expiry_date - today).days,
            })

        return Response({
            "recipe_id": recipe.id,
            "mealdb_id": recipe.mealdb_id,
            "title": recipe.title,
            "recipe_ingredients_norm": recipe_norms,
            "matches": grouped,
        }, status=status.HTTP_200_OK)


class ConsumeConfirmAPIView(APIView):
    """
    POST /recipes/consume/confirm
    {
      "recipe_id": 123,
      "items": [{"foodlog_id": 7, "used_quantity": "1.5"}]
    }
    Deducts quantities + records FoodLogUsage.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = ConsumeConfirmSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        today = timezone.now().date()
        recipe_id = s.validated_data["recipe_id"]
        items = s.validated_data["items"]

        recipe = get_object_or_404(MealDBRecipe, id=recipe_id)
        recipe_norms = set(recipe.ingredients_norm or [])

        ids = [x["foodlog_id"] for x in items]
        with transaction.atomic():
            logs = list(
                FoodLogSys.objects.select_for_update().filter(
                    user=request.user,
                    id__in=ids,
                    is_consumed=False,
                    expiry_date__gte=today,
                )
            )
            log_map = {fl.id: fl for fl in logs}

            # validate all ids exist + belong to recipe ingredients
            for it in items:
                fl = log_map.get(it["foodlog_id"])
                if not fl:
                    return Response(
                        {"detail": f"Invalid foodlog_id: {it['foodlog_id']}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if fl.name_normalized not in recipe_norms:
                    return Response(
                        {"detail": f"FoodLog {fl.id} not part of this recipe ingredients"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # consumption we usage logging
            for it in items:
                fl = log_map[it["foodlog_id"]]
                used_qty = Decimal(str(it["used_quantity"]))
                fl.consume(used_qty) 
                FoodLogUsage.objects.create(
                    user=request.user,
                    recipe=recipe,
                    foodlog=fl,
                    used_quantity=used_qty,
                )

        return Response({"detail": "Consumption recorded successfully"}, status=status.HTTP_200_OK)


@api_view(["GET"])
def mealdb_random(request):
    """
    GET /recipes/mealdb/random?n=1
    Returns 1 (default) or N random MealDBRecipe cards.
    """
    raw_n = request.query_params.get("n", "1")
    try:
        n = int(raw_n)
    except (TypeError, ValueError):
        n = 1

    n = max(1, min(n, 50))

    qs = MealDBRecipe.objects.all()
    total = qs.count()
    if total == 0:
        return Response([] if n > 1 else {}, status=status.HTTP_204_NO_CONTENT)

    n = min(n, total)
    ids = list(qs.values_list("id", flat=True))
    picked_ids = random.sample(ids, n)

    meals = list(
        MealDBRecipe.objects.filter(id__in=picked_ids)
        .values("mealdb_id", "title", "thumbnail", "category", "cuisine")
    )

    if n == 1:
        return Response(meals[0], status=status.HTTP_200_OK)

    return Response(meals, status=status.HTTP_200_OK)


@api_view(["GET"])
def mealdb_detail(request, mealdb_id: str):
    """
    GET /recipes/mealdb/<mealdb_id>/
    Returns full details.
    """
    meal = get_object_or_404(MealDBRecipe, mealdb_id=mealdb_id)

    data = {
        "recipe_id": meal.id,
        "mealdb_id": meal.mealdb_id,
        "title": meal.title,
        "category": meal.category,
        "cuisine": meal.cuisine,
        "instructions": meal.instructions,
        "thumbnail": meal.thumbnail,
        "tags": meal.tags,
        "ingredients": meal.ingredients,
        "mealTime": meal.meal_time,
        "difficulty": meal.difficulty,
        "created_at": meal.created_at,
        "updated_at": meal.updated_at,
    }
    return Response(data, status=status.HTTP_200_OK)

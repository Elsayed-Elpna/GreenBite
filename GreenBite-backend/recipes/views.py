from django.shortcuts import render

# Create your views here
from datetime import date
from django.utils import timezone

from food.models import FoodLogSys
from recipes.models import Recipe
import json
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import Count, Q

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from openai import OpenAI

from food.models import FoodLogSys, FoodLogUsage
from recipes.models import Recipe
from .serializers import ConsumePreviewSerializer, ConsumeConfirmSerializer


client = OpenAI(api_key=getattr(settings, "OPENAI_API_KEY", None))


class RecommendRecipesAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        limit = int(request.query_params.get("limit", 5))
        limit = max(1, min(limit, 10))

        today = timezone.now().date()
#user food log
        inventory_qs = FoodLogSys.objects.filter(
            user=request.user,
            is_consumed=False, #grocery
            expiry_date__gte=today,
        ).order_by("expiry_date")

        inv = list(inventory_qs.values("name_normalized", "expiry_date", "quantity", "unit"))
        inv_norms = sorted({x["name_normalized"] for x in inv if x["name_normalized"]})

        if not inv_norms:
            return Response([], status=status.HTTP_200_OK)

        # DB candidates (ground truth)
        candidates_qs = (
            Recipe.objects.filter(ingredients__name_norm__in=inv_norms)
            .annotate(
                match_count=Count(
                    "ingredients",
                    filter=Q(ingredients__name_norm__in=inv_norms),
                    distinct=True,
                ),
                total_count=Count("ingredients", distinct=True),
            )
            .filter(match_count__gte=1)
            .order_by("-match_count")[:150]
        )

        candidates = []
        for r in candidates_qs:
            ing_norms = list(r.ingredients.values_list("name_norm", flat=True)[:25])
            candidates.append({
                "recipe_id": r.id,
                "title": r.title,
                "ingredients_norm": ing_norms,
                "minutes": r.minutes,
                "calories": r.calories,
                "meal_time": r.meal_time,
                "difficulty": r.difficulty,
            })

        # LLM selector: choose ONLY from candidates
        selected_ids = []
        why_map = {}

        try:
            payload = {
                "limit": limit,
                "inventory": [
                    {
                        "name_norm": x["name_normalized"],
                        "days_left": (x["expiry_date"] - today).days,
                    }
                    for x in inv if x["name_normalized"]
                ],
                "candidates": candidates,
            }

            messages = [
                {"role": "system", "content": (
                    "You are a recipe recommendation assistant.\n"
                    "RULES:\n"
                    "- You MUST select recipe_id values ONLY from the provided candidates.\n"
                    "- Do NOT invent recipes, ingredients, steps, or ids.\n"
                    "- Output JSON only in this format:\n"
                    "{\"selected\":[{\"recipe_id\":123,\"why\":\"...\"}]}\n"
                    "- If none fit, output: {\"selected\":[]}\n"
                )},
                {"role": "user", "content": json.dumps(payload)}
            ]

            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            data = json.loads(resp.choices[0].message.content)
            picked = data.get("selected", []) or []

            allowed = {c["recipe_id"] for c in candidates}
            for item in picked:
                rid = item.get("recipe_id")
                if isinstance(rid, int) and rid in allowed:
                    selected_ids.append(rid)
                    why_map[rid] = (item.get("why") or "").strip()[:220]

            selected_ids = selected_ids[:limit]

        except Exception:
            # Fallback: deterministic top matches
            selected_ids = [c["recipe_id"] for c in candidates[:limit]]

        # Return full recipes from DB (not from LLM)
        recipes = list(
            Recipe.objects.filter(id__in=selected_ids).prefetch_related("ingredients")
        )
        # keep order
        rmap = {r.id: r for r in recipes}
        ordered = [rmap[i] for i in selected_ids if i in rmap]

        out = []
        inv_days = {}
        for x in inv:
            norm = x["name_normalized"]
            if not norm:
                continue
            days = (x["expiry_date"] - today).days
            inv_days[norm] = min(inv_days.get(norm, 10**9), days)

        for r in ordered:
            ing = list(r.ingredients.values_list("name_norm", flat=True))
            matched = [n for n in ing if n in inv_days]
            expiring_soon = sorted(
                [{"name_norm": n, "days_left": inv_days[n]} for n in matched],
                key=lambda d: d["days_left"]
            )[:5]

            out.append({
                "recipe_id": r.id,
                "title": r.title,
                "steps": r.steps,
                "ingredients": [i.display_name or i.name_norm for i in r.ingredients.all()],
                "calories": r.calories,
                "minutes": r.minutes,
                "cuisine": r.cuisine,
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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = ConsumePreviewSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        recipe = Recipe.objects.prefetch_related("recipe_ingredients__ingredient").get(
            id=s.validated_data["recipe_id"]
        )

        today = timezone.now().date()

        recipe_norms = []
        for ri in recipe.recipe_ingredients.all():
            recipe_norms.append(ri.ingredient.name_norm)

        recipe_norms = sorted(set([x for x in recipe_norms if x]))

        # Fetch matching foodlogs (not consumed + not expired)
        logs = (
            FoodLogSys.objects.filter(
                user=request.user,
                is_consumed=False,
                expiry_date__gte=today,
                name_normalized__in=recipe_norms,
            )
            .order_by("expiry_date")
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
            "title": recipe.title,
            "recipe_ingredients_norm": recipe_norms,
            "matches": grouped,  # user picks used_quantity per foodlog
        }, status=status.HTTP_200_OK)


class ConsumeConfirmAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = ConsumeConfirmSerializer(data=request.data)
        s.is_valid(raise_exception=True)

        today = timezone.now().date()
        recipe_id = s.validated_data["recipe_id"]
        items = s.validated_data["items"]

        recipe = Recipe.objects.prefetch_related("ingredients").get(id=recipe_id)
        recipe_norms = set(recipe.ingredients.values_list("name_norm", flat=True))

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

            # apply consumption
            for it in items:
                fl = log_map[it["foodlog_id"]]
                used_qty = Decimal(str(it["used_quantity"]))

                fl.consume(used_qty)  # your model method

                FoodLogUsage.objects.create(
                    user=request.user,
                    recipe=recipe,
                    foodlog=fl,
                    used_quantity=used_qty,
                )

        return Response({"detail": "Consumption recorded successfully "}, status=status.HTTP_200_OK)

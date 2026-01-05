from decimal import Decimal
from .inventory import InventoryService
from abc import ABC, abstractmethod
from .ai_fallback import generate_ai_recipes as generate_ai_recipes_raw

from typing import List, Dict, Any , Optional
from recipes.models import MealDBRecipe
import logging
from django.db.models import Q


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
class RecipeCandidate:
    def __init__(
        self,
        title: str,
        ingredients: List[Any],
        source: str = "unknown",
        thumbnail: str = "",
        instructions: str = "",
        ingredient_tokens: Optional[List[str]] = None,
        cuisine: str = "",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.title = title
        self.ingredients = ingredients
        self.source = source  # 'mealdb', 'ai', 'custom'
        self.thumbnail = thumbnail
        self.instructions = instructions
        self.ingredient_tokens = ingredient_tokens or []
        self.cuisine = cuisine
        self.metadata = metadata or {}
        self.score = 0.0  # Will be set by scorer
    
    def __repr__(self):
        return f"<RecipeCandidate: {self.title} (source={self.source}, score={self.score:.2f})>"


class RecipeProvider(ABC):

    def __init__(self, inventory_service):
        self.inventory_service = inventory_service
        self.inventory_tokens = inventory_service.get_inventory_tokens(use_synonyms=True)
        self.food_log_map = inventory_service.map_food_logs()
    @abstractmethod
    def find_recipes(self, limit: int = 30) -> List[RecipeCandidate]:
        pass

    def score_recipe(self, recipe_tokens: List[str]) -> Dict[str, Any]:
        rec=set(recipe_tokens)
        if not rec or not self.inventory_tokens:
            return {"score": 0.0, "matched": 0, "missed": len(rec), "match_ratio": 0.0}
        matched = len(rec & self.inventory_tokens)
        missed = len(rec) - matched
        match_ratio = matched / len(rec) if rec else 0.0
        score = matched * 3 + match_ratio * 10 - missed
        return {"score": score, "matched": matched, "missed": missed, "match_ratio": match_ratio}
    def check_recipe_visibility(self, recipe_tokens: List[str], min_ratio: float=0.4) -> bool:
        score = self.score_recipe(recipe_tokens)
        return score["match_ratio"] >= min_ratio
    @property
    def provider_name(self) -> str:
        return self.__class__.__name__
    
class AIRecipeProvider(RecipeProvider):
    def find_recipes(self, limit: int = 30) -> List[RecipeCandidate]:
        # Placeholder for AI recipe generation logic
        logger.info(f"AIRecipeProvider: Generating up to {limit} recipes based on inventory.")
        if (not self.inventory_tokens):
            logger.warning("No inventory tokens available for AI recipe generation")
            return []
        foodlog= self.inventory_service.get_available_logs()
        if not foodlog.exists():
            logger.warning("No available food logs for AI recipe generation")
            return []
        try:
            generated_recipes = generate_ai_recipes_raw(foodlog, limit)
            candidates = []
            for rec in generated_recipes:
                candidate = RecipeCandidate(
                    title=getattr(rec, 'title', 'AI Recipe'),
                    ingredients=getattr(rec, 'ingredients', []),
                    source="ai",
                    thumbnail="",  # AI recipes don't have images
                    instructions="",  # Could be enhanced in future
                    ingredient_tokens=getattr(rec, 'ingredients', []),
                    cuisine=getattr(rec, 'cuisine', ''),
                    metadata={
                        'generated_by': 'openai',
                        'model': 'gpt-4o-mini',
                    }
                )
                score_data = self.score_recipe(candidate.ingredient_tokens)
                candidate.score = score_data.get("score", 0.0)
                candidate.metadata.update(score_data)
                candidates.append(candidate)
            logger.info(f"AIRecipeProvider: Generated {len(candidates)} recipes.")
            return candidates
        except Exception as e:
            logger.error(f"AIRecipeProvider: Error generating recipes - {e}")
            return []

class MealDBRecipeProvider(RecipeProvider):
    def find_recipes(self, limit: int = 30) -> List[RecipeCandidate]:
        logger.info(f"MealDBRecipeProvider: Fetching recipes with ingredient overlap.")
        inventory_ings = list(self.inventory_tokens)
        if not self.inventory_tokens:
            logger.warning("No inventory tokens available for MealDB search")
            return []
    
        query = Q()
        for ing in inventory_ings:
            query |= Q(ingredient_tokens__contains=[ing])
        #fetch
                
        candidate_recipes = MealDBRecipe.objects.filter(
            query
        ).only("id", "title", "ingredient_tokens", "instructions", "thumbnail", "ingredients","category","cuisine")
        logger.info(f"MealDB: Found {candidate_recipes.count()} candidate recipes")

        recipes = []
        for recipe in candidate_recipes:
            rec_tokens = recipe.ingredient_tokens or []
            score_data = self.score_recipe(rec_tokens)
            if score_data.get("matched", 0) > 0:
                candidate = RecipeCandidate(
                    title=recipe.title,
                    ingredients=recipe.ingredients or [],
                    source="mealdb",
                    thumbnail=recipe.thumbnail,
                    instructions=recipe.instructions,
                    ingredient_tokens=rec_tokens,
                    cuisine=recipe.cuisine,
                    metadata={
                        'recipe_id': recipe.id,
                        'category': recipe.category,
                        'cuisine': recipe.cuisine,
                        'mealdb_id': recipe.mealdb_id,
                    }
                )

                candidate.score = score_data.get("score", 0)
                candidate.metadata.update({
                    'matched_ingredients': score_data.get('matched', 0),
                    'missing_ingredients': score_data.get('missing', 0),
                    'match_ratio': score_data.get('match_ratio', 0.0),
                })
                recipes.append(candidate)
            logger.info(f"MealDBRecipeProvider: Found {len(recipes)} suitable recipes.")
            recipes.sort(key=lambda r: r.score, reverse=True)
        recipes = recipes[:limit]
        return recipes
    def find_by_category(self, category: str, limit: int = 10) -> List[RecipeCandidate]:
        logger.info(f"MealDBRecipeProvider: Fetching recipes in category '{category}'")
        candidate_recipes = self.find_recipes(limit=100)
        filtered_recipes = [
            recipe for recipe in candidate_recipes
            if recipe.metadata.get('category', '').lower() == category.lower()
        ]
        return filtered_recipes[:limit]
    def find_by_cuisine(self, cuisine: str, limit: int = 10) -> List[RecipeCandidate]:
        logger.info(f"MealDBRecipeProvider: Fetching recipes in cuisine '{cuisine}'")
        candidate_recipes = self.find_recipes(limit=100)
        filtered_recipes = [
            recipe for recipe in candidate_recipes
            if recipe.metadata.get('cuisine', '').lower() == cuisine.lower()
        ]
        return filtered_recipes[:limit]
class CompositeRecipeProvider(RecipeProvider):
    def __init__(self, inventory_service, use_ai: bool = True):
        super().__init__(inventory_service)
        self.mealdb_provider = MealDBRecipeProvider(inventory_service)
        self.ai_provider = AIRecipeProvider(inventory_service) if use_ai else None


    def find_recipes(self, limit: int = 30) -> List[RecipeCandidate]:
        all_recipes = []
        
        logger.info(f"Composite: Fetching recipes from MealDB (limit={limit})")
        mealdb_recipes = self.mealdb_provider.find_recipes(limit=limit)
        all_recipes.extend(mealdb_recipes)
        
        logger.info(f"Composite: Got {len(mealdb_recipes)} recipes from MealDB")
        
        if len(all_recipes) < limit and self.ai_provider:
            remaining = min(limit - len(all_recipes), 50)  
            logger.info(f"Composite: Fetching recipes from AI (limit={remaining})")
            ai_recipes = self.ai_provider.find_recipes(limit=remaining)
            all_recipes.extend(ai_recipes)
            logger.info(f"Composite: Got {len(ai_recipes)} recipes from AI")

        # Deduplicate
        unique_recipes = {}
        for recipe in all_recipes:
            key = (recipe.title.lower(), recipe.source)
            if key not in unique_recipes or recipe.score > unique_recipes[key].score:
                unique_recipes[key] = recipe

        sorted_recipes = sorted(unique_recipes.values(), key=lambda r: r.score, reverse=True)
        
        # ✅ If still not enough, cycle through existing recipes
        if len(sorted_recipes) < limit and sorted_recipes:
            logger.info(
                f"Composite: Only found {len(sorted_recipes)} unique recipes, "
                f"need {limit}. Will cycle/repeat recipes."
            )
            
            # Repeat recipes to fill the gap
            base_count = len(sorted_recipes)
            while len(sorted_recipes) < limit:
                # Copy recipes (with slightly lower score to indicate they're repeats)
                for original in sorted_recipes[:base_count]:
                    if len(sorted_recipes) >= limit:
                        break
                    
                    # Create a copy with adjusted score
                    repeat = RecipeCandidate(
                        title=original.title,
                        ingredients=original.ingredients,
                        source=original.source,
                        thumbnail=original.thumbnail,
                        instructions=original.instructions,
                        ingredient_tokens=original.ingredient_tokens,
                        cuisine=original.cuisine,
                        metadata=original.metadata.copy()
                    )
                    repeat.score = original.score * 0.9  
                    repeat.metadata['is_repeat'] = True
                    sorted_recipes.append(repeat)
        
        logger.info(
            f"Composite: Returning {len(sorted_recipes[:limit])} recipes "
            f"(unique: {base_count if 'base_count' in locals() else len(sorted_recipes)})"
        )
        
        return sorted_recipes[:limit]
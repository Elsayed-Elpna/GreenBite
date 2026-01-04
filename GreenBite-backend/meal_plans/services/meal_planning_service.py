"""
MealPlanningService - Orchestrates the entire meal planning process.
"""
import logging
from typing import List
from .inventory import InventoryService
from .recipe_scorer import RecipeScorer
from .meal_plan_builder import MealPlanBuilder
from .recipeProvider import RecipeProvider

logger = logging.getLogger(__name__)


class MealPlanningService:
    """
    High-level service that orchestrates meal plan generation.
    """
    
    def __init__(
        self,
        user,
        start_date,
        days,
        meals_per_day,
        providers: List[RecipeProvider],
        use_diversity: bool = True
    ):
        self.user = user
        self.start_date = start_date
        self.days = days
        self.meals_per_day = meals_per_day
        
        self.inventory = InventoryService(user)
        self.providers = providers
        self.scorer = RecipeScorer()
        self.builder = MealPlanBuilder(user, start_date, days, meals_per_day)
        self.use_diversity = use_diversity
    
    def generate(self):
        """
        Generate a complete meal plan.
        """
        # Step 1: Check inventory
        if not self.inventory.get_available_logs().exists():
            raise ValueError("No available food inventory to base meal plan on")
        

        inventory_tokens = self.inventory.get_inventory_tokens(use_synonyms=True)
        inventory_map = self.inventory.map_food_logs()  
        
        logger.info(
            f"Starting meal plan generation for {self.user.username}: "
            f"{self.days} days × {self.meals_per_day} meals = "
            f"{self.days * self.meals_per_day} total meals"
        )
        logger.info(f"Inventory: {len(inventory_tokens)} unique ingredients available")
        
        # Step 2: Collect candidates from all providers
        candidates = []
        
        for provider in self.providers:
            logger.info(f"Fetching recipes from {provider.provider_name}")
            
            try:
                provider_candidates = provider.find_recipes(
                    limit=self.days * self.meals_per_day
                )
                candidates.extend(provider_candidates)
                logger.info(
                    f"{provider.provider_name}: Added {len(provider_candidates)} candidates"
                )
            except Exception as e:
                logger.exception(f"{provider.provider_name} failed: {e}")
                continue
        
        if not candidates:
            raise ValueError("No recipe candidates found from any provider")
        
        logger.info(f"Total candidates collected: {len(candidates)}")
        
        # Step 3: Score and sort recipes
        if self.use_diversity:
            scored_recipes = self._score_with_diversity(
                candidates,
                inventory_tokens,
                inventory_map
            )
        else:
            scored_recipes = self._score_simple(
                candidates,
                inventory_tokens,
                inventory_map
            )
        
        # Filter out recipes with no score (invalid)
        valid_recipes = [
            (score, recipe) for score, recipe in scored_recipes if score is not None
        ]
        
        if not valid_recipes:
            raise ValueError("No suitable recipes found after scoring")
        
        # Sort by score (descending)
        valid_recipes.sort(key=lambda x: x[0], reverse=True)
        
        # Extract just the recipes
        final_recipes = [recipe for score, recipe in valid_recipes]
        
        logger.info(
            f"Scored {len(final_recipes)} valid recipes. "
            f"Top score: {valid_recipes[0][0]:.2f}"
        )
        
        # Step 4: Build the meal plan
        meal_plan = self.builder.build(final_recipes)
        
        logger.info(f"✅ Successfully generated meal plan {meal_plan.id}")
        
        return meal_plan
    
    def _score_simple(self, candidates, inventory_tokens, inventory_map):
        """Score recipes without diversity consideration."""
        scored = []
        
        for recipe in candidates:
            recipe_tokens = set(recipe.ingredient_tokens or [])
            score = self.scorer.score(recipe_tokens, inventory_tokens, inventory_map)
            scored.append((score, recipe))
        
        return scored
    
    def _score_with_diversity(self, candidates, inventory_tokens, inventory_map):
        """
        Score recipes with diversity (penalize repetition).
        """
        scored = []
        used_tokens = set()
        
        # First pass: score all recipes
        initial_scores = []
        for recipe in candidates:
            recipe_tokens = set(recipe.ingredient_tokens or [])
            # ✅ Pass inventory_map correctly
            score = self.scorer.score(recipe_tokens, inventory_tokens, inventory_map)
            initial_scores.append((score, recipe, recipe_tokens))
        
        # Sort by initial score
        initial_scores.sort(key=lambda x: x[0] if x[0] else -1, reverse=True)
        
        # Second pass: re-score with diversity consideration
        for base_score, recipe, recipe_tokens in initial_scores:
            if base_score is None:
                scored.append((None, recipe))
                continue
            
            # Calculate diversity bonus/penalty
            diversity_score = self.scorer.score_diversity(recipe_tokens, used_tokens)
            
            # Combine scores (70% match, 30% diversity)
            final_score = base_score * 0.7 + diversity_score * 0.3
            
            scored.append((final_score, recipe))
            
            # Update used tokens (for next iteration)
            used_tokens.update(recipe_tokens)
        
        return scored
    
    def get_planning_summary(self) -> dict:
        """
        Get a summary of the planning context (useful for debugging).
        """
        return {
            'user': self.user.username,
            'plan_duration': f"{self.days} days",
            'meals_per_day': self.meals_per_day,
            'total_meals_needed': self.days * self.meals_per_day,
            'inventory_summary': self.inventory.get_inventory_summary(),
            'providers': [p.provider_name for p in self.providers],
            'diversity_enabled': self.use_diversity,
        }
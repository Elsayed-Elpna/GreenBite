"""
RecipeScorer - Scores recipe candidates based on various criteria.
"""
import logging
from typing import Set, Dict, Any, Optional
from decimal import Decimal

logger = logging.getLogger(__name__)


class RecipeScorer:
    """
    Scores recipe candidates based on inventory match, variety, and other factors.
    """
    
    def __init__(
        self,
        match_weight: float = 3.0,
        ratio_weight: float = 10.0,
        missing_penalty: float = 0.5
    ):
        """
        Initialize scorer with configurable weights.
        """
        self.match_weight = match_weight
        self.ratio_weight = ratio_weight
        self.missing_penalty = missing_penalty
    
    def score(
        self,
        recipe_tokens: Set[str],
        inventory_tokens: Set[str],
        inventory_map: Optional[Dict[str, Decimal]] = None
    ) -> Optional[float]:
        """
        Score a recipe based on ingredient availability.
        
        Args:
            recipe_tokens: Set of normalized ingredient tokens for recipe
            inventory_tokens: Set of available inventory tokens
            inventory_map: Optional dict of ingredient → quantity
        
        Returns:
            float score, or None if recipe is invalid
        """
        if not recipe_tokens:
            logger.debug("Recipe has no tokens, returning None")
            return None
        
        # ✅ Ensure inventory_tokens is a set
        if not isinstance(inventory_tokens, set):
            inventory_tokens = set(inventory_tokens) if inventory_tokens else set()
        
        matched = len(recipe_tokens & inventory_tokens)
        missing = len(recipe_tokens) - matched
        match_ratio = matched / len(recipe_tokens)
        
        # Base score: matches * weight + ratio bonus - missing penalty
        score = (
            matched * self.match_weight +
            match_ratio * self.ratio_weight -
            missing * self.missing_penalty
        )
        
        # Boost score if we have abundant quantities (optional)
        if inventory_map and isinstance(inventory_map, dict):  # ✅ Check it's a dict
            abundance_bonus = self._calculate_abundance_bonus(
                recipe_tokens & inventory_tokens,
                inventory_map
            )
            score += abundance_bonus
        
        logger.debug(
            f"Scored recipe: matched={matched}/{len(recipe_tokens)} "
            f"({match_ratio:.1%}), score={score:.2f}"
        )
        
        return score
    
    def _calculate_abundance_bonus(
        self,
        matched_tokens: Set[str],
        inventory_map: Dict[str, Decimal]
    ) -> float:
        """
        Calculate bonus for recipes using abundant ingredients.
        """
        if not isinstance(inventory_map, dict):
            logger.warning(f"inventory_map is not a dict: {type(inventory_map)}")
            return 0.0
        
        bonus = 0.0
        
        for token in matched_tokens:
            # ✅ Use .get() to safely access dict
            quantity = inventory_map.get(token, Decimal('0'))
            
            # Give small bonus for high quantities
            if quantity > 1000:  # grams
                bonus += 2.0
            elif quantity > 500:
                bonus += 1.0
            elif quantity > 200:
                bonus += 0.5
        
        return bonus
    
    def score_diversity(
        self,
        recipe_tokens: Set[str],
        already_used_tokens: Set[str]
    ) -> float:
        """
        Score recipe based on ingredient diversity (penalize repetition).
        """
        if not recipe_tokens:
            return 0.0
        
        # ✅ Ensure already_used_tokens is a set
        if not isinstance(already_used_tokens, set):
            already_used_tokens = set(already_used_tokens) if already_used_tokens else set()
        
        overlap = len(recipe_tokens & already_used_tokens)
        overlap_ratio = overlap / len(recipe_tokens)
        
        # Higher score for more diverse recipes
        diversity_score = 10.0 * (1 - overlap_ratio)
        
        return diversity_score
    
    def score_with_diversity(
        self,
        recipe_tokens: Set[str],
        inventory_tokens: Set[str],
        already_used_tokens: Set[str],
        inventory_map: Optional[Dict[str, Decimal]] = None,
        diversity_weight: float = 0.3
    ) -> Optional[float]:
        """
        Combined scoring with diversity consideration.
        """
        base_score = self.score(recipe_tokens, inventory_tokens, inventory_map)
        
        if base_score is None:
            return None
        
        diversity_score = self.score_diversity(recipe_tokens, already_used_tokens)
        
        # Combine scores
        final_score = (
            base_score * (1 - diversity_weight) +
            diversity_score * diversity_weight
        )
        
        return final_score
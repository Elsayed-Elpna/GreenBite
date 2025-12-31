"""
Token extraction and expansion for ingredient matching.
"""
from typing import List, Set
from project.utils.normalize import normalize_ingredient_name
from project.utils.ingredient_synonyms import expand_ingredient_tokens, get_base_ingredient


def extract_tokens_from_recipe(ingredients: list) -> List[str]:
    """
    Extract normalized tokens from a recipe's ingredients list.
    Returns a list of unique normalized ingredient names.
    
    Args:
        ingredients: List of ingredient dicts/strings from recipe
    
    Returns:
        List of normalized unique tokens
    """
    tokens = set()
    
    for ing in ingredients:
        if isinstance(ing, dict):
            name = ing.get("name") or ing.get("ingredient") or ""
        else:
            name = str(ing)
        
        if name:
            normalized = normalize_ingredient_name(name)
            if normalized:
                tokens.add(normalized)
    
    return sorted(list(tokens))


def extract_tokens_with_synonyms(ingredients: list) -> List[str]:
    """
    Extract normalized tokens AND their synonyms from a recipe's ingredients.
    This creates a richer token set for semantic matching.
    
    Args:
        ingredients: List of ingredient dicts/strings from recipe
    
    Returns:
        List of normalized tokens including synonyms
    """
    all_tokens = set()
    
    for ing in ingredients:
        if isinstance(ing, dict):
            name = ing.get("name") or ing.get("ingredient") or ""
        else:
            name = str(ing)
        
        if name:
            # Get all token variations (base + synonyms)
            tokens = expand_ingredient_tokens(name)
            all_tokens.update(tokens)
    
    return sorted(list(all_tokens))


def compute_ingredient_match_score(recipe_tokens: Set[str], inventory_tokens: Set[str]) -> float:
    """
    Compute how well a recipe matches available inventory.
    
    Returns a score between 0 and 1:
    - 1.0 = perfect match (all recipe ingredients available)
    - 0.0 = no match
    """
    if not recipe_tokens:
        return 0.0
    
    matched = len(recipe_tokens & inventory_tokens)
    return matched / len(recipe_tokens)
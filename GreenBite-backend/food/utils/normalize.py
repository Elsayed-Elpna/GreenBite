import re


def normalize_ingredient_name(name: str) -> str:
    """
    Normalize an ingredient name for consistent matching.
    
    Examples:
        "Tomatoes" -> "tomato"
        "Fresh Basil Leaves" -> "basil"
        "Extra Virgin Olive Oil" -> "olive oil"
    """
    if not name:
        return ""
    
    # Convert to lowercase
    name = name.lower().strip()
    
    # Remove common descriptive words
    descriptors = [
        "fresh", "dried", "frozen", "canned", "raw", "cooked",
        "chopped", "diced", "sliced", "minced", "grated",
        "whole", "crushed", "ground", "powdered",
        "extra virgin", "virgin", "organic", "natural",
        "large", "small", "medium", "ripe", "unripe",
        "boneless", "skinless", "seedless",
        "low fat", "full fat", "fat free", "reduced fat"
    ]
    
    for descriptor in descriptors:
        name = re.sub(r'\b' + descriptor + r'\b', '', name)
    
    # Remove extra whitespace
    name = ' '.join(name.split())
    
    # Remove plural 's' at the end (simple pluralization)
    # Handle common cases like "tomatoes" -> "tomato"
    if name.endswith('ies'):
        name = name[:-3] + 'y'
    elif name.endswith('es'):
        name = name[:-2]
    elif name.endswith('s') and len(name) > 2:
        # Don't remove 's' from words like "oil", "gas"
        if not name.endswith(('ss', 'us', 'is')):
            name = name[:-1]
    
    # Remove parentheses and their contents
    name = re.sub(r'\([^)]*\)', '', name)
    
    # Remove numbers and measurements
    name = re.sub(r'\d+\s*(kg|g|lb|oz|ml|l|cup|tbsp|tsp|teaspoon|tablespoon)?', '', name)
    
    # Remove special characters except spaces and hyphens
    name = re.sub(r'[^a-z\s-]', '', name)
    
    # Final cleanup
    name = ' '.join(name.split()).strip()
    
    return name


def normalize_ingredients_list(ingredients: list) -> list[str]:
    """
    Normalize a list of ingredients.
    
    Args:
        ingredients: List of ingredient strings or dicts with 'name' key
    
    Returns:
        List of normalized ingredient names
    """
    normalized = []
    
    for item in ingredients:
        if isinstance(item, dict):
            name = item.get("name", "")
        else:
            name = str(item)
        
        norm = normalize_ingredient_name(name)
        if norm:
            normalized.append(norm)
    
    return normalized
"""
Ingredient synonym mappings for semantic matching.
Base ingredient → list of common synonyms/variants.
"""

INGREDIENT_SYNONYMS = {
    # Proteins
    "chicken": ["chicken breast", "chicken thigh", "poultry", "hen"],
    "beef": ["ground beef", "steak", "minced beef", "beef mince"],
    "pork": ["pork chop", "pork loin", "bacon", "ham"],
    "fish": ["salmon", "tuna", "cod", "tilapia", "white fish"],
    "egg": ["eggs", "egg white", "egg yolk"],
    "tofu": ["bean curd", "soy curd"],
    
    # Dairy
    "milk": ["whole milk", "skim milk", "dairy milk"],
    "cheese": ["cheddar", "mozzarella", "parmesan", "feta"],
    "yogurt": ["yoghurt", "greek yogurt", "plain yogurt"],
    "butter": ["unsalted butter", "salted butter"],
    "cream": ["heavy cream", "whipping cream", "single cream"],
    
    # Vegetables
    "tomato": ["tomatoes", "cherry tomato", "roma tomato", "plum tomato"],
    "potato": ["potatoes", "white potato", "red potato"],
    "onion": ["onions", "yellow onion", "white onion", "red onion"],
    "garlic": ["garlic clove", "garlic cloves", "minced garlic"],
    "carrot": ["carrots", "baby carrot"],
    "pepper": ["bell pepper", "capsicum", "sweet pepper"],
    "mushroom": ["mushrooms", "button mushroom", "portobello"],
    "spinach": ["fresh spinach", "baby spinach"],
    "broccoli": ["broccoli florets"],
    "lettuce": ["iceberg lettuce", "romaine lettuce", "salad greens"],
    
    # Grains & Pasta
    "rice": ["white rice", "brown rice", "basmati rice", "jasmine rice"],
    "pasta": ["spaghetti", "penne", "macaroni", "noodles"],
    "bread": ["white bread", "whole wheat bread", "loaf"],
    "flour": ["all purpose flour", "plain flour", "wheat flour"],
    
    # Legumes
    "bean": ["beans", "kidney bean", "black bean", "pinto bean"],
    "lentil": ["lentils", "red lentil", "green lentil"],
    "chickpea": ["chickpeas", "garbanzo bean", "garbanzo beans"],
    
    # Fruits
    "apple": ["apples", "green apple", "red apple"],
    "banana": ["bananas"],
    "orange": ["oranges", "navel orange"],
    "lemon": ["lemons", "lemon juice"],
    
    # Herbs & Spices
    "salt": ["sea salt", "table salt", "kosher salt"],
    "pepper": ["black pepper", "ground pepper", "peppercorn"],
    "basil": ["fresh basil", "dried basil"],
    "parsley": ["fresh parsley", "dried parsley"],
    "cilantro": ["coriander", "fresh cilantro", "coriander leaves"],
    
    # Oils & Condiments
    "oil": ["olive oil", "vegetable oil", "cooking oil", "canola oil"],
    "vinegar": ["white vinegar", "apple cider vinegar", "balsamic vinegar"],
    "soy sauce": ["soya sauce", "light soy sauce", "dark soy sauce"],
}


def get_base_ingredient(ingredient: str) -> str:
    """
    Given an ingredient name, return its base form if it's a known synonym.
    Otherwise return the ingredient unchanged (normalized).
    """
    from project.utils.normalize import normalize_ingredient_name
    
    normalized = normalize_ingredient_name(ingredient)
    
    # Check if this is a synonym of any base ingredient
    for base, synonyms in INGREDIENT_SYNONYMS.items():
        normalized_synonyms = [normalize_ingredient_name(s) for s in synonyms]
        if normalized in normalized_synonyms or normalized == normalize_ingredient_name(base):
            return normalize_ingredient_name(base)
    
    return normalized


def expand_ingredient_tokens(ingredient: str) -> set:
    """
    Given an ingredient, return a set of tokens including:
    - the normalized form
    - the base form (if it's a synonym)
    - all synonyms of the base form
    """
    from project.utils.normalize import normalize_ingredient_name
    
    normalized = normalize_ingredient_name(ingredient)
    tokens = {normalized}
    
    # Find base and add all related tokens
    for base, synonyms in INGREDIENT_SYNONYMS.items():
        normalized_base = normalize_ingredient_name(base)
        normalized_synonyms = [normalize_ingredient_name(s) for s in synonyms]
        
        if normalized == normalized_base or normalized in normalized_synonyms:
            tokens.add(normalized_base)
            tokens.update(normalized_synonyms)
            break
    
    return tokens
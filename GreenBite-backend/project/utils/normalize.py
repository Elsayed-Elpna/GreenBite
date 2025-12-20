import re
from functools import lru_cache

_UNITS = {
    "g", "kg", "mg", "ml", "l", "oz", "lb", "lbs",
    "gram", "grams", "kilogram", "kilograms",
    "milliliter", "milliliters", "liter", "liters",
    "ounce", "ounces", "pound", "pounds",
    "cup", "cups", "tbsp", "tablespoon", "tablespoons",
    "tsp", "teaspoon", "teaspoons",
    "pinch", "dash", "slice", "slices", "clove", "cloves",
    "can", "cans", "package", "packages"
}

_DESCRIPTORS = {
    "fresh", "chopped", "diced", "minced", "sliced", "grated", "ground",
    "large", "small", "medium", "extra", "lean",
    "boneless", "skinless", "seedless", "peeled",
    "optional", "to", "taste", "and", "or"
}

_SYNONYMS = {
    "scallion": "green onion",
    "scallions": "green onion",
    "spring onion": "green onion",
    "spring onions": "green onion",
    "bell pepper": "pepper",
    "bell peppers": "pepper",
    "capsicum": "pepper",
    "capsicums": "pepper",
    "cilantro": "coriander",
}

_word_re = re.compile(r"[a-zA-Z]+")

def _singularize(token: str) -> str:
    # بسيط جدًا (مش perfect) لكنه كفاية للـ matching
    if len(token) <= 3:
        return token
    if token.endswith("ies") and len(token) > 4:
        return token[:-3] + "y"
    if token.endswith("sses") or token.endswith("ss"):
        return token
    if token.endswith("s"):
        return token[:-1]
    return token

@lru_cache(maxsize=50000)
def normalize_ingredient_name(text: str) -> str:
    if not text:
        return ""

    s = str(text).strip().lower()

    # remove anything in parentheses: "tomato (chopped)" -> "tomato"
    s = re.sub(r"\([^)]*\)", " ", s)

    tokens = _word_re.findall(s)

    cleaned = []
    for t in tokens:
        if t in _UNITS or t in _DESCRIPTORS:
            continue
        t = _singularize(t)
        cleaned.append(t)

    norm = " ".join(cleaned).strip()
    if not norm:
        return ""

    norm = _SYNONYMS.get(norm, norm)

   
    norm = re.sub(r"\s+", " ", norm).strip()
    return norm[:120]

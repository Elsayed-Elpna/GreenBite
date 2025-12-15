
def recipe_prompt(ingredients):
    return """
    You are a professional chef.

    Generate EXACTLY 5 recipes using ONLY these ingredients:
    {ingredients}

    RULES:
    - Return JSON only (no text)
    - Max 5 recipes
    - No extra ingredients unless basic (salt, oil, water)
    - Title ≤ 8 words
    - Description ≤ 25 words
    - Steps: short, numbered
    - Simple home recipes only
    - waste_items MUST contain ONLY inedible items. Never put edible food in waste_items.
    - If no waste is expected, waste_items must be [].

    JSON format:
    [
    {{
        "recipe": "string",
    "ingredients": ["string", "..."],
    "serving": integer,
    "calories": integer,
    "cuisine": "string",
    "mealTime": "breakfast|lunch|dinner|snack|brunch",
    "title": "",
    "description": "",
    "ingredients": [],
    "steps": [],
    "estimated_time": "",
    "difficulty": "easy|medium|hard"
    "waste": [
        {
        "name": "string",
        "reason": "inedible part (peel/shell/bone/tea bag/etc.)",
        "disposal": "compost|trash|recycle",
        "estimated_amount": number,
        "unit": "g|piece|tbsp"
        }
    ],
    }}
    ]"""

def waste_prompt(meal, context):
    return """You are a sustainability & kitchen-waste expert.

    TASK:
    Given a meal name (and optional context), predict the MOST LIKELY kitchen waste generated while preparing/eating it.
    Then suggest practical reuse ideas for each waste item.

    INPUT:
    - meal: {meal}
    - context: {context}

    RULES:
    - Return JSON only (no text, no markdown)
    - Be realistic: include ONLY plausible, common waste items.
    - waste_items MUST contain ONLY inedible items (peels, shells, bones, tea bags, eggshells, coffee grounds, etc.).
    Never list edible food as waste.
    - If the meal can be made with zero prep waste (rare), waste_items must be [].
    - Reuse tips must be safe and practical for home.
    - If an item should NOT be reused, say so and recommend the safest disposal.
    - if the prompt is written in an arabic language, return arabic response

    OUTPUT JSON format:
    {{
    "meal": "string",
    "waste_items": [
        {{
        "name": "string",
        "why": "string",
        "estimated_amount": 0,
        "unit": "g|piece|tbsp",
        "disposal": "compost|trash|recycle",
        "reuse_ideas": ["string", "..."]
        }}
    ],
    "general_tips": ["string", "..."]
    }}"""
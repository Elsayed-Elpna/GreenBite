def recipe_prompt(ingredients):
    return f"""
Return VALID JSON only.

Create EXACTLY 6 meals using ONLY these ingredients:
{ingredients}
LANGUAGE RULE:
- Use ONLY ONE language per response.
- The language must be either ENGLISH or ARABIC.
- Do NOT mix languages.
- Always return ONLY cuisine and mealTime in English.
Rules:
- You can add 2-3 extra ingredients and salt, oil, water, spices, pepper if needed.
- Be more specific about cuisine countries especially middle eastern return country cuisines.
- Return only halal food.
- Don't mention Israel or return Israeli food.
- Ingredients must have realistic quantities.
- Keep steps short
- calculate calories
- No explanations

JSON format:

{{
  "meals": [
    {{
      "title": "string",
      "ingredients": ["string"],
      "steps": ["string"],
      "title": "string",
    "description": "string",
    "ingredients": ["string"],
    "steps": ["string"],
    "servings": 2,
    "time_minutes": 20,
    "difficulty": "easy|medium|hard",
    "cuisine": "string",
    "mealTime": "breakfast|lunch|dinner|snack|brunch",
    "calories": 0,
    }}
  ]
}}
"""


def waste_prompt(meal, ingredients):
    return """You are a sustainability & kitchen-waste expert.

    TASK:
    Given a meal name or ingredients, predict the MOST LIKELY kitchen waste generated while preparing/eating it.
    Then suggest practical reuse ideas for each waste item.

    INPUT:
    - meal: {meal}
    - ingredients: {ingredients}

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

def waste_ingredients_only_prompt(ingredients_clean):
    return """Return ONLY valid JSON. No markdown.

We have ingredients only (no meal name).
Ingredients: {ingredients_clean}

Return EXACTLY this JSON shape:
{
  "meal": "",
  "ingredients_waste": [
    {
      "ingredient": "string (must match one ingredient from the input)",
      "waste_items": [
        {
          "name": "string",
          "why": "string",
          "estimated_amount": 0,
          "unit": "g",
          "disposal": "compost|trash|recycle|other",
          "reuse_ideas": ["string"]
        }
      ],
      "storage_tips": ["string"],
      "use_soon_ideas": ["string"]
    }
  ],
  "general_tips": ["string"]
}

Rules:
- ingredients_waste MUST include one entry per ingredient in the input (if recognizable).
- Each entry's 'ingredient' must be exactly the ingredient name (e.g., 'banana', not 'banana peels').
- Put peel/core waste inside that ingredient’s waste_items.
- meal must be an empty string.
    """
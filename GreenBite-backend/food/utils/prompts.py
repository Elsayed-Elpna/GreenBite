def recipe_prompt(ingredients):
    return f"""
Return VALID JSON only.

Create EXACTLY 3 meals using ONLY these ingredients:
{ingredients}
LANGUAGE RULE:
- Use ONLY ONE language per response.
- The language must be either ENGLISH or ARABIC.
- Do NOT mix languages.
Rules:
- Do not add extra ingredients except salt, oil, water, spices, pepper.
- Keep steps short
- Do not include calories
- Do not include waste
- No explanations
- Do NOT skip waste if it exists.
- ONLY include waste that comes directly from the listed ingredients.
- If and ONLY IF no ingredient has inedible parts, return [].
- Each waste item MUST have:
- name: name of the waste item (e.g., "banana peel")
- reason: why it's waste (e.g., "inedible part only")
- disposal: one of [compost, trash, recycle]

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
    "waste_items": [
      {{
        "name": "string",
        "reason": "inedible part only",
        "disposal": "compost|trash|recycle"
      }}
    ]
    }}
  ]
}}
"""




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
import { getCuisineVisuals } from "@/utils/constants";

export const mapRecipeToCard = (recipe, index) => ({
  id: index,
  title: recipe.recipe || "Meal suggestion",
  description: recipe.description || "",
  time: recipe.time_minutes,
  difficulty: recipe.difficulty?.toLowerCase(),
  cuisine: recipe.cuisine,
  mealTime: recipe.mealTime.charAt(0).toUpperCase() + recipe.mealTime.slice(1),
  ingredients: recipe.ingredients,
  steps: recipe.steps,
  servings: recipe.servings,
  source: recipe.source,
  cuisineVisuals: getCuisineVisuals(recipe.cuisine),
});

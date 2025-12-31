import { getCuisineVisuals } from "@/utils/constants";

export const mapMealToCard = (meal) => {
  const cuisineVisuals = getCuisineVisuals(meal.cuisine || "");

  return {
    id: meal.id,
    title: meal.recipe,
    ingredients: meal.ingredients || [],
    steps: meal.steps || [],
    serving: meal.serving || 1,
    cuisine: meal.cuisine || "Unknown",
    mealTime: meal.mealTime,
    hasLeftovers: meal.has_leftovers,
    createdAt: meal.created_at,
    photo: meal.photo,
    calories: meal.calories,
    cuisineVisuals,
  };
};


export const mapMealFromApi = (meal) => {
  return {
    id: meal.id,
    title: meal.recipe,
    recipe: meal.recipe,
    ingredients: meal.ingredients || [],
    steps: meal.steps || [],
    serving: meal.serving,
    waste: meal.waste || [],
    calories: meal.calories,
    hasLeftovers: meal.has_leftovers,
    leftovers_saved: meal.leftovers_saved,
    leftovers: meal.leftovers,
    cuisine: meal.cuisine,
    mealTime: meal.mealTime,
    createdAt: meal.created_at,
  };
};


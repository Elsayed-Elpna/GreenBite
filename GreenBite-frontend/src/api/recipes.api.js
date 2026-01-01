import api from "./axios";

export const generateRecipes = async (ingredients) => {
  const response = await api.post("/api/meals/generate/", {
    ingredients: ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean),
  });

  return response.data.meals;
};

// -------------------- Save Meal --------------------
export const saveMeal = async (recipe) => {
  // Construct payload depending on your backend
  const payload = {
    recipe: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    cuisine: recipe.cuisine,
    mealTime: recipe.mealTime.toLowerCase(), // lowercase for backend choices
    difficulty: recipe.difficulty,
    time: recipe.time,
    serving: recipe.servings,
  };


  const response = await api.post("/api/meals/save-ai/", payload);
  return response.data; // return saved meal info if needed
};

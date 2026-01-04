import api from "./axios";

// Generate recipes
export const generateRecipes = async (ingredients) => {
  const response = await api.post("/api/meals/generate/", {
    ingredients: ingredients
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean),
  });

  return response.data.meals;
};

// Save AI Meal
export const saveMeal = async (recipe) => {
  // 1️⃣ Predict waste
  const wastePayload = {
    meal: recipe.title,
    ingredients: recipe.ingredients.map(i => i.name || i),
  };

  const wasteResponse = await api.post("/api/meals/waste/", wastePayload);
  const predictedWaste = wasteResponse.data.waste_items || [];

  // 2️⃣ Save meal
  const payload = {
    recipe: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    cuisine: recipe.cuisine,
    mealTime: recipe.mealTime.toLowerCase(),
    difficulty: recipe.difficulty,
    time: recipe.time,
    serving: recipe.servings,
    calories: recipe.calories,
    waste: predictedWaste,
  };

  const mealResponse = await api.post("/api/meals/save-ai/", payload);
  const savedMeal = mealResponse.data;

  // 3️⃣ Create WasteLogs
  const createdWasteLogs = await Promise.all(
    predictedWaste.map(item =>
      api.post("/api/waste-log/", {
        meal: savedMeal.id,
        name: item.name,
        why: item.why || "",
        estimated_amount: item.estimated_amount || 0,
        unit: item.unit || "portion",
        disposal: item.disposal || "unknown",
        reuse_ideas: item.reuse_ideas || [],
      })
    )
  );

  return {
    meal: savedMeal,
    autoWasteLogs: createdWasteLogs,
  };
};

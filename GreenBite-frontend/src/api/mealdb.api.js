import api from "./axios";

export const getMealdbRecipeById = async (mealdbId) => {
  const res = await api.get(`/api/mealdb/${mealdbId}/`);
  return res.data;
};

//random recipe for the right menu
export async function getRandomRecipe() {
  const res = await api.get("/api/mealdb/random/?n=8");
  return res.data;
}


export const getRecommendedRecipes = async (limit = 5) => {
  const res = await api.get("/api/recipes/recommend/", { params: { limit } });
  return res.data;
};

export const consumePreview = async (recipeId) => {
  const res = await api.post("/api/recipes/consume/preview/", { recipe_id: recipeId });
  return res.data;
};

export const consumeConfirm = async ({ recipeId, items }) => {
  // items: [{ foodlog_id: number, used_quantity: "1.5" }]
  const res = await api.post("/api/recipes/consume/confirm/", {
    recipe_id: recipeId,
    items,
  });
  return res.data;
};

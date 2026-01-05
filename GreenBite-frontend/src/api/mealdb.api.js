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

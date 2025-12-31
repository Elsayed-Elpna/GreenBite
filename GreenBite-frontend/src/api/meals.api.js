import api from "@/api/axios";

export const fetchMyMeals = async () => {
  const res = await api.get("/api/meals/");
  return res.data;
};

export const deleteMeal = async (mealId) => {
  await api.delete(`/api/meals/${mealId}/delete/`);
};

export const fetchMealDetails = async (mealId) => {
  const response = await api.get(`/api/meals/${mealId}/`);
  return response.data;
};

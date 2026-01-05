import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateMealPlan,
  getMealPlanById,
  getAllMealPlans,
  confirmMealPlanDay,
  confirmMealPlan,
  replaceMeal,
  skipMeal,
  deleteMealPlan,
} from "@/api/mealplan.api";

export function useMealPlansList() {
  return useQuery({
    queryKey: ["mealPlans"],
    queryFn: getAllMealPlans,
  });
}

export function useMealPlanDetail(id) {
  return useQuery({
    queryKey: ["mealPlan", id],
    queryFn: () => getMealPlanById(id),
    enabled: !!id,
  });
}

export function useGenerateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries(["mealPlans"]);
    },
  });
}

export function useConfirmPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmMealPlan,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(["mealPlans"]);
      queryClient.invalidateQueries(["mealPlan", id]);
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["myMeals"] });
    },
  });
}

export function useConfirmDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmMealPlanDay,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries(["mealPlans"]);
      // all plans might be impacted; simplest:
      queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
      queryClient.invalidateQueries({ queryKey: ["mealPlanDetail"] });
      queryClient.invalidateQueries({ queryKey: ["mealPlans"] });

      // ✅ refresh "My Meals" / home meals list (update this key to match your app)
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["myMeals"] });

      // If you have a day-specific query:
      queryClient.invalidateQueries({ queryKey: ["mealPlanDay", id] });
    },
  });

}

export function useReplacePlanMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mealId, useAi }) => replaceMeal(mealId, useAi),
    onSuccess: () => {
      queryClient.invalidateQueries(["mealPlans"]);
      queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
      queryClient.invalidateQueries(["mealPlan", "current"]);
    },
  });
}

export function useSkipPlanMeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: skipMeal,
    onSuccess: () => {
      queryClient.invalidateQueries(["mealPlans"]);
      queryClient.invalidateQueries({ queryKey: ["mealPlan"] });
      queryClient.invalidateQueries(["mealPlan", "current"]);
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries(["mealPlans"]);
    },
  });
}
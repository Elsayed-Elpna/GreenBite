import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMeal } from "@/api/recipes.api";

export default function useSaveMeal(mealId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveMeal,
    onSuccess: (savedMeal) => {
      // 1. Invalidate meals list (useMeals)
      queryClient.invalidateQueries({ queryKey: ["meals"], exact: false });

      // 2. Update single meal cache for MealDetailsDialog
      if (mealId) {
        queryClient.setQueryData(["meal", mealId], (old) => ({
          ...old,
          ...savedMeal, // merge updated meal including leftovers
        }));
      }
    },
  });
}

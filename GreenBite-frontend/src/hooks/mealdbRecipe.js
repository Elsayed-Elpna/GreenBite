import { useMutation, useQuery } from "@tanstack/react-query";
import { consumeConfirm, consumePreview, getRecommendedRecipes } from "@/api/mealdb.api";

export const useRecommendedRecipes = (limit = 3, options={}) => {
    return useQuery({
        queryKey: ["recommendedRecipes", limit],
        queryFn: () => getRecommendedRecipes(limit),
        staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
        ...options
    });
};
export const useConsumePreview = () => {
  return useMutation({
    mutationFn: (recipeId) => consumePreview(recipeId),
  });
};

export const useConsumeConfirm =()=>{
    return useMutation({
        mutationFn: ({recipeId, items}) => consumeConfirm({recipeId, items}),
    })
};
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyMeals, deleteMeal } from "@/api/meals.api";
import { mapMealToCard } from "@/utils/meal.mapper";

export function useMeals({ page = 1, pageSize = 10, filters = {} }) {
  const queryClient = useQueryClient();

  // Fetch meals query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["meals", page, pageSize, filters],
    queryFn: async () => {
      const res = await fetchMyMeals({ page, page_size: pageSize, ...filters });
      return {
        meals: res.results.map(mapMealToCard),
        totalCount: res.count,
      };
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: (id) => deleteMeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });

  return {
    meals: data?.meals || [],
    totalCount: data?.totalCount || 0,
    loading: isLoading,
    isError,
    error,
    deleteMeal: deleteMealMutation.mutate,
  };
}
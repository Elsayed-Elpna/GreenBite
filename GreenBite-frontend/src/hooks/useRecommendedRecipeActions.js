import { useState } from "react";
import { useDialogone } from "@/hooks/useDialog";
import { getMealdbRecipeById } from "@/api/mealdb.api";

export const useRecommendedRecipeActions = () => {
  const dialog = useDialogone();

  const [consumeOpen, setConsumeOpen] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState(null);

  const openConsume = (recipe) => {
    setActiveRecipe(recipe);
    setConsumeOpen(true);
  };

  const closeConsume = () => setConsumeOpen(false);

  const openDetails = async (recipe) => {
    // Recommend API returns mealdb_id, not source_mealdb_id
    const mealdbId = recipe?.mealdb_id;
    if (!mealdbId) return;

    try {
      const meal = await getMealdbRecipeById(mealdbId);
      dialog.open(meal);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to load MealDB details:", e);
    }
  };

  return {
    dialog,
    consumeOpen,
    activeRecipe,
    openConsume,
    closeConsume,
    openDetails,
  };
};

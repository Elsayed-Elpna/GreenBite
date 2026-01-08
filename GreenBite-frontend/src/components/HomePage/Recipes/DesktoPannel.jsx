import React from "react";
import { useRecommendedRecipes } from "@/hooks/mealdbRecipe";
import { HOME_CARD } from "@/utils/HomeTheme";
import ConsumeRecipeMobileModal from "@/components/HomePage/Recipes/consumeRecipe";
import MealDetailsDialog from "@/components/HomePage/Dialogs/DialogMeals";
import { useRecommendedRecipeActions } from "@/hooks/useRecommendedRecipeActions";
import RecommendedRecipeCard from "@/components/ui/RecommendedRecipeCard";

export default function RecommendedRecipesDesktopPanel({ limit = 5, title = "Recommended recipes" }) {
  const { data, isLoading, isError } = useRecommendedRecipes(limit, { enabled: true });
  const items = Array.isArray(data) ? data : [];

  const { dialog, consumeOpen, activeRecipe, openConsume, closeConsume, openDetails } =
    useRecommendedRecipeActions();

  return (
    <>
      <aside className="hidden md:block w-full">
        <div className="sticky top-24">
          <div className="rounded-2xl border border-emerald-100/60 bg-white/80 shadow-sm p-4">
            <div className="mb-3">
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">Based on your food log</p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`${HOME_CARD} p-3 animate-pulse`}>
                    <div className="h-16 rounded-xl bg-gray-100" />
                    <div className="mt-2 h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="mt-1 h-3 w-1/2 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3">
                Could not load recommendations.
              </div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted-foreground bg-white border border-emerald-100/60 rounded-xl p-3">
                No recommendations yet. Add items to your food log.
              </div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-auto pr-1">
                {items.map((r) => (
                  <RecommendedRecipeCard
                    key={r.recipe_id}
                    recipe={r}
                    variant="desktop"
                    onOpenDetails={openDetails}
                    onOpenConsume={openConsume}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* NOTE: this modal is sm:hidden inside, so it won't show on desktop.
         If you want consume preview on desktop too, we should create a non-mobile modal. */}
      <ConsumeRecipeMobileModal open={consumeOpen} onClose={closeConsume} recipe={activeRecipe} />

      <MealDetailsDialog dialog={dialog} />
    </>
  );
}

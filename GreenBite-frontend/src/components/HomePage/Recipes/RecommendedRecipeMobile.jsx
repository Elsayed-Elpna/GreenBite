import React from "react";
import { useRecommendedRecipes } from "@/hooks/mealdbRecipe";
import { HOME_SECTION_SHELL } from "@/utils/HomeTheme";
import ConsumeRecipeMobileModal from "@/components/HomePage/Recipes/consumeRecipe";
import MealDetailsDialog from "@/components/HomePage/Dialogs/DialogMeals";
import { useRecommendedRecipeActions } from "@/hooks/useRecommendedRecipeActions";
import RecommendedRecipeCard from "@/components/ui/RecommendedRecipeCard";

const RecommendedRecipesMobile = ({ limit = 5 }) => {
  const { data, isLoading, isError } = useRecommendedRecipes(limit, { enabled: true });
  const items = Array.isArray(data) ? data : [];

  const { dialog, consumeOpen, activeRecipe, openConsume, closeConsume, openDetails } =
    useRecommendedRecipeActions();

  return (
    <>
      <section className="py-4 sm:hidden">
        <div className={HOME_SECTION_SHELL}>
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground">Recommended recipes</h3>
            <p className="text-sm text-muted-foreground">Based on your food log</p>
          </div>

          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : isError ? (
            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3">
              Could not load recommendations.
            </div>
          ) : items.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {items.map((r) => (
                <RecommendedRecipeCard
                  key={r.recipe_id}
                  recipe={r}
                  variant="mobile"
                  minWidthClass="min-w-[260px] snap-start"
                  onOpenDetails={openDetails}
                  onOpenConsume={openConsume}
                />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground bg-white/70 border border-emerald-100/60 rounded-xl p-3">
              No recommendations yet.
            </div>
          )}
        </div>

        <ConsumeRecipeMobileModal open={consumeOpen} onClose={closeConsume} recipe={activeRecipe} />
      </section>

      <MealDetailsDialog dialog={dialog} />
    </>
  );
};

export default RecommendedRecipesMobile;

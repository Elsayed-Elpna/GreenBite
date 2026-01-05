import { useParams } from "react-router-dom";
import {
  useMealPlanDetail,
  useConfirmPlan,
  useConfirmDay,
  useReplacePlanMeal,
  useSkipPlanMeal,
} from "@/hooks/useMealPlans";
import MealDetailsDialog from "@/components/HomePage/Dialogs/DialogMeals";
import {useDialogone} from "@/hooks/useDialog";
import { toast } from "react-hot-toast";
import MealThumbnail from "@/components/HomePage/Meals/MealThumbnail";
import { getMealdbRecipeById } from "@/api/mealdb.api";

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${tones[tone]}`}>
      {children}
    </span>
  );
}
export default function MealPlanDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError } = useMealPlanDetail(id);
  
  const mealDialog = useDialogone();
  const confirmPlanMutation = useConfirmPlan();
  const confirmDayMutation = useConfirmDay();
  const replaceMutation = useReplacePlanMeal();
  const skipMutation = useSkipPlanMeal();
  const handleViewDetails = (mealSlot) => {
      // If API already includes full details, use them directly
      const hasInlineDetails =
        (mealSlot?.ingredients && mealSlot.ingredients.length) ||
        mealSlot?.instructions ||
        (mealSlot?.steps && mealSlot.steps.length);
  
      if (hasInlineDetails) {
        const recipe = {
          title: mealSlot.title || mealSlot.recipe || "Recipe",
          thumbnail: mealSlot.thumbnail || mealSlot.photo || null,
          cuisine: mealSlot.cuisine || "",
          ingredients: mealSlot.ingredients || [],
          instructions: mealSlot.instructions || (Array.isArray(mealSlot.steps) ? mealSlot.steps.join("\n") : ""),
          mealdb_id: mealSlot.source_mealdb_id || mealSlot.draft_source_mealdb_id || null,
        };
        mealDialog.open(recipe);
        return;
      }
  
      // fallback to MealDB fetch
      const mealdbId = mealSlot?.source_mealdb_id || mealSlot?.draft_source_mealdb_id;
      if (!mealdbId) {
        toast.error("No details available for this meal.");
        return;
      }
      mealDialog.open(() => getMealdbRecipeById(mealdbId));
    };

  // const handleViewDetails = (mealSlot) => {
  //   const mealdbId = mealSlot?.source_mealdb_id;
  //   if (!mealdbId) {
  //     toast.error("No MealDB id found for this meal.");
  //     return;
  //   }
  //   mealDialog.open(() => getMealdbRecipeById(mealdbId));
  // };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-24 bg-white border border-gray-200 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
          Failed to load meal plan.
        </div>
      </div>
    );
  }

  const plan = data;

  const handleConfirmPlan = async () => {
    try {
      await confirmPlanMutation.mutateAsync(plan.id);
      toast.success("Meal plan confirmed.");
    } catch {
      toast.error("Failed to confirm meal plan.");
    }
  };

  const handleConfirmDay = async (dayId) => {
    try {
      await confirmDayMutation.mutateAsync(dayId);
      toast.success("Day confirmed.");
      await refetch?.(); 

    } catch {
      toast.error("Failed to confirm day.");
    }
  };

  const handleReplace = async (mealId) => {
    try {
      await replaceMutation.mutateAsync({ mealId, useAi: true });
      toast.success("Meal replaced.");
    } catch {
      toast.error("Failed to replace meal.");
    }
  };

  const handleSkip = async (mealId) => {
    try {
      await skipMutation.mutateAsync(mealId);
      toast.success("Meal skipped.");
    } catch {
      toast.error("Failed to skip meal.");
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <header className="rounded-3xl border border-gray-200 bg-gradient-to-br from-green-50 via-white to-orange-50 p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Meal Plan #{plan.id}
                </h1>
                <Badge tone={plan.is_confirmed ? "green" : "amber"}>
                  {plan.is_confirmed ? "Confirmed" : "Draft"}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Start: <span className="font-medium">{plan.start_date}</span> ·{" "}
                <span className="font-medium">{plan.days}</span> days
              </p>
            </div>

            {!plan.is_confirmed && (
              <button
                onClick={handleConfirmPlan}
                disabled={confirmPlanMutation.isLoading}
                className="inline-flex items-center justify-center bg-[#7eb685] text-white px-5 py-2.5 rounded-2xl font-semibold shadow-sm hover:opacity-95 disabled:opacity-60 transition"
              >
                {confirmPlanMutation.isLoading ? "Confirming..." : "Confirm plan"}
              </button>
            )}
          </div>
        </header>

        {/* Days */}
        <div className="space-y-4">
          {plan.days_plan.map((day) => (
            <div
              key={day.id}
              className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {day.date}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {day.is_confirmed
                      ? `Confirmed ${day.confirmed_at ? `at ${day.confirmed_at}` : ""}`
                      : "Not confirmed"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone={day.is_confirmed ? "green" : "amber"}>
                    {day.is_confirmed ? "Day confirmed" : "Draft day"}
                  </Badge>

                  {!day.is_confirmed && (
                    <button
                      onClick={() => handleConfirmDay(day.id)}
                      disabled={confirmDayMutation.isLoading}
                      className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60 transition"
                    >
                      {confirmDayMutation.isLoading ? "Confirming..." : "Confirm day"}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {day.meals.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-2xl border p-4 flex gap-3 bg-white hover:shadow-md transition ${
                      m.is_skipped
                        ? "opacity-60 border-red-200 bg-red-50/30"
                        : "border-gray-200"
                    }`}
                  >
                    <MealThumbnail photo={m.photo} mealTime={m.meal_time} alt={m.recipe} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="gray">{m.meal_time}</Badge>
                          {m.is_skipped ? <Badge tone="red">Skipped</Badge> : null}
                          {m.is_replaced ? <Badge tone="blue">Replaced</Badge> : null}
                        </div>

                        {!day.is_confirmed && !m.is_skipped && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReplace(m.id)}
                              disabled={replaceMutation.isLoading}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60 transition"
                            >
                              Replace
                            </button>
                            <button
                              onClick={() => handleSkip(m.id)}
                              disabled={skipMutation.isLoading}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 transition"
                            >
                              Skip
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="mt-2 text-sm font-semibold text-gray-900 truncate">
                        {m.recipe || "No recipe yet"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {(m.source_mealdb_id || m.draft_source_mealdb_id) ? (
                          <button
                            type="button"
                            className="text-xs font-semibold text-[#4f9b5a] hover:underline"
                            onClick={() => handleViewDetails(m)}
                          >
                            View details
                          </button>
                        ) : null}

                        {m.original_recipe && (
                          <p className="text-xs text-gray-500">
                            Originally: <span className="font-medium">{m.original_recipe}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <MealDetailsDialog dialog={mealDialog} />
      </div>
    </div>
  );
}
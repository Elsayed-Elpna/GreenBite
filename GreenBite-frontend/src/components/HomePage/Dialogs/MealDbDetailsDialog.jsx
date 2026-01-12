import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

import { getMealdbRecipeById } from "@/api/mealdb.api";
import useSaveMeal from "@/hooks/useSaveMeals";
import {
  mapMealDbFromBackend,
  formatIngredient,
  instructionsToSteps,
  buildSavePayloadFromMealDb,
} from "@/utils/mealdb.mapper";

export default function MealDbDetailsDialog({ isOpen, onClose, mealdbId }) {
  //Hook: router
  const navigate = useNavigate();

  //Hook: mutation (must be called every render)
  const saveMealMutation = useSaveMeal(mealdbId);

  //Hook: query (must be called every render; enabled handles skipping)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["mealdb", mealdbId],
    queryFn: async () => {
      const raw = await getMealdbRecipeById(mealdbId);
      return mapMealDbFromBackend(raw);
    },
    enabled: isOpen && !!mealdbId,
    staleTime: 2 * 60 * 1000,
  });

  //Lock page scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  //After hooks: safe early return
  if (!isOpen) return null;

  const steps = instructionsToSteps(data?.instructions);

  const handleSave = () => {
    // if data not ready, don’t try saving
    if (!data) return;

    saveMealMutation.mutate(buildSavePayloadFromMealDb(data), {
      onSuccess: () => {
        onClose();
        // use replace so user doesn't go “back” to the modal state
        navigate("/home", { replace: true });
      },
    });
  };

  //PORTAL: render modal at document.body so it’s above all layouts/Swiper/sidebar
  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-[99999] flex items-center justify-center">
      <div className="relative bg-white text-gray-900 rounded-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto z-[100000]">
        {/* Header */}
        <div className="relative mb-4">
          <h2 className="text-xl font-bold text-center">
            {data?.title || "Meal details"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 text-gray-500 hover:text-red-500"
            aria-label="Close"
            title="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Loading / Error */}
        {isLoading ? (
          <p className="text-center text-sm text-gray-600">Loading...</p>
        ) : isError ? (
          <p className="text-center text-sm text-red-600">
            Failed to load meal details.
          </p>
        ) : !data ? (
          <p className="text-center text-sm text-gray-600">No data.</p>
        ) : (
          <>
            {/* Image */}
            {data.thumbnail ? (
              <img
                src={data.thumbnail}
                alt={data.title}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
            ) : null}

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {data.category ? (
                <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                  {data.category}
                </span>
              ) : null}

              {data.cuisine ? (
                <span className="px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                  {data.cuisine}
                </span>
              ) : null}

              {Array.isArray(data.tags) && data.tags.length > 0 ? (
                <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                  {data.tags.join(" • ")}
                </span>
              ) : null}
            </div>

            {/* Ingredients */}
            <h3 className="font-semibold mb-2">Ingredients</h3>
            <ul className="list-disc pl-6 mb-6 text-sm">
              {(data.ingredients || []).map((i, idx) => (
                <li key={idx}>{formatIngredient(i) || "—"}</li>
              ))}
            </ul>

            {/* Steps */}
            <h3 className="font-semibold mb-2">Steps</h3>
            {!data?.instructions ? (
              <p className="text-sm text-gray-500">No steps found.</p>
            ) : (
              <div className="mb-6 text-sm whitespace-pre-line break-words leading-relaxed">
                {data.instructions}
              </div>
            )}

            {/* Actions at end */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saveMealMutation.isPending}
                className="px-6 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {saveMealMutation.isPending ? "Saving..." : "Save meal"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>

              {saveMealMutation.isError ? (
                <p className="text-xs text-red-600">
                  {saveMealMutation.error?.message || "Save failed"}
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
import {
  MEAL_TIME_COLORS,
  getCuisineVisuals,
} from "@/utils/constants";
import { Clock, Utensils, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MealDetailsDialog({ dialog }) {
  const { isOpen, close, data, loading, activeIndex } = dialog;
  const navigate = useNavigate();
  const meal = data[activeIndex];

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">Loading meal...</div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl text-red-500">
          No meal data found
        </div>
      </div>
    );
  }

  const cuisineVisuals = getCuisineVisuals(meal.cuisine);
  const mealTimeKey =
    meal.mealTime?.charAt(0).toUpperCase() +
    meal.mealTime?.slice(1).toLowerCase();

  const handleAddLeftovers = () => {
    console.log("Add leftovers for meal", meal.id);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-orange-50 via-white to-green-50 rounded-xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh]">

        {/* ================= Header ================= */}
        <div className="relative mb-4 px-8">
          <h2 className="text-xl lg:text-2xl font-bold text-center">
            {meal.title || meal.recipe}
          </h2>

          <button
            onClick={close}
            className="cursor-pointer absolute top-0 right-0 mt-2 mr-2 text-gray-500 hover:text-red-500 transition"
          >
            <X size={24} />
          </button>
        </div>


        <div className="h-px bg-gray-200 mb-4" />

        {/* ================= Pills ================= */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {meal.cuisine && (
            <span className={`px-3 py-2 rounded-full text-xs font-medium ${cuisineVisuals.pill}`}>
              {meal.cuisine}
            </span>
          )}

          {meal.mealTime && (
            <span
              className={`px-3 py-2 rounded-full text-xs font-medium ${MEAL_TIME_COLORS[mealTimeKey] || "bg-gray-100 text-gray-700"}`}
            >
              {meal.mealTime}
            </span>
          )}

          {meal.calories && (
            <div className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-yellow-100 text-orange-700">
              <span>🔥</span>
              <span>{meal.calories} Kcal</span>
            </div>
          )}

          {meal.serving && (
            <div className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <Utensils size={14} />
              <span>{meal.serving} servings</span>
            </div>
          )}


        </div>

        {/* ================= Ingredients ================= */}
        <h3 className="font-semibold mb-2">Ingredients</h3>
        <ul className="list-disc pl-6 mb-6 text-sm lg:text-base">
          {meal.ingredients.map((i, idx) => (
            <li key={idx}>{i}</li>
          ))}
        </ul>

        <div className="h-px bg-gray-200 mb-6" />

        {/* ================= Steps ================= */}
        <h3 className="font-semibold mb-2">Steps</h3>
        <ol className="list-decimal pl-6 mb-6 text-sm lg:text-base">
          {meal.steps.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ol>

        {/* ================= Waste Section ================= */}
        <div className="h-px bg-gray-200 mb-6" />

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Predicted Waste</h3>
          <button
            onClick={() => navigate("/home/wastelog")}
            className="text-sm text-blue-600 hover:underline"
          >
            View Waste Log →
          </button>
        </div>

        {meal.waste?.length > 0 ? (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm border border-green-600 min-w-[600px]">
              <thead className="bg-green-100">
                <tr>
                  <th className="p-2 text-left">Item</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Disposal</th>
                  <th className="p-2 text-left">Reuse Ideas</th>
                </tr>
              </thead>
              <tbody>
                {meal.waste.map((w, idx) => (
                  <tr key={idx} className="border-t border-green-600 hover:bg-green-50">
                    <td className="p-2 font-medium">{w.name}</td>
                    <td className="p-2">{w.estimated_amount}{w.unit}</td>
                    <td className="p-2 capitalize">{w.disposal}</td>
                    <td className="p-2">
                      {w.reuse_ideas?.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {w.reuse_ideas.map((idea, idx) => (
                            <li key={idx}>{idea}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            No predicted waste for this meal.
          </p>
        )}

        {/* ================= Leftovers Callout ================= */}
        {!meal.leftovers_saved && (
          <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">
              Is there any leftovers?
            </p>
            <button
              onClick={handleAddLeftovers}
              className="bg-green-500 text-white px-5 py-2 rounded-md
              hover:bg-green-600 transition transform hover:scale-105"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

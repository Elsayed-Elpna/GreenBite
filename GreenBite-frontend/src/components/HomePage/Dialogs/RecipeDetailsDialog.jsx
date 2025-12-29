// src/components/dialogs/RecipeDetailsDialog.jsx
import { MEAL_TIME_COLORS, DIFFICULTY_COLORS, getCuisineVisuals } from "@/utils/constants";
import { Clock, Utensils } from "lucide-react";
import { saveMeal } from "@/api/recipes.api";
import { useState } from "react";

export default function RecipeDetailsDialog({ dialog }) {
  const { isOpen, close, data: recipes, activeIndex, prev, next } = dialog;
  const [saving, setSaving] = useState(false);

  if (!isOpen || !recipes?.length) return null;

  const recipe = recipes[activeIndex];
  const cuisineVisuals = getCuisineVisuals(recipe.cuisine);


  const handleSaveMeal = async () => {
    try {
      setSaving(true);
      await saveMeal(recipe);
      alert("Meal saved successfully!");
    } catch (error) {
      console.error("Failed to save meal:", error);
      alert("Failed to save meal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh]">
        {/* Top Pagination */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prev}
            className="px-4 py-2 border rounded-md disabled:opacity-50 enabled:hover:bg-gray-100 transition"
            disabled={activeIndex === 0}
          >
            Previous
          </button>

          <h2 className="text-2xl font-bold text-center">{recipe.title}</h2>

          <button
            onClick={next}
            className="px-4 py-2 border rounded-md disabled:opacity-50 enabled:hover:bg-gray-100 transition"
            disabled={activeIndex === recipes.length - 1}
          >
            Next
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {/* Cuisine */}
          {recipe.cuisine && (
            <span
              className={`px-3 py-2 rounded-full text-xs font-medium ${cuisineVisuals.pill}`}
            >
              {recipe.cuisine}
            </span>
          )}

          {/* Meal Time */}
          {recipe.mealTime && (
            <span
              className={`px-3 py-2 rounded-full text-xs font-medium ${MEAL_TIME_COLORS[recipe.mealTime.charAt(0).toUpperCase() + recipe.mealTime.slice(1)] ||
                "bg-gray-100 text-gray-700"
                }`}
            >
              {recipe.mealTime}
            </span>
          )}

          {/* Difficulty */}
          {recipe.difficulty && (
            <span
              className={`bg-gray-100 px-3 py-2 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[recipe.difficulty.toLowerCase()]
                }`}
            >
              {recipe.difficulty.charAt(0).toUpperCase() +
                recipe.difficulty.slice(1)}
            </span>
          )}

          {/* Time */}

          {recipe.time && (
            <div className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <Clock color="green" size={16} />
              <span>{recipe.time} min</span>
            </div>
          )}

          {/* Servings */}
          {recipe.servings && (
            <div className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <Utensils size={16} />
              <span>{recipe.servings} servings</span>
            </div>
          )}
        </div>

        {/* Description */}
        {recipe.description && (
          <>
            <h3 className="font-semibold mt-4 mb-2">Description</h3>
            <p className="text-gray-600 mb-4">{recipe.description}</p>
          </>
        )}

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <>
            <h3 className="font-semibold mt-4 mb-2">Ingredients</h3>
            <ul className="list-disc pl-6 text-sm lg:text-base">
              {recipe.ingredients.map((i, idx) => (
                <li key={idx}>
                  {i.charAt(0).toUpperCase() + i.slice(1)}
                </li>
              ))}
            </ul>
          </>
        )}


        {/* Steps */}
        {recipe.steps?.length > 0 && (
          <>
            <h3 className="font-semibold mt-4 mb-2">Steps</h3>
            <ol className="list-decimal pl-6 text-sm lg:text-base">
              {recipe.steps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>
          </>
        )}

        {/* Save Meal & Close */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleSaveMeal}
            disabled={saving}
            className={`px-4 py-2 rounded-md text-white transition ${saving ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
              }`}
          >
            {saving ? "Saving..." : "Save Meal"}
          </button>
          <button
            onClick={close}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


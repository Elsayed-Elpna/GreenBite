import ReactCountryFlag from "react-country-flag";
import { Clock, Utensils } from "lucide-react";
import {
  DIFFICULTY_COLORS,
  MEAL_TIME_COLORS,
  getCuisineVisuals,
} from "@/utils/constants";

export default function RecipeCard({ recipe, onView }) {
  const cuisineVisuals = getCuisineVisuals(recipe.cuisine);

  return (
    <div
      className={`
        bg-white rounded-2xl p-6
        ${cuisineVisuals.shadowClass}
        flex flex-col items-center text-center
        transition-transform duration-300
        hover:scale-105
      `}
    >
      {/* Flag */}
      {cuisineVisuals.countryCode && (
        <div className="mb-3">
          <ReactCountryFlag
            svg
            countryCode={cuisineVisuals.countryCode}
            style={{ width: "2.2em", height: "2.2em" }}
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold mb-1">
        {recipe.title}
      </h3>

      {/* Pills */}
      <div className="flex gap-2 mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${cuisineVisuals.pill}`}
        >
          {recipe.cuisine}
        </span>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            MEAL_TIME_COLORS[recipe.mealTime] ||
            "bg-gray-100 text-gray-700"
          }`}
        >
          {recipe.mealTime}
        </span>
      </div>

      {/* Meta */}
      <div className="flex gap-6 text-sm text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{recipe.time} min</span>
        </div>

        <div className="flex items-center gap-1">
          <Utensils size={16} />
          <span>{recipe.servings} servings</span>
        </div>
      </div>

      {/* Difficulty */}
      <p
        className={`text-sm font-medium mb-4 ${
          DIFFICULTY_COLORS[recipe.difficulty]
        }`}
      >
        Difficulty: {recipe.difficulty}
      </p>

      <button
        onClick={onView}
        className="
          w-full bg-orange-500 text-white
          py-2 rounded-lg font-medium
          hover:bg-orange-600 transition
        "
      >
        View Details
      </button>
    </div>
  );
}

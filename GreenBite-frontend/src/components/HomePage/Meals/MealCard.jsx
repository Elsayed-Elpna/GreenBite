import { Heart } from "lucide-react";
import { useState } from "react";

import {
  MEAL_TIME_COLORS,
  MEAL_TIME_IMAGES,
  DEFAULT_MEAL_IMAGE,
  INGREDIENT_PILL_COLORS,
} from "@/utils/constants";

export default function MealCard({ meal, onDelete, onView }) {
  const {
    title,
    ingredients = [],
    serving,
    cuisine,
    mealTime,
    hasLeftovers,
    createdAt,
    cuisineVisuals,
    calories,
  } = meal;

  const mealTimeKey =
    mealTime?.charAt(0).toUpperCase() + mealTime?.slice(1).toLowerCase();

  const [liked, setLiked] = useState(false);

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden flex flex-col justify-between
  ${cuisineVisuals.shadowClass}`}
    >
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center p-6">
        <span
          className={`px-4 py-1 rounded-full text-sm font-medium
      ${hasLeftovers ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {hasLeftovers ? "Has leftovers" : "No leftovers"}
        </span>

        <span className="text-gray-500 text-sm">
          {new Date(createdAt).toLocaleString()}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* ===== Content ===== */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-6">
        {/* Image */}
        <img
          src={MEAL_TIME_IMAGES[mealTimeKey] || DEFAULT_MEAL_IMAGE}
          alt={mealTime}
          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full object-cover mx-auto lg:mx-0"
        />

        {/* Text */}
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 text-center lg:text-left">
            {title}
          </h3>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mb-4 font-medium justify-center lg:justify-start">
            <span className={`px-3 py-1 rounded-full text-xs ${cuisineVisuals.pill}`}>
              {cuisine}
            </span>

            <span
              className={`px-3 py-1 rounded-full text-xs ${MEAL_TIME_COLORS[mealTimeKey]}`}
            >
              {mealTime}
            </span>

            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-yellow-100 text-orange-700">
              <span>🔥</span>
              <span>{calories} Kcal</span>
            </div>

            <span className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
              {serving} servings
            </span>
          </div>

          {/* Ingredients */}
          <h4 className="font-medium mb-4 text-center lg:text-left">Ingredients:</h4>
          <div className="flex flex-wrap gap-2 font-medium justify-center lg:justify-start">
            {ingredients.slice(0, 4).map((ing, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-xs ${INGREDIENT_PILL_COLORS[i % INGREDIENT_PILL_COLORS.length]
                  }`}
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Footer ===== */}
      <div className="flex justify-between items-center bg-gray-100 p-6">
        {/* Buttons on the left */}
        <div className="flex gap-3 flex-none">
          <button
            onClick={onView}
            className="cursor-pointer bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition shadow"
          >
            View details
          </button>
          <button
            onClick={onDelete}
            className="cursor-pointer bg-gray-600 text-white  px-4 py-2 rounded-lg hover:bg-gray-700 transition shadow"
          >
            Delete
          </button>
        </div>

        {/* Heart on the right */}
        <Heart
          size={32}
          className={`cursor-pointer transition-colors duration-200 ${liked ? "fill-red-500 text-red-500" : "fill-transparent text-red-500"
            }`}
          onClick={() => setLiked((prev) => !prev)}
        />
      </div>
    </div>

  );
}

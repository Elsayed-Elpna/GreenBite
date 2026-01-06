import React from "react";
import ReactCountryFlag from "react-country-flag";
import { FaPlus } from "react-icons/fa6";

const CARD_HEIGHT = "h-[140px]";

const MenuCard = ({
  recipe,
  loading,
  error,
  onRefresh,
  onAdd,
  cuisineVisuals, // pass this from parent (same as RecipeCard.jsx usage)
}) => {
  const safeRecipe = recipe ?? {};
  const title = safeRecipe.title || "-";
  const image = safeRecipe.thumbnail || "https://placehold.co/64x64";
  const category = safeRecipe.category || "Category";
  const cuisine = safeRecipe.cuisine || "Cuisine";

  // --- Loading state (keeps the same card height) ---
  if (loading) {
    return (
      <div className={`self-stretch mt-4 bg-white rounded-2xl p-4 flex flex-col ${CARD_HEIGHT}`}>
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="w-16 h-16 rounded-xl bg-neutral-100 flex-shrink-0" />
          <div className="flex-1 flex flex-col min-w-0">
            <div className="h-4 w-3/4 bg-neutral-100 rounded" />
            <div className="mt-2 h-6 w-24 bg-neutral-100 rounded-md" />
            <div className="flex-1" />
          </div>
        </div>

        {/* Full-width divider */}
        <div className="h-px bg-neutral-200 w-full mt-3" />

        {/* Footer skeleton */}
        <div className="pt-3 flex items-center gap-2">
          <div className="w-6 h-4 bg-neutral-100 rounded" />
          <div className="h-4 w-1/2 bg-neutral-100 rounded" />
        </div>
      </div>
    );
  }

  // --- Error state (keeps same card height + full-width divider) ---
  if (error) {
    return (
      <div className={`self-stretch mt-4 bg-white rounded-2xl p-4 flex flex-col ${CARD_HEIGHT}`}>
        <div className="flex gap-4 flex-1 min-h-0">
          <div className="w-16 h-16 rounded-xl bg-neutral-100 flex-shrink-0" />
          <div className="flex-1 flex flex-col min-w-0">
            <h4 className="text-xs font-semibold text-zinc-800">Recommended Menu</h4>
            <p className="mt-1 text-xs text-red-600 line-clamp-2">{error}</p>
            <div className="flex-1" />
          </div>
        </div>

        {/* Full-width divider */}
        <div className="h-px bg-neutral-200 w-full mt-3" />

        <div className="pt-3">
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs underline text-zinc-800 w-fit"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // --- Normal card ---
  return (
    <div className={`self-stretch mt-4 bg-white rounded-2xl p-4 flex flex-col ${CARD_HEIGHT}`}>
      {/* Top row (image + content) */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Image (fixed size) */}
        <div className="w-16 h-16 relative bg-lime-200 rounded-xl overflow-hidden flex-shrink-0">
          <img className="w-full h-full object-cover" src={image} alt={title} loading="lazy" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Title + add button */}
          <div className="flex items-start justify-between gap-3">
            <div className="text-zinc-800 text-xs font-semibold leading-4 line-clamp-2">
              {title}
            </div>

            <button
              type="button"
              onClick={onAdd}
              className="w-9 h-9 bg-lime-300 rounded-md flex items-center justify-center flex-shrink-0"
              aria-label="Add"
            >
              <FaPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Category tag */}
          <div className="mt-2">
            <span className="px-1.5 py-1 bg-lime-200 rounded-md inline-flex justify-center items-center">
              <span className="text-zinc-800 text-xs font-normal leading-3">{category}</span>
            </span>
          </div>

          {/* Push divider/footer to bottom */}
          <div className="flex-1" />
        </div>
      </div>

      {/* Divider: FULL WIDTH of the card */}
      <div className="h-px bg-neutral-200 w-full mt-3" />

      {/* Footer: cuisine + flag beside it */}
      <div className="pt-3 flex items-center gap-2 min-w-0">
        {cuisineVisuals?.countryCode && (
          <ReactCountryFlag
            svg
            countryCode={cuisineVisuals.countryCode}
            style={{ width: "1.3em", height: "1.3em" }}
            aria-label={cuisineVisuals.countryCode}
          />
        )}

        <span className="text-xs text-zinc-800 font-normal leading-3 truncate">
          {cuisine}
        </span>
      </div>
    </div>
  );
};

export default MenuCard;
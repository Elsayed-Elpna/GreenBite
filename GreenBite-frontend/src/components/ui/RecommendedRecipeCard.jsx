import React from "react";
import { Flame, Clock, ChefHat, Utensils } from "lucide-react";
import { HOME_CARD } from "@/utils/HomeTheme";

const badgeClass =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold " +
  "bg-emerald-100/60 text-emerald-900 border border-emerald-200/50";

const RecipeBadges = ({ r }) => {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {r?.mealTime ? (
        <span className={badgeClass}>
          <Clock className="w-3.5 h-3.5" />
          {r.mealTime}
        </span>
      ) : null}

      {r?.difficulty ? (
        <span className={badgeClass}>
          <ChefHat className="w-3.5 h-3.5" />
          {r.difficulty}
        </span>
      ) : null}

      <span className={badgeClass}>
        <Flame className="w-3.5 h-3.5" />
        {r?.match?.matched_ingredients_norm?.length ?? 0} match
      </span>
    </div>
  );
};

export default function RecommendedRecipeCard({
  recipe,
  variant = "mobile", // "mobile" | "desktop"
  onOpenDetails,
  onOpenConsume,
  className = "",
  minWidthClass = "",
}) {
  const r = recipe;

  if (variant === "desktop") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetails?.(r)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpenDetails?.(r);
        }}
        className={`${HOME_CARD} overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-200 ${className}`}
      >
        <div className="flex gap-3 p-3">
          <div className="w-20 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
            <img
              src={r.thumbnail}
              alt={r.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground line-clamp-2">{r.title}</p>

            <RecipeBadges r={r} />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenConsume?.(r);
              }}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition"
            >
              <Utensils className="w-4 h-4" />
              Consume (preview)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // mobile variant
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails?.(r)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpenDetails?.(r);
      }}
      className={`${minWidthClass} ${HOME_CARD} overflow-hidden text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-200 ${className}`}
    >
      <div className="h-32 bg-gray-100">
        <img
          src={r.thumbnail}
          alt={r.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>

      <div className="p-4">
        <p className="text-base font-semibold text-foreground line-clamp-2">{r.title}</p>

        <RecipeBadges r={r} />

        {r.why ? (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-3">{r.why}</p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2">Uses ingredients you already have.</p>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenConsume?.(r);
          }}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white/70 px-3 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition"
        >
          <Utensils className="w-4 h-4" />
          Use ingredients (preview)
        </button>
      </div>
    </div>
  );
}

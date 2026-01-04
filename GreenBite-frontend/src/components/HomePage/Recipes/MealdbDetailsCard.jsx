import { useMemo, useState } from "react";
import { normalizeIngredients } from "@/utils/ingredients";
import { getCuisineVisuals } from "@/utils/constants";
import { ChefHat, ClipboardList, Flame, MapPin, Tag } from "lucide-react";

function Chip({ icon: Icon, children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    green: "bg-green-50 text-green-700 border-green-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${tones[tone]}`}
    >
      {Icon ? <Icon size={14} /> : null}
      {children}
    </span>
  );
}

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          {Icon ? (
            <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <Icon size={16} className="text-gray-700" />
            </span>
          ) : null}
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <span className="text-xs text-gray-500">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? <div className="px-4 pb-4">{children}</div> : null}
    </div>
  );
}

export default function MealDbDetailsCard({ recipe }) {
  const data = recipe || {};
  const cuisineVisuals = getCuisineVisuals(data.cuisine || "");

  const tags = useMemo(() => {
    if (Array.isArray(data.tags)) return data.tags.filter(Boolean);
    if (typeof data.tags === "string")
      return data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    return [];
  }, [data.tags]);

  const ingredients = useMemo(
    () => normalizeIngredients(data.ingredients || []),
    [data.ingredients]
  );

  const hasImage = Boolean(data.thumbnail || cuisineVisuals.image);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-xl overflow-hidden">
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-transparent to-orange-400/20" />
        <div className="h-56 sm:h-64 bg-gray-100">
          {hasImage ? (
            <img
              src={data.thumbnail || cuisineVisuals.image}
              alt={data.title || "Recipe image"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl p-4">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 leading-snug">
              {data.title || "Recipe"}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {data.cuisine ? (
                <Chip icon={MapPin} tone="green">
                  {data.cuisine}
                </Chip>
              ) : null}

              {data.category ? (
                <Chip icon={ChefHat} tone="blue">
                  {data.category}
                </Chip>
              ) : null}

              {data.difficulty ? (
                <Chip icon={Flame} tone="orange">
                  {data.difficulty}
                </Chip>
              ) : null}

              {data.mealdb_id ? (
                <Chip tone="gray">
                  MealDB: <span className="font-semibold">{data.mealdb_id}</span>
                </Chip>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-b from-white via-white to-green-50/40">
        {/* Tags */}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map((t) => (
              <Chip key={t} icon={Tag} tone="gray">
                {t}
              </Chip>
            ))}
          </div>
        ) : null}

        {/* Ingredients */}
        <Section title="Ingredients" icon={ClipboardList} defaultOpen>
          {ingredients.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {ingredients.map((ing, idx) => (
                <div
                  key={`${ing}-${idx}`}
                  className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <span className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="text-gray-800">{ing}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No ingredients available.</p>
          )}
        </Section>

        {/* Instructions */}
        <Section title="Instructions" icon={ChefHat} defaultOpen={false}>
          {data.instructions ? (
            <p className="text-sm leading-7 text-gray-700 whitespace-pre-line">
              {data.instructions}
            </p>
          ) : (
            <p className="text-sm text-gray-500">No instructions available.</p>
          )}
        </Section>

        {/* Footer meta */}
        <div className="pt-2 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
          {data.recipe_id ? <span>Internal recipe id: {data.recipe_id}</span> : null}
          {data.updated_at ? <span>Updated: {String(data.updated_at).slice(0, 10)}</span> : null}
        </div>
      </div>
    </div>
  );
}
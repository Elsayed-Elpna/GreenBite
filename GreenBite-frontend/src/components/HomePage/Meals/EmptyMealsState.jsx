import { PlusCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyMealsState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-40 px-6 lg:py-60">
      
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
        <Sparkles className="h-10 w-10 text-emerald-600" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-800">
        No meals saved yet
      </h2>

      {/* Description */}
      <p className="mt-3 max-w-md text-gray-500">
        You haven’t saved any meals so far. Generate a recipe with AI or save
        meals you love to track them and reduce food waste.
      </p>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/home/recipes"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-emerald-700 transition"
        >
          <PlusCircle className="h-4 w-4" />
          Generate a recipe
        </Link>

        <Link
          to="/explore"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white"
        >
          Browse recipes
        </Link>
      </div>
    </div>
  );
}

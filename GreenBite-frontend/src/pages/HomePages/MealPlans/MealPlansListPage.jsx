import { Link } from "react-router-dom";
import { useMealPlansList, useDeleteMealPlan } from "@/hooks/useMealPlans";

function StatusBadge({ confirmed }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        confirmed
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
    >
      {confirmed ? "Confirmed" : "Draft"}
    </span>
  );
}

export default function MealPlansListPage() {
  const { data, isLoading, isError } = useMealPlansList();
  const deleteMutation = useDeleteMealPlan();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-white border border-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
          Failed to load meal plans.
        </div>
      </div>
    );
  }

  const plans = data || [];

  if (!plans.length) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-green-50 via-white to-orange-50 p-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Meal Plans
            </h1>
            <p className="mt-2 text-gray-600">
              You don’t have any meal plans yet. Generate one to get started.
            </p>

            <div className="mt-6">
              <Link
                to="/home/mealplans/generate"
                className="inline-flex items-center justify-center bg-[#7eb685] text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:opacity-95 transition"
              >
                Generate a meal plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              My Meal Plans
            </h1>
            <p className="text-sm text-gray-600">
              Manage your generated plans and review details.
            </p>
          </div>

          <Link
            to="/home/mealplans/generate"
            className="inline-flex items-center justify-center bg-[#7eb685] text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:opacity-95 transition"
          >
            New plan
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="group bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      Plan #{plan.id}
                    </p>
                    <StatusBadge confirmed={plan.is_confirmed} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Start: <span className="font-medium">{plan.start_date}</span>{" "}
                    · <span className="font-medium">{plan.days}</span> days
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/home/mealplans/${plan.id}`}
                    className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                  >
                    View
                  </Link>

                  {!plan.is_confirmed && (
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(plan.id)}
                      disabled={deleteMutation.isLoading}
                      className="px-4 py-2 text-sm font-semibold rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-60 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 h-px bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
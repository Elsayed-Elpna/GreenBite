import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGenerateMealPlan } from "@/hooks/useMealPlans";

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-900">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-2 text-xs text-gray-500">{hint}</p> : null}
    </label>
  );
}

export default function GenerateMealPlanPage() {
  const [days, setDays] = useState(3);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [useAi, setUseAi] = useState(false);
  const [startDate, setStartDate] = useState("");
  const generateMutation = useGenerateMealPlan();
  const navigate = useNavigate();

  const requiresUpgrade = days > 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiresUpgrade) return;

    try {
      const payload = {
        days,
        meals_per_day: mealsPerDay,
        use_ai_fallback: useAi,
      };
      if (startDate) payload.start_date = startDate;
      const res = await generateMutation.mutateAsync(payload);
      if (res.meal_plan_id) navigate(`/home/mealplans/${res.meal_plan_id}`);
    } catch {
      // handled by mutation state/toast
    }
  };

  const handleUpgrade = () => {
    // TODO: change route to your pricing/upgrade page if you have one
    navigate("/home/upgrade");
  };

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto">
        <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-green-50 via-white to-orange-50 p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">
            Generate Meal Plan
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Build a plan based on available inventory. Enable AI fallback if you
            want suggestions when recipes are missing.
          </p>

          {/* ✅ Upgrade banner */}
          {requiresUpgrade && (
            <div className="mt-5 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Upgrade to generate plans longer than 10 days
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Your current plan supports up to{" "}
                    <span className="font-semibold">10 days</span>. You selected{" "}
                    <span className="font-semibold">{days} days</span>.
                  </p>

                  <ul className="mt-3 space-y-1 text-xs text-gray-700">
                    <li>• Longer plans (up to 30 days)</li>
                    <li>• More meal variety & smarter AI suggestions</li>
                    <li>• Faster generation priority</li>
                  </ul>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#7eb685] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition"
                  >
                    Upgrade
                  </button>
                  <p className="mt-2 text-[11px] text-gray-500 text-center">
                    Starts at Pro
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field label="Start Date (optional)" hint="Leave empty to start today.">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#7eb685]/40"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Days" hint="1 to 30">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#7eb685]/40"
                />
              </Field>

              <Field label="Meals per day" hint="1 to 4">
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={mealsPerDay}
                  onChange={(e) => setMealsPerDay(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#7eb685]/40"
                />
              </Field>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <input
                type="checkbox"
                checked={useAi}
                onChange={(e) => setUseAi(e.target.checked)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Use AI fallback
                </p>
                <p className="text-xs text-gray-600">
                  If you run out of matching recipes, we’ll suggest AI recipes.
                </p>
              </div>
            </label>

            <button
              type="submit"
              disabled={generateMutation.isLoading || requiresUpgrade}
              className="w-full bg-[#7eb685] text-white px-4 py-3 rounded-2xl font-semibold shadow-sm hover:opacity-95 disabled:opacity-60 transition"
              title={requiresUpgrade ? "Upgrade required for >10 days" : undefined}
            >
              {requiresUpgrade
                ? "Upgrade to continue"
                : generateMutation.isLoading
                ? "Generating..."
                : "Generate"}
            </button>

            {generateMutation.isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
                Failed to generate meal plan. Please try again.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
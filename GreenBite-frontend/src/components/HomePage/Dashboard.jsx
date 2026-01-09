import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowUpRight, ArrowDownRight, Box } from "lucide-react";
import { getFoodLogSummary } from "@/api/foodlog.api";
import { CATEGORY_IMAGES } from "@/utils/constants";

import StatCard from "@/components/ui/StatCard";
import CollapseToggle from "@/components/ui/CollapseToggle";
import Collapsible from "@/components/ui/Collapsible";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* tiny sparkline - accepts number[] */
const Sparkline = ({ data = [], className = "" }) => {
  if (!data || data.length === 0) return null;
  const w = 64;
  const h = 20;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className={cn("inline-block", className)} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const DashboardSummary = () => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: getFoodLogSummary,
    staleTime: 60 * 1000,
  });

  const summary = data || {};
  const byCategory = summary.by_category || {};

  const stats = useMemo(
    () => [
      {
        id: "total_items",
        label: "Total items",
        value: summary.total_items ?? 0,
        icon: Box,
        history: [Math.max(0, (summary.total_items ?? 0) - 3), Math.max(0, (summary.total_items ?? 0) - 1), summary.total_items ?? 0],
      },
      {
        id: "unique_ingredients",
        label: "Unique ingredients",
        value: summary.unique_ingredients ?? 0,
        icon: Box,
        history: [Math.max(0, (summary.unique_ingredients ?? 0) - 2), summary.unique_ingredients ?? 0],
      },
      {
        id: "expiring_soon",
        label: "Expiring soon",
        value: summary.expiring_soon ?? 0,
        icon: ArrowDownRight,
        history: [Math.max(0, (summary.expiring_soon ?? 0) - 1), summary.expiring_soon ?? 0],
      },
      {
        id: "categories",
        label: "Categories",
        value: Object.keys(byCategory).length,
        icon: Box,
        history: Object.values(byCategory || {}).slice(0, 4).map((c) => c.count ?? 0),
      },
    ],
    [summary.total_items, summary.unique_ingredients, summary.expiring_soon, byCategory]
  );

  const updatedLabel = useMemo(() => {
    const ts = summary.generated_at || summary.updated_at || null;
    if (!ts) return "Live";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "Live";
    return `Updated ${d.toLocaleString()}`;
  }, [summary.generated_at, summary.updated_at]);

  return (
    <section className="py-4 rounded-2xl p-6
    bg-gradient-to-r from-emerald-50/60 via-green-50/50 to-orange-50/50
    border border-emerald-100/70
    shadow-sm
  ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="
    mb-6 ">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Dashboard Summary</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your food inventory at a glance — keep items fresh, reduce waste.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <CollapseToggle
                open={detailsOpen}
                onToggle={() => setDetailsOpen((v) => !v)}
                controlsId="dashboard-details"
              />
              {/* <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">{updatedLabel}</div> */}
            </div>
          </div>
        </div>


        {/* mobile toggle (since header toggle is hidden on small screens) */}
        <div className="flex sm:hidden items-center justify-end mb-6">
          <CollapseToggle
            open={detailsOpen}
            onToggle={() => setDetailsOpen((v) => !v)}
            controlsId="dashboard-details"
          />
        </div>

        {/* Collapsible details */}
        <Collapsible id="dashboard-details" open={detailsOpen} className="" maxHeight="1400px">
        {/* 4 KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          {isLoading
            ? [1, 2, 3, 4].map((i) => <div key={i} className="animate-pulse h-28 rounded-2xl bg-white/60" />)
            : isError
            ? [1, 2, 3, 4].map((i) => (
                <Card key={i} className="h-28 rounded-2xl border border-rose-100 bg-white">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                      <ArrowDownRight className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">—</p>
                      <p className="text-sm text-muted-foreground">Error</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => {
                const delta =
                  stat.history && stat.history.length >= 2
                    ? Math.round(((stat.history[stat.history.length - 1] - stat.history[0]) / Math.max(1, stat.history[0])) * 100)
                    : 0;

                return (
                  <StatCard
                    key={stat.id}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                    delta={delta}
                    sparkline={<Sparkline data={stat.history || []} className="text-muted-foreground" />}
                  />
                );
              })}
        </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average days */}
            <Card className="rounded-2xl border border-green-100">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Average days until expiry</p>
                <p className="text-2xl font-bold text-foreground">{summary.avg_days_left ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-2">From items expiring soon</p>
              </CardContent>
            </Card>

            {/* Soonest */}
            <Card className="rounded-2xl border border-green-100">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={(summary.soonest_expiring && (CATEGORY_IMAGES[(summary.soonest_expiring.category || "").toLowerCase()] || CATEGORY_IMAGES.other)) || CATEGORY_IMAGES.other}
                    alt={summary.soonest_expiring?.name || "soonest"}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = CATEGORY_IMAGES.other)}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Soonest expiring</p>
                  <p className="text-base font-semibold text-foreground">{summary.soonest_expiring?.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {summary.soonest_expiring
                      ? `${summary.soonest_expiring.days_left} days • ${new Date(summary.soonest_expiring.expiry_date || summary.soonest_expiring.expiryDate).toLocaleDateString()}`
                      : "No data"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Top expiring list */}
            <Card className="rounded-2xl border border-green-100">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Top expiring items</p>
                <div className="mt-3 space-y-2 max-h-36 overflow-auto">
                  {(summary.top_expiring || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">—</p>
                  ) : (
                    (summary.top_expiring || []).map((it) => (
                      <div key={it.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100">
                            <img
                              src={(it.category && CATEGORY_IMAGES[it.category.toLowerCase()]) || CATEGORY_IMAGES.other}
                              alt={it.name}
                              className="w-full h-full object-cover"
                              onError={(e) => (e.currentTarget.src = CATEGORY_IMAGES.other)}
                            />
                          </div>
                          <div>
                            <p className="text-sm text-foreground truncate">{it.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {it.quantity} {it.unit || ""}
                            </p>
                          </div>
                        </div>
                        <div className={it.days_left <= 1 ? "text-rose-600" : it.days_left <= 2 ? "text-amber-600" : "text-orange-600"}>
                          {it.days_left === 0 ? "Today" : `${it.days_left}d`}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quantity by unit */}
            <Card className="rounded-2xl border border-green-100">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Quantity by unit</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.keys(summary.quantity_by_unit || {}).length === 0 ? (
                    <p className="text-xs text-muted-foreground">—</p>
                  ) : (
                    Object.entries(summary.quantity_by_unit || {}).map(([unit, qty]) => (
                      <div key={unit} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100">
                          <img
                            src={(unit && CATEGORY_IMAGES[unit.toLowerCase()]) || CATEGORY_IMAGES.other}
                            alt={unit}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = CATEGORY_IMAGES.other)}
                          />
                        </div>
                        <div className="text-sm text-foreground">
                          {qty} {unit}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </Collapsible>
      </div>
    </section>
  );
};

export default DashboardSummary;
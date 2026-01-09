import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea, ScrollBar } from "@/components/ui/ScrollArea";
import { CATEGORY_IMAGES } from "@/utils/constants.js";
import { ExpirySoon } from "@/hooks/food";

function getCategoryImage(category) {
  if (!category) return CATEGORY_IMAGES.other;
  const key = String(category).trim().toLowerCase();
  return CATEGORY_IMAGES[key] || CATEGORY_IMAGES.other;
}

const getUrgencyClass = (daysLeft) => {
  if (daysLeft <= 0) return "bg-red-100 text-red-800 border border-red-200"; // light red
  if (daysLeft <= 2) return "bg-amber-100 text-amber-800 border border-amber-200"; // yellow-ish
  if (daysLeft <= 4) return "bg-orange-100 text-orange-800 border border-orange-200"; // orange
  return "bg-emerald-100 text-emerald-800 border border-emerald-200"; // green safe
};

const ExpirySoonn = () => {

  const { data, isLoading, isError } = ExpirySoon();

  const expiryItems = Array.isArray(data) ? data : [];

  if (isLoading) return <div className="py-8">Loading...</div>;
  if (isError) return <div className="py-8 text-red-500">Failed to load items</div>;

  return (
    <section className="
      py-4 rounded-2xl p-6
      bg-gradient-to-r from-emerald-50/60 via-green-50/50 to-orange-50/50
      border border-emerald-100/70
      shadow-sm
    ">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Expiry Soon</h2>
            <p className="text-xs text-muted-foreground">Use these items first to reduce waste</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium border border-orange-200">
            0–4 days
          </span>
        </div>
      </div>

      <ScrollArea className="w-full h-[280px]">
        <div className="flex gap-4 pb-4">
          {expiryItems.length === 0 && (
            <div className="text-muted-foreground">No items expiring soon!</div>
          )}

          {expiryItems.map((item) => {
            const image = getCategoryImage(item.category);
            const expiryDate = item.expiry_date || item.expiryDate || null;

            let daysLeft =
              typeof item.days_left === "number"
                ? item.days_left
                : typeof item.daysLeft === "number"
                  ? item.daysLeft
                  : null;

            if (daysLeft === null && expiryDate) {
              const diff = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
              daysLeft = Math.max(0, isNaN(diff) ? 0 : diff);
            }
            daysLeft = daysLeft ?? 0;

            const urgencyLabel =
              daysLeft === 0 ? "Today" : daysLeft === 1 ? "1 day" : `${daysLeft} days`;

            return (
              <Card
                key={item.id}
                className={`
                  flex-shrink-0 w-56 rounded-2xl overflow-hidden
                  border border-emerald-100
                  bg-gradient-to-br from-white via-emerald-50/60 to-orange-50/70
                  shadow-sm hover:shadow-md transition-shadow
                `}
              >
                <CardContent className="p-0">
                  <div className="relative h-28 w-full">
                    <img
                      src={image}
                      alt={item.name || "item"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = CATEGORY_IMAGES.other;
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <Badge
                        className={`rounded-full px-3 py-1 text-xs font-semibold bg-white ${getUrgencyClass(daysLeft)}`}
                      >
                        {urgencyLabel}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="rounded-full px-3 py-1 text-xs font-medium bg-white/80 text-emerald-900 border border-white/60 backdrop-blur">
                        {(item.category || "other").toString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {item.name || "Unnamed item"}
                    </h3>

                    <p className="text-xs text-muted-foreground mt-1">
                      Expires:{" "}
                      <span className="font-medium text-foreground/80">
                        {expiryDate ? new Date(expiryDate).toLocaleDateString() : "Unknown"}
                      </span>
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Priority</span>
                      <span className="text-xs font-semibold text-emerald-800">
                        {daysLeft <= 0 ? "Urgent" : daysLeft <= 2 ? "High" : daysLeft <= 4 ? "Medium" : "Low"}
                      </span>
                    </div>

                    <div className="mt-3 h-2 w-full rounded-full bg-emerald-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${daysLeft <= 0
                            ? "bg-rose-400"
                            : daysLeft <= 2
                              ? "bg-amber-400"
                              : daysLeft <= 4
                                ? "bg-orange-400"
                                : "bg-emerald-400"
                          }`}
                        style={{
                          width:
                            daysLeft <= 0 ? "100%" : daysLeft === 1 ? "80%" : daysLeft === 2 ? "65%" : daysLeft === 3 ? "45%" : "30%",
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

export default ExpirySoonn;

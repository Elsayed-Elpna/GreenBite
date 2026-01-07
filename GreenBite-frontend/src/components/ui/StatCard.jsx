import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const StatCard = ({ icon: Icon, value, label, delta, sparkline, className = "" }) => {
  const isUp = typeof delta === "number" ? delta >= 0 : true;

  return (
    <Card className={cn("rounded-2xl border border-green-100 bg-white/95 shadow-sm", className)}>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7eb685] to-[#6aa571] flex items-center justify-center">
          {Icon ? <Icon className="w-6 h-6 text-white" /> : null}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground truncate">{label}</p>
        </div>

        {(typeof delta === "number" || sparkline) && (
          <div className="flex flex-col items-end gap-2">
            {typeof delta === "number" && (
              <div className={cn("text-sm font-medium", isUp ? "text-green-600" : "text-rose-600")}>
                <span>{isUp ? "▲" : "▼"}</span>
                <span className="ml-1">{Math.abs(delta)}%</span>
              </div>
            )}
            {sparkline}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
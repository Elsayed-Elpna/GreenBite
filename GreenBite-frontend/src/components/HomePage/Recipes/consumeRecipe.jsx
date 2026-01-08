import React, { useEffect, useMemo, useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { useConsumeConfirm, useConsumePreview } from "@/hooks/mealdbRecipe";
import { HOME_CARD } from "@/utils/HomeTheme";

const ConsumeRecipeMobileModal = ({ open, onClose, recipe }) => {
  const previewMut = useConsumePreview();
  const confirmMut = useConsumeConfirm();

  const [selected, setSelected] = useState({}); // foodlog_id -> used_quantity string

  useEffect(() => {
    if (!open || !recipe?.recipe_id) return;
    setSelected({});
    previewMut.mutate(recipe.recipe_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, recipe?.recipe_id]);

  const preview = previewMut.data;

  const flatRows = useMemo(() => {
    const matches = preview?.matches || {};
    const rows = [];
    Object.values(matches).forEach((arr) => {
      (arr || []).forEach((x) => rows.push(x));
    });
    return rows;
  }, [preview]);

  const toggleRow = (row) => {
    setSelected((prev) => {
      const next = { ...prev };
      const id = row.foodlog_id;
      if (next[id] != null) {
        delete next[id];
      } else {
        next[id] = "1"; // default
      }
      return next;
    });
  };

  const setQty = (id, val) => {
    setSelected((prev) => ({ ...prev, [id]: val }));
  };

  const canConfirm = Object.keys(selected).length > 0 && !confirmMut.isPending;

  const onConfirm = async () => {
    const items = Object.entries(selected).map(([foodlog_id, used_quantity]) => ({
      foodlog_id: Number(foodlog_id),
      used_quantity: String(used_quantity || "").trim(),
    }));

    confirmMut.mutate(
      { recipeId: recipe.recipe_id, items },
      {
        onSuccess: () => {
          // close after success
          onClose?.();
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 sm:block">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute inset-x-0 bottom-0 max-h-[82vh] rounded-t-3xl bg-white shadow-xl border border-emerald-100 overflow-hidden">
        <div className="p-4 border-b border-emerald-100 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Consume from inventory</p>
            <h4 className="text-base font-semibold text-foreground truncate">{recipe?.title || "Recipe"}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-emerald-100 bg-white flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[56vh]">
          {previewMut.isPending ? (
            <div className={`${HOME_CARD} p-4 flex items-center gap-2`}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading preview…</span>
            </div>
          ) : previewMut.isError ? (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">
              Failed to load preview.
            </div>
          ) : flatRows.length === 0 ? (
            <div className={`${HOME_CARD} p-4 text-sm text-muted-foreground`}>
              No matching food log items found for this recipe.
            </div>
          ) : (
            <div className="space-y-3">
              {flatRows.map((row) => {
                const checked = selected[row.foodlog_id] != null;
                return (
                  <div key={row.foodlog_id} className={`${HOME_CARD} p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => toggleRow(row)}
                        className="flex items-start gap-3 text-left flex-1"
                      >
                        <div
                          className={[
                            "mt-1 w-5 h-5 rounded border",
                            checked ? "bg-emerald-600 border-emerald-600" : "bg-white border-emerald-200",
                          ].join(" ")}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{row.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Avail: {row.quantity_available} {row.unit} • {row.days_left}d left
                          </p>
                          <p className="text-[11px] text-muted-foreground">Exp: {row.expiry_date}</p>
                        </div>
                      </button>

                      <div className="w-24">
                        <label className="text-[11px] text-muted-foreground">Use</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          disabled={!checked}
                          value={checked ? selected[row.foodlog_id] : ""}
                          onChange={(e) => setQty(row.foodlog_id, e.target.value)}
                          className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-emerald-100 bg-white">
          {confirmMut.isError ? (
            <div className="mb-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-800">
              Failed to confirm. Please check quantities and try again.
            </div>
          ) : null}

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            className={[
              "w-full rounded-xl px-4 py-3 text-sm font-semibold transition",
              canConfirm ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-gray-200 text-gray-500",
            ].join(" ")}
          >
            {confirmMut.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming…
              </span>
            ) : confirmMut.isSuccess ? (
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Done
              </span>
            ) : (
              "Confirm consumption"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsumeRecipeMobileModal;

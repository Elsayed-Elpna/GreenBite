import React, { useMemo, useState } from "react";
import { useSellerOrders } from "@/hooks/orders/useSellerOrders";
import OrderDetailsDialog from "./OrderDetailsDialog";

const STATUSES = ["PENDING", "ACCEPTED", "DELIVERED", "CANCELLED"];

export default function SellerOrdersPage() {
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const filters = useMemo(() => ({ status, page, pageSize: 10 }), [status, page]);
  const { data, isLoading, isError } = useSellerOrders(filters);

return (
  <div className="min-h-[calc(100vh-80px)] bg-[#fbf7f2]">
    {/* Page container */}
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header (GreenBite-ish card header) */}
      <div className="rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950">
            Incoming Orders
            <span className="ml-2 text-sm font-semibold text-emerald-700">
              (Seller)
            </span>
          </h1>
          <p className="text-sm text-emerald-900/70">
            Review incoming requests and manage order status.
          </p>
        </div>

        {/* Status chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUSES.map((s) => {
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  "border",
                  active
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                    : "border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="mt-5 grid gap-4">
        {/* Loading / Error states as soft alert cards */}
        {isLoading && (
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-emerald-900/70">Loading orders...</p>
          </div>
        )}

        {isError && (
          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-red-700">Failed to load orders.</p>
            <p className="mt-1 text-sm text-red-700/80">
              Please try again in a moment.
            </p>
          </div>
        )}

        {!isLoading && data?.results?.length === 0 && (
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="text-emerald-900/70">No orders found.</p>
          </div>
        )}

        {/* Orders list */}
        {!isLoading &&
          data?.results?.map((o) => (
            <div
              key={o.order_id}
              onClick={() => setSelectedOrderId(o.order_id)} // ✅ click anywhere
              className={[
                "rounded-3xl border border-emerald-100 bg-white",
                "p-5 shadow-sm transition",
                "hover:shadow-md hover:border-emerald-200",
                "cursor-pointer",
              ].join(" ")}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Left content */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-extrabold text-emerald-950">
                      #{o.order_id}
                    </p>

                    {/* Status badge */}
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border",
                        o.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : o.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : o.status === "DELIVERED"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-rose-50 text-rose-700 border-rose-200",
                      ].join(" ")}
                    >
                      {o.status}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-lg font-bold text-emerald-950">
                    {o.listing_title}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-emerald-900/75">
                    <p>
                      <span className="font-semibold text-emerald-900">
                        Buyer:
                      </span>{" "}
                      {o.buyer_name || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-900">
                        Qty:
                      </span>{" "}
                      {o.quantity} {o.unit}
                    </p>
                  </div>

                </div>

                {/* Right side hint (text only, not a button) */}
                <div className="flex items-center sm:justify-end">
                  <span className="text-xs font-semibold text-emerald-900/50">
                    Click to view details
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <button
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            "border border-emerald-200 bg-white text-emerald-900",
            "hover:bg-emerald-50 disabled:opacity-50 disabled:hover:bg-white",
          ].join(" ")}
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>

        <p className="text-sm font-semibold text-emerald-900/70">
          Page <span className="text-emerald-950">{page}</span>
        </p>

        <button
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold transition",
            "border border-emerald-200 bg-white text-emerald-900",
            "hover:bg-emerald-50 disabled:opacity-50 disabled:hover:bg-white",
          ].join(" ")}
          disabled={!data?.next}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* Dialog */}
      <OrderDetailsDialog
        isOpen={!!selectedOrderId}
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        mode="seller"
      />
    </div>
  </div>
);
}
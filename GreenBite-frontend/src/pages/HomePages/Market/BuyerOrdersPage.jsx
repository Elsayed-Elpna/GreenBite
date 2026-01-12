import React, { useMemo, useState } from "react";
import { useBuyerOrders } from "@/hooks/orders/useBuyerOrders";
import OrderDetailsDialog from "./OrderDetailsDialog";

const STATUSES = ["PENDING", "ACCEPTED", "DELIVERED", "CANCELLED"]

export default function BuyerOrdersPage() {
    const [status, setStatus] = useState("PENDING");
    const [page, setPage] = useState(1);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const filters = useMemo(() => ({ status, page, pageSize: 10 }), [status, page]);
    const { data, isLoading, isError } = useBuyerOrders(filters);

      return (
    <div className="p-4">
      <h1 className="text-xl font-bold">My Orders (Buyer)</h1>

      <div className="mt-3 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3 py-1 rounded-xl border ${
              status === s ? "bg-black text-white" : "bg-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {isLoading && <p>Loading...</p>}
        {isError && <p className="text-red-500">Failed to load orders.</p>}

        {!isLoading && data?.results?.length === 0 && <p>No orders found.</p>}

        {!isLoading &&
          data?.results?.map((o) => (
            <div
              key={o.order_id}
              className="mt-3 rounded-2xl border p-3 bg-white"
            >
              <p className="font-semibold">#{o.order_id}</p>
              <p className="mt-1">{o.listing_title}</p>
              <p className="mt-1">
                {o.quantity} {o.unit} — {o.total_price}
              </p>
              <p className="mt-1">Status: {o.status}</p>

              <button
                className="mt-3 px-4 py-2 rounded-xl border"
                onClick={() => setSelectedOrderId(o.order_id)}
              >
                Open Details
              </button>
            </div>
          ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="px-3 py-2 rounded-xl border disabled:opacity-60"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <button
          className="px-3 py-2 rounded-xl border disabled:opacity-60"
          disabled={!data?.next}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      <OrderDetailsDialog
        isOpen={!!selectedOrderId}
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        mode="buyer"
      />
    </div>
  );
}
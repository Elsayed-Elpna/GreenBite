import React from "react";
import { useOrderDetails } from "@/hooks/orders/useOrderDetails";
import { useAcceptOrder } from "@/hooks/orders/useAcceptOrders";
import { useUpdateOrderStatus } from "@/hooks/orders/useUpdateOrderStatus";
import { useNavigate } from "react-router-dom";

export default function OrderDetailsDialog({ isOpen, orderId, onClose, mode}){
    const {data, isLoading, isError} = useOrderDetails(orderId, {
        enabled: isOpen && !!orderId,
    });
    const acceptMutation = useAcceptOrder();
    const updateStatusMutation = useUpdateOrderStatus();
    const navigate = useNavigate();

    if(!isOpen) return null;

    const status = data?.status;

    const canBuyerCancel = mode === "buyer" && status === "PENDING";
    const canSellerCancel = mode === "seller" && status === "PENDING";
    const canSellerAccept = mode === "seller" && status === "PENDING";
    const canSellerDeliver = mode === "seller" && status === "ACCEPTED";

    const getOrderPathForMode = () => 
      mode === "seller" ? "/home/marketplace/orders/seller" : "/home/marketplace/orders/buyer";

    const goToOrdersStatus = (nextStatus) => {
      onClose?.();
      navigate(`${getOrderPathForMode()}?status=${encodeURIComponent(nextStatus)}`);
    };

    return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* dialog wrapper */}
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-8">
        <div className="mt-16 w-full max-w-2xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-lg font-extrabold text-emerald-950">
                Order Details
              </h2>
              <p className="mt-1 text-sm text-emerald-900/70">
                Review order info and take action.
              </p>
            </div>

            <button
              type="button"
              className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition"
              onClick={onClose}
            >
              Close
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-auto px-5 py-5 bg-[#fbf7f2]">
            {isLoading && (
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-emerald-900/70">Loading...</p>
              </div>
            )}

            {isError && (
              <div className="rounded-2xl border border-red-200 bg-white p-4">
                <p className="font-semibold text-red-700">Failed to load order.</p>
                <p className="mt-1 text-sm text-red-700/80">
                  Please try again in a moment.
                </p>
              </div>
            )}

            {!isLoading && data && (
              <>
                {/* Top summary */}
                <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-emerald-950">
                      #{data.order_id}
                    </p>

                    {/* status badge */}
                    <span
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border",
                        data.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : data.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : data.status === "DELIVERED"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-rose-50 text-rose-700 border-rose-200",
                      ].join(" ")}
                    >
                      {data.status}
                    </span>
                  </div>
                </div>

                {/* Listing card */}
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-extrabold text-emerald-950">Listing</p>

                  <p className="mt-2 text-base font-bold text-emerald-950">
                    {data.listing?.title || "—"}
                  </p>

                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-emerald-900/75 sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-emerald-900">Price:</span>{" "}
                      {data.listing?.price} {data.listing?.currency} /{" "}
                      {data.listing?.unit}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-900">Quantity:</span>{" "}
                      {data.quantity}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-semibold text-emerald-900">Total:</span>{" "}
                      {data.total_price} {data.listing?.currency}
                    </p>
                  </div>
                </div>

                {/* Address card */}
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-extrabold text-emerald-950">Address</p>

                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-emerald-900/75 sm:grid-cols-2">
                    <p className="sm:col-span-2">
                      <span className="font-semibold text-emerald-900">Name:</span>{" "}
                      {data.address?.full_name || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-900">Phone:</span>{" "}
                      {data.address?.phone_number || "—"}
                    </p>
                    <p>
                      <span className="font-semibold text-emerald-900">Email:</span>{" "}
                      {data.address?.email || "—"}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-semibold text-emerald-900">Address:</span>{" "}
                      {data.address?.address_line || "—"}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-semibold text-emerald-900">City:</span>{" "}
                      {data.address?.city || "—"}
                    </p>
                    {data.address?.notes && (
                      <p className="sm:col-span-2">
                        <span className="font-semibold text-emerald-900">Notes:</span>{" "}
                        {data.address.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {/* Buyer cancel */}
                  {canBuyerCancel && (
                    <button
                      type="button"
                      className="rounded-full px-5 py-2 text-sm font-semibold border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 transition disabled:opacity-60"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate(
                          { orderId, status: "CANCELLED" },
                          {
                            onSuccess: () => goToOrdersStatus("CANCELLED"),
                          }
                        )
                      }
                    >
                      {updateStatusMutation.isPending ? "Cancelling..." : "Cancel"}
                    </button>
                  )}

                  {/* Seller cancel */}
                  {canSellerCancel && (
                    <button
                      type="button"
                      className="rounded-full px-5 py-2 text-sm font-semibold border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 transition disabled:opacity-60"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate(
                          { orderId, status: "CANCELLED" },
                          {
                            onSuccess: () => goToOrdersStatus("CANCELLED"),
                          }
                        )
                      }
                    >
                      {updateStatusMutation.isPending ? "Cancelling..." : "Cancel"}
                    </button>
                  )}

                  {/* Seller accept */}
                  {canSellerAccept && (
                    <button
                      type="button"
                      className="rounded-full px-5 py-2 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
                      disabled={acceptMutation.isPending}
                      onClick={() =>
                        acceptMutation.mutate(
                          { orderId },
                          {
                            onSuccess: () => goToOrdersStatus("ACCEPTED"),
                          }
                        )
                      }
                    >
                      {acceptMutation.isPending ? "Accepting..." : "Accept"}
                    </button>
                  )}

                  {/* Seller deliver */}
                  {canSellerDeliver && (
                    <button
                      type="button"
                      className="rounded-full px-5 py-2 text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
                      disabled={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate(
                          { orderId, status: "DELIVERED" },
                          {
                            onSuccess: () => goToOrdersStatus("DELIVERED"),
                          }
                        )
                      }
                    >
                      {updateStatusMutation.isPending ? "Updating..." : "Mark Delivered"}
                    </button>
                  )}
                </div>

                {/* Small hint */}
                <p className="mt-4 text-xs text-emerald-900/60">
                  After an action succeeds, you’ll be redirected to the orders list for that status.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
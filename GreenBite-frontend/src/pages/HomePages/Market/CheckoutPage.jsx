import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCreateOrder } from "@/hooks/orders/useCreateOrder";

export default function CheckoutPage(){
    const { listingId } = useParams();
    const navigate = useNavigate();
    const createMutation = useCreateOrder();

    const [quantity, setQuantity] = useState(1);
    const [buyerNote, setBuyerNote] = useState("");

    const [address, setAddress] = useState({
        full_name: "",
        phone_number: "",
        email: "",
        address_line: "",
        city: "",
        notes: "",
    });

    const payload = useMemo(() => {
        return{
            market_id: Number(listingId),
            quantity: Number(quantity),
            payment_method: "COD",
            buyer_note: buyerNote || "",
            address,
        };
    }, [listingId, quantity, buyerNote, address]);

    const canSubmit =
        payload.market_id &&
        payload.quantity >= 1 &&
        address.full_name &&
        address.phone_number &&
        address.email &&
        address.address_line &&
        address.city;
    

    async function submit(){
        try{
            await createMutation.mutateAsync(payload);
            navigate("/home/marketplace/orders/buyer");
        } catch(e){
            console.error(e);
        }
    }

    return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fbf7f2] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-5 rounded-3xl border border-emerald-100 bg-white/80 backdrop-blur p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-950">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-emerald-900/70">
            Complete your order details
          </p>
          <p className="mt-1 text-xs text-emerald-900/50">
            Listing ID: {listingId}
          </p>
        </div>

        {/* Quantity + note */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <label className="block text-sm font-semibold text-emerald-950">
            Quantity
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-emerald-200 bg-white p-2 focus:border-emerald-500 focus:outline-none"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <label className="mt-4 block text-sm font-semibold text-emerald-950">
            Buyer Note
          </label>
          <textarea
            className="mt-2 w-full rounded-xl border border-emerald-200 bg-white p-2 focus:border-emerald-500 focus:outline-none"
            value={buyerNote}
            onChange={(e) => setBuyerNote(e.target.value)}
            placeholder="Optional..."
          />
        </div>

        {/* Address */}
        <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <h2 className="text-sm font-extrabold text-emerald-950">
            Delivery Address
          </h2>

          {[
            ["full_name", "Full Name"],
            ["phone_number", "Phone Number"],
            ["email", "Email"],
            ["address_line", "Address Line"],
            ["city", "City"],
            ["notes", "Notes (optional)"],
          ].map(([key, label]) => (
            <div key={key} className="mt-4">
              <label className="block text-xs font-semibold text-emerald-900">
                {label}
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-emerald-200 bg-white p-2 focus:border-emerald-500 focus:outline-none"
                value={address[key]}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, [key]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          className="mt-6 w-full rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          disabled={!canSubmit || createMutation.isPending}
          onClick={submit}
        >
          {createMutation.isPending ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
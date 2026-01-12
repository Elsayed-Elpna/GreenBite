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
    <div className="p-4">
      <h1 className="text-xl font-bold">Checkout</h1>
      <p className="mt-1 text-sm opacity-70">Listing ID: {listingId}</p>

      <div className="mt-4 rounded-2xl border p-3 bg-white">
        <label className="block font-semibold">Quantity</label>
        <input
          className="mt-2 w-full border rounded-xl p-2"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <label className="block font-semibold mt-4">Buyer Note</label>
        <textarea
          className="mt-2 w-full border rounded-xl p-2"
          value={buyerNote}
          onChange={(e) => setBuyerNote(e.target.value)}
          placeholder="Optional..."
        />
      </div>

      <div className="mt-4 rounded-2xl border p-3 bg-white">
        <h2 className="font-semibold">Delivery Address</h2>

        {[
          ["full_name", "Full Name"],
          ["phone_number", "Phone Number"],
          ["email", "Email"],
          ["address_line", "Address Line"],
          ["city", "City"],
          ["notes", "Notes (optional)"],
        ].map(([key, label]) => (
          <div key={key} className="mt-3">
            <label className="block text-sm font-semibold">{label}</label>
            <input
              className="mt-2 w-full border rounded-xl p-2"
              value={address[key]}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, [key]: e.target.value }))
              }
            />
          </div>
        ))}
      </div>

      <button
        className="mt-5 px-4 py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-60"
        disabled={!canSubmit || createMutation.isPending}
        onClick={submit}
      >
        {createMutation.isPending ? "Placing order..." : "Place Order"}
      </button>
    </div>
  );
}

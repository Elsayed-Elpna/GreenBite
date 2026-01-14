import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useCreateOrder } from "@/hooks/orders/useCreateOrder";

/* ---------------- REGEX ---------------- */
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/* ---------------- YUP SCHEMA ---------------- */
const schema = yup.object({
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1"),

  buyerNote: yup.string().notRequired(),

  address: yup
    .object({
      full_name: yup
        .string()
        .required("Full name is required")
        .trim()
        .min(3, "Full name must be at least 3 characters long")
        .matches(/^[A-Za-z\s]+$/, "Full name must contain only letters"),

      phone_number: yup
        .string()
        .required("Phone number is required")
        .trim()
        .matches(/^[0-9]+$/, "Phone number must contain only digits")
        .min(11, "Phone number must be at least 11 digits")
        .max(15, "Phone number must be at most 15 digits"),

      email: yup
        .string()
        .trim()
        .lowercase()
        .notRequired()
        .test(
          "email-regex",
          "Enter a valid email address",
          (value) => !value || EMAIL_REGEX.test(value)
        )
        .max(255, "Email is too long"),

      address_line: yup
        .string()
        .required("Address line is required")
        .trim()
        .min(10, "Address line must be at least 10 characters long"),

      city: yup
        .string()
        .required("City is required")
        .trim()
        .matches(/^[A-Za-z\s]+$/, "City must contain only letters"),

      notes: yup
        .string()
        .trim()
        .max(500, "Notes must not exceed 500 characters")
        .notRequired(),
    })
    .test(
      "phone-or-email",
      "You must provide at least a phone number or an email",
      (value) => {
        if (!value) return false;
        return Boolean(value.phone_number || value.email);
      }
    ),
});

/* ================= COMPONENT ================= */
export default function CheckoutPage() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const createMutation = useCreateOrder();

  /* ---------------- STATE ---------------- */
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

  const [errors, setErrors] = useState({});

  /* ---------------- PAYLOAD ---------------- */
  const payload = useMemo(() => {
    return {
      market_id: Number(listingId),
      quantity: Number(quantity),
      payment_method: "COD",
      buyer_note: buyerNote,
      address,
    };
  }, [listingId, quantity, buyerNote, address]);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = async () => {
    try {
      await schema.validate(
        { quantity, buyerNote, address },
        { abortEarly: false }
      );
      setErrors({});
      return true;
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => {
        if (e.path) newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const validateField = async (path, value) => {
    try {
      await yup.reach(schema, path).validate(value);
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[path];
        return copy;
      });
    } catch (err) {
      setErrors((prev) => ({ ...prev, [path]: err.message }));
    }
  };

  /* ---------------- SUBMIT ---------------- */
  async function submit() {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      await createMutation.mutateAsync(payload);
      navigate("/home/marketplace/orders/buyer");
    } catch (e) {
      console.error(e);
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fbf7f2] px-4 py-6">
      <div className="mx-auto max-w-2xl">
        {/* Quantity + Buyer Note */}
        <div className="rounded-3xl border border-[#d1e8dd] bg-emerald-50 p-5">
          <label className="font-semibold">Quantity</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onBlur={() => validateField("quantity", quantity)}
            className="mt-2 w-full rounded-xl border border-[#d1e8dd] p-2"
          />
          {errors.quantity && (
            <p className="text-xs text-red-500">{errors.quantity}</p>
          )}

          <label className="mt-4 font-semibold">Buyer Note</label>
          <textarea
            value={buyerNote}
            onChange={(e) => setBuyerNote(e.target.value)}
            onBlur={() => validateField("buyerNote", buyerNote)}
            className="mt-2 w-full rounded-xl border border-[#d1e8dd] p-2"
          />
          {errors.buyerNote && (
            <p className="text-xs text-red-500">{errors.buyerNote}</p>
          )}
        </div>

        {/* Address */}
        <div className="mt-5 rounded-3xl border border-[#d1e8dd] bg-emerald-50 p-5">
          <h2 className="font-bold">Delivery Address</h2>

          {[
            ["full_name", "Full Name"],
            ["phone_number", "Phone Number"],
            ["email", "Email"],
            ["address_line", "Address Line"],
            ["city", "City"],
            ["notes", "Notes (optional)"],
          ].map(([key, label]) => (
            <div key={key} className="mt-4">
              <label className="text-xs font-semibold">{label}</label>
              <input
                value={address[key]}
                onChange={(e) =>
                  setAddress((prev) => ({ ...prev, [key]: e.target.value }))
                }
                onBlur={() => validateField(`address.${key}`, address[key])}
                className="mt-2 w-full rounded-xl border border-[#d1e8dd] p-2"
              />
              {errors[`address.${key}`] && (
                <p className="text-xs text-red-500">
                  {errors[`address.${key}`]}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={createMutation.isPending}
          className="mt-6 w-full rounded-full bg-emerald-600 py-3 text-white"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

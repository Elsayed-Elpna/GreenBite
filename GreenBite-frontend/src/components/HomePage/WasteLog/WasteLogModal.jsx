import { useState } from "react";
import { GrFormClose } from "react-icons/gr";
import * as yup from "yup";

/* ---------------- YUP SCHEMA ---------------- */
const schema = yup.object({
  name: yup.string().required("Name is required"),
  estimated_amount: yup
    .number()
    .typeError("Estimated amount must be a number")
    .positive("Estimated amount must be greater than 0")
    .required("Estimated amount is required"),
});

const emptyForm = {
  name: "",
  why: "",
  estimated_amount: "",
  unit: "g",
  disposal: "trash",
  reuse_ideas: [],
};

const WasteLogModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [form, setForm] = useState(() =>
    initialData ? initialData : emptyForm
  );

  const [reuseText, setReuseText] = useState(
    () => initialData?.reuse_ideas?.join("\n") || ""
  );

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔒 allow only numbers & no negatives for estimated_amount
    if (name === "estimated_amount") {
      if (value === "" || /^[0-9]*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await schema.validate(form, { abortEarly: false });
      setErrors({});

      onSubmit({
        ...form,
        estimated_amount: Number(form.estimated_amount),
        reuse_ideas: reuseText
          .split("\n")
          .map((i) => i.trim())
          .filter(Boolean),
      });
    } catch (err) {
      const newErrors = {};
      err.inner.forEach((e) => {
        newErrors[e.path] = e.message;
      });
      setErrors(newErrors);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        className="relative bg-white rounded-xl shadow-lg
        w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center p-4 border-b border-[#7eb685]">
          <h2 className="text-xl font-semibold">
            {initialData ? "Edit Waste" : "Add Waste"}
          </h2>

          <GrFormClose
            onClick={onClose}
            className="text-gray-600 hover:text-red-600 text-3xl cursor-pointer"
          />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            className="input input-bordered w-full"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          <textarea
            name="why"
            value={form.why || ""}
            onChange={handleChange}
            placeholder="Why was this wasted?"
            className="textarea textarea-bordered w-full"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                name="estimated_amount"
                type="text"
                inputMode="numeric"
                value={form.estimated_amount}
                onChange={handleChange}
                placeholder="Estimated Amount"
                className="input input-bordered w-full"
              />
              {errors.estimated_amount && (
                <p className="text-red-500 text-sm">
                  {errors.estimated_amount}
                </p>
              )}
            </div>

            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="g">g</option>
              <option value="ml">ml</option>
            </select>
          </div>

          <select
            name="disposal"
            value={form.disposal}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="trash">Trash</option>
            <option value="compost">Compost</option>
            <option value="Recycle">Recycle</option>
            <option value="AnimalFeed">Animal Feed</option>
          </select>

          <textarea
            placeholder="Reuse ideas (one per line)"
            value={reuseText}
            onChange={(e) => setReuseText(e.target.value)}
            className="textarea textarea-bordered w-full"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[#7eb685]">
            <button
              type="button"
              className="text-red-500 bg-[#ff000027] rounded py-2 px-2 hover:bg-[#f83a3a59]"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white
               bg-green-500 rounded-lg hover:bg-green-600
               focus:outline-none focus:ring-2 focus:ring-green-400
               transition flex items-center"
              disabled={isLoading}
            >
              {initialData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WasteLogModal;

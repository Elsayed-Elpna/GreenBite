import { useState, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const CATEGORY_CHOICES = [
  { value: "fruit", label: "Fruit" },
  { value: "vegetable", label: "Vegetable" },
  { value: "bread", label: "Bread" },
  { value: "meat", label: "Meat" },
  { value: "dairy", label: "Dairy" },
  { value: "grain", label: "Grain" },
  { value: "other", label: "Other" },
];

const STORAGE_CHOICES = [
  { value: "fridge", label: "Fridge" },
  { value: "freezer", label: "Freezer" },
  { value: "room_temp", label: "Room Temperature" },
];

const UNIT_CHOICES = ["kg", "g", "piece", "liter", "portion"];

const INITIAL_FORM = {
  name: "",
  category: "",
  quantity: "",
  unit: "",
  storage_type: "",
  expiry_date: "",
};

function FloatingInput({ label, type = "text", id, value, onChange, error, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={type === "date" ? { WebkitTextFillColor: value ? "#000" : "transparent" } : undefined}
        className={`peer w-full rounded px-4 pt-6 pb-2 outline-none transition-colors
          ${error ? "border-red-500" : "border-[#6D6D6D] focus:border-[#7eb685]"} border`}
        {...props}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200
          ${(focused || value) ? "top-1 text-xs" : "top-1/2 -translate-y-1/2"}
          ${error ? "text-red-500" : "text-[#6D6D6D]"}`}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function FloatingSelect({ label, id, options, value, error, onChange }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`peer w-full rounded px-4 pt-6 pb-2 outline-none appearance-none bg-white transition-colors
          ${error ? "border-red-500" : "border-[#6D6D6D] focus:border-[#7eb685]"} border`}
      >
        <option value="" />
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>{opt}</option>
          ) : (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          )
        )}
      </select>
      <label
        htmlFor={id}
        className={`absolute left-4 pointer-events-none transition-all duration-200
          ${value ? "top-1 text-xs" : "top-1/2 -translate-y-1/2"}
          ${error ? "text-red-500" : "text-[#6D6D6D]"}`}
      >
        {label}
      </label>
      <MdKeyboardArrowDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D6D6D]" />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function FoodLogForm({ onSubmit, loading, initialData }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const data = Array.isArray(initialData) ? initialData[0] : initialData;
      setFormData({ ...INITIAL_FORM, ...data });
    }
  }, [initialData]);

  const validateField = (field, value) => {
    const today = new Date().toISOString().split("T")[0];
    switch (field) {
      case "name":
        if (!value) return "Name is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Letters only";
        return "";
      case "category":
      case "unit":
      case "storage_type":
        return value ? "" : "Required";
      case "quantity":
        return value && Number(value) >= 1 ? "" : "Must be at least 1";
      case "expiry_date":
        if (!value) return "Required";
        if (value < today) return "Cannot be in the past";
        return "";
      default:
        return "";
    }
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: validateField(key, value) }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const today = new Date();
    const expiryDays = Math.max(
      1,
      Math.ceil((new Date(formData.expiry_date) - today) / (1000 * 60 * 60 * 24))
    );

    onSubmit({
      ...formData,
      expiry_days: expiryDays,
      expiry_date: formData.expiry_date, // send both
    });
  };



  return (
    <div className="max-w-6xl mx-auto mt-10 px-2 lg:px-6">
      <h2 className="text-2xl mb-2">
        Track What's <span className="text-red-500">Left</span>, Save What's <span className="text-[#7eb685]">Fresh</span>
      </h2>
      <p className="text-gray-500 mb-8">Add a food item to your log</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FloatingInput label="Name" id="name" value={formData.name} error={errors.name} onChange={(e) => updateField("name", e.target.value)} />
        <FloatingSelect label="Category" id="category" options={CATEGORY_CHOICES} value={formData.category} error={errors.category} onChange={(e) => updateField("category", e.target.value)} />
        <FloatingInput label="Quantity" type="number" id="quantity" min={1} value={formData.quantity} error={errors.quantity} onChange={(e) => updateField("quantity", e.target.value)} />
        <FloatingSelect label="Unit" id="unit" options={UNIT_CHOICES} value={formData.unit} error={errors.unit} onChange={(e) => updateField("unit", e.target.value)} />
        <FloatingSelect label="Storage type" id="storage" options={STORAGE_CHOICES} value={formData.storage_type} error={errors.storage_type} onChange={(e) => updateField("storage_type", e.target.value)} />
        <FloatingInput label="Expire date" type="date" id="expire" min={new Date().toISOString().split("T")[0]} value={formData.expiry_date} error={errors.expiry_date} onChange={(e) => updateField("expiry_date", e.target.value)} />

        <div className="col-span-full flex justify-end">
          <button type="submit" disabled={loading} className="bg-[#7eb685] hover:bg-green-600 text-white px-8 py-2 rounded text-xl">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

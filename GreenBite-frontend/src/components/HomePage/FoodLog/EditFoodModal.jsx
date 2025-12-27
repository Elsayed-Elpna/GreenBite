import React from "react";

import { useState, useEffect } from "react";

const EditFoodModal = ({ open, item, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    category: "",
    storage_type: "",
    expiry_date: "",
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        storage_type: item.storage_type,
        expiry_date: item.expiry_date,
      });
    }
  }, [item]);

  if (!open) return null;

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[420px]">
        <h2 className="text-lg font-semibold mb-4">Edit Food Item</h2>

        <div className="space-y-3 text-sm">
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Name"
          />

          <input
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Quantity"
          />

          <input
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Unit"
          />

          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Category</option>
            <option value="fruit">Fruit</option>
            <option value="vegetable">Vegetable</option>
            <option value="meat">Meat</option>
          </select>

          <select
            value={form.storage_type}
            onChange={(e) => update("storage_type", e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Storage</option>
            <option value="fridge">Fridge</option>
            <option value="freezer">Freezer</option>
            <option value="room_temp">Room Temp</option>
          </select>

          <input
            type="date"
            value={form.expiry_date}
            onChange={(e) => update("expiry_date", e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFoodModal;

// import { Button, Select, TextInput, Label } from "flowbite-react";

// const CATEGORY_CHOICES = [
//     { value: "fruit", label: "Fruit" },
//     { value: "vegetable", label: "Vegetable" },
//     { value: "bread", label: "Bread" },
//     { value: "meat", label: "Meat" },
//     { value: "dairy", label: "Dairy" },
//     { value: "grain", label: "Grain" },
// ];

// const STORAGE_CHOICES = [
//     { value: "fridge", label: "Fridge" },
//     { value: "freezer", label: "Freezer" },
//     { value: "room_temp", label: "Room Temperature" },
// ];

// const UNIT_CHOICES = ["kg", "g", "piece", "liter"];

// export default function FoodLogForm() {

//     return (
//         <div className="max-w-6xl mx-auto mt-10 px-6">
//             <h2 className="text-2xl font-bold mb-2">
//                 Track What’s <span className="text-red-500">Left</span>, Save What’s{" "}
//                 <span className="text-green-500">Fresh</span>
//             </h2>
//             <p className="text-gray-500 mb-6">Add a food item to your log</p>

//             <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Name */}
//                 <div>
//                     <Label value="Name" />
//                     <TextInput placeholder="" />
//                 </div>

//                 {/* Category */}
//                 <div>
//                     <Label value="Category" />
//                     <Select>
//                         <option value="">Select category</option>
//                         {CATEGORY_CHOICES.map((c) => (
//                             <option key={c.value} value={c.value}>
//                                 {c.label}
//                             </option>
//                         ))}
//                     </Select>
//                 </div>

//                 {/* Quantity */}
//                 <div>
//                     <Label value="Quantity" />
//                     <TextInput type="number" />
//                 </div>

//                 {/* Unit */}
//                 <div>
//                     <Label value="Unit" />
//                     <Select>
//                         <option value="">Select unit</option>
//                         {UNIT_CHOICES.map((u) => (
//                             <option key={u}>{u}</option>
//                         ))}
//                     </Select>
//                 </div>

//                 {/* Storage Type */}
//                 <div>
//                     <Label value="Storage type" />
//                     <Select>
//                         <option value="">Select storage</option>
//                         {STORAGE_CHOICES.map((s) => (
//                             <option key={s.value} value={s.value}>
//                                 {s.label}
//                             </option>
//                         ))}
//                     </Select>
//                 </div>

//                 {/* Expiry Date */}
//                 <div>
//                     <Label value="Expire date" />
//                     <TextInput type="date" />
//                 </div>

//                 {/* Buttons */}
//                 <div className="col-span-full flex justify-end gap-4 mt-4">
//                     <Button color="success">Save</Button>
//                     <Button color="failure">Cancel</Button>
//                 </div>
//             </form>
//         </div>
//     );
// }

import { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const CATEGORY_CHOICES = [
  { value: "fruit", label: "Fruit" },
  { value: "vegetable", label: "Vegetable" },
  { value: "bread", label: "Bread" },
  { value: "meat", label: "Meat" },
  { value: "dairy", label: "Dairy" },
  { value: "grain", label: "Grain" },
];

const STORAGE_CHOICES = [
  { value: "fridge", label: "Fridge" },
  { value: "freezer", label: "Freezer" },
  { value: "room_temp", label: "Room Temperature" },
];

const UNIT_CHOICES = ["kg", "g", "piece", "liter"];

function FloatingInput({ label, type = "text", id, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={
            type === "date" ? {
                color: "#000", // keeps calendar icon visible
                WebkitTextFillColor: value ? "#000" : "transparent",
            } : {}
        }

        className="peer w-full border border-[#6D6D6D] rounded px-4 pt-6 pb-2 outline-none focus:border-[#7eb685] transition-colors"
        {...props}
      />

      <label
        htmlFor={id}
        className={`absolute left-4 text-[#6D6D6D] pointer-events-none transition-all duration-200 ${
          isFocused || value
            ? "top-1 text-xs text-[#7eb685]"
            : "top-1/2 -translate-y-1/2"
        }`}
      >
        {label}
      </label>
    </div>
  );
}

function FloatingSelect({ label, id, options, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <select
        id={id}
        className="peer w-full border border-[#6D6D6D] rounded px-4 pt-6 pb-2 outline-none focus:border-[#7eb685] transition-colors appearance-none bg-white"
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(e.target.value !== "");
        }}
        onChange={(e) => setHasValue(e.target.value !== "")}
        {...props}
      >
        <option value=""></option>
        {options.map((option) => {
          if (typeof option === "string") {
            return (
              <option key={option} value={option}>
                {option}
              </option>
            );
          }
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      <label
        htmlFor={id}
        className={`absolute left-4 text-[#6D6D6D] pointer-events-none transition-all duration-200 ${
          isFocused || hasValue
            ? "top-1 text-xs text-[#7eb685]"
            : "top-1/2 -translate-y-1/2"
        }`}
      >
        {label}
      </label>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <MdKeyboardArrowDown className="w-6 h-6 text-[#6D6D6D]" />
      </div>
    </div>
  );
}

export default function FoodLogForm() {
  return (
    <div className="max-w-6xl mx-auto mt-10 lg:px-6 sm:px-2">
      <h2 className="text-2xl mb-2">
        Track What's <span className="text-red-500">Left</span>,
        Save What's{" "}
        <span className="text-[#7eb685]">Fresh</span>
      </h2>
      <p className="text-gray-500 mb-6">
        Add a food item to your log
      </p>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 ">
        {/* Name */}
        <FloatingInput label="Name" id="name" />

        {/* Category */}
        <FloatingSelect
          label="Category"
          id="category"
          options={CATEGORY_CHOICES}
        />

        {/* Quantity */}
        <FloatingInput
          label="Quantity"
          type="number"
          id="quantity"
        />

        {/* Unit */}
        <FloatingSelect
          label="Unit"
          id="unit"
          options={UNIT_CHOICES}
        />

        {/* Storage Type */}
        <FloatingSelect
          label="Storage type"
          id="storage"
          options={STORAGE_CHOICES}
        />

        {/* Expiry Date */}
        <FloatingInput
          label="Expire date"
          type="date"
          id="expire"
          />
        {/* Buttons */}
        <div className="col-span-full flex justify-end gap-4 mt-4">
          <button
            type="submit"
            className="bg-[#7eb685] hover:bg-green-600 text-white px-8 py-2 rounded transition-colors text-xl"
          >
            Save
          </button>
          <button
            type="button"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded transition-colors text-xl"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
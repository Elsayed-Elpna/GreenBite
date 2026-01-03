import { Listbox, Portal } from "@headlessui/react";
import { useRef, useState } from "react";

export default function MealFilters({ filters, setFilters, setPage }) {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    if (setPage) setPage(1);
  };

  /* ===== Helper (IMPORTANT) ===== */
  const getOption = (options, value) =>
    options.find((o) => o.value === value) || options[0];

  /* ===== Shared Dropdown ===== */
  const Dropdown = ({ options, value, onChange, width = "w-44" }) => {
    const buttonRef = useRef(null);
    const [position, setPosition] = useState(null);

    const updatePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    };

    return (
      <div className={`${width} flex-shrink-0`}>
        <Listbox value={value} onChange={onChange}>
          {({ open }) => (
            <>
              <Listbox.Button
                ref={buttonRef}
                onClick={updatePosition}
                className="w-full rounded-full bg-[#EEEEF0] py-2 text-center text-[#8B8C91] focus:outline-none"
              >
                {value.name}
              </Listbox.Button>

              {open && position && (
                <Portal>
                  <Listbox.Options
                    static
                    style={position}
                    className="fixed z-50 rounded-md bg-[#F4F4F4] shadow-lg py-1"
                  >
                    {options.map((item) => (
                      <Listbox.Option
                        key={item.name}
                        value={item}
                        className={({ active, selected }) =>
                          `
                          cursor-pointer px-3 py-2 my-1 mx-2 rounded-[20px]
                          ${
                            selected || active
                              ? "bg-[#7EB685] text-white"
                              : "text-[#8B8C91]"
                          }
                        `
                        }
                      >
                        {item.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Portal>
              )}
            </>
          )}
        </Listbox>
      </div>
    );
  };

  /* ===== Options ===== */
  const mealTimes = [
    { name: "All Meal Times", value: "" },
    { name: "Breakfast", value: "breakfast" },
    { name: "Lunch", value: "lunch" },
    { name: "Dinner", value: "dinner" },
    { name: "Snack", value: "snack" },
    { name: "Brunch", value: "brunch" },
    { name: "Dessert", value: "dessert" },
    { name: "Appetizer", value: "appetizer" },
  ];

  const leftoversOptions = [
    { name: "All", value: "" },
    { name: "Has leftovers", value: true },
    { name: "No leftovers", value: false },
  ];

  const orderingOptions = [
    { name: "Newest", value: "-created_at" },
    { name: "Oldest", value: "created_at" },
    { name: "High Calories", value: "-calories" },
    { name: "Low Calories", value: "calories" },
  ];

  /* ===== Selected options (CONTROLLED) ===== */
  const selectedMealTime = getOption(mealTimes, filters.mealTime);
  const selectedLeftovers = getOption(leftoversOptions, filters.has_leftovers);
  const selectedOrdering = getOption(orderingOptions, filters.ordering);

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 bg-white border-b border-[#E1E1E1] overflow-x-auto">
      {/* Search */}
      <input
        placeholder="Search name or cuisine..."
        className="w-full sm:w-56 rounded-full bg-[#EEEEF0] py-2 px-4 text-center text-[#8B8C91] focus:outline-none"
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
      />

      {/* Meal Time */}
      <Dropdown
        options={mealTimes}
        value={selectedMealTime}
        onChange={(item) => update("mealTime", item.value)}
      />

      {/* Leftovers */}
      <Dropdown
        options={leftoversOptions}
        value={selectedLeftovers}
        onChange={(item) => update("has_leftovers", item.value)}
        width="w-40"
      />

      {/* Ordering */}
      <Dropdown
        options={orderingOptions}
        value={selectedOrdering}
        onChange={(item) => update("ordering", item.value)}
      />

      {/* Calories */}
      <div className="flex gap-2 flex-shrink-0">
        <input
          type="number"
          placeholder="Min kcal"
          className="w-24 rounded-full bg-[#EEEEF0] py-2 text-center text-[#8B8C91] focus:outline-none"
          value={filters.calories_min}
          onChange={(e) => update("calories_min", e.target.value)}
        />

        <input
          type="number"
          placeholder="Max kcal"
          className="w-24 rounded-full bg-[#EEEEF0] py-2 text-center text-[#8B8C91] focus:outline-none"
          value={filters.calories_max}
          onChange={(e) => update("calories_max", e.target.value)}
        />
      </div>
    </div>
  );
}

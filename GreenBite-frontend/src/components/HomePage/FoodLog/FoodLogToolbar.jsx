// import { Label, Select } from "flowbite-react";

import { CategorySelect } from "./CategorySelect";
import { StorageSelect } from "./StorageSelect";
import { ExpirySelect } from "./ExpirySelect";
import { GoPlus } from "react-icons/go";

const FoodLogToolbar = ({ setFilters, onAddClick }) => {
  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex items-center justify-between bg-[#ffffff] gap-3 p-4 border-b border-[#E1E1E1]  overflow-x-auto">
      <div className="flex gap-2 ">
        <div>
          <input
            placeholder="Search name..."
            className=" w-full rounded-full
                bg-[#EEEEF0]
               py-2
                text-center text-[#8B8C91]
                focus:outline-none"
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        <CategorySelect onChange={(value) => update("category", value)} />
        <StorageSelect onChange={(value) => update("storage_type", value)} />
        <ExpirySelect onChange={(value) => update("is_expired", value)} />
      </div>
      <div>
        <button
          onClick={onAddClick}
          className="px-4 py-2 text-sm font-semibold text-white
            bg-green-500 rounded-lg
            hover:bg-green-600
            focus:outline-none focus:ring-2 focus:ring-green-400
            transition flex items-center"
        >
          <GoPlus className="mr-1" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};

export default FoodLogToolbar;

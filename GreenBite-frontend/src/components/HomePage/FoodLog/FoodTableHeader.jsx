import SortArrow from "./SortArrow";

const FoodTableHeader = ({ sort, setSort }) => {
  const handleSort = (field) => {
    setSort((prev) => {
      if (prev.sort_by !== field) {
        return { sort_by: field, sort_order: "asc" };
      }

      if (prev.sort_order === "asc") {
        return { sort_by: field, sort_order: "desc" };
      }

      return { sort_by: "", sort_order: "asc" };
    });
  };

  return (
    <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-xs   text-[#898D90]  bg-[#F9F4F1]  border-b border-[#E1E1E1]">
      {/* Name */}
      <div
        className="col-span-3 cursor-pointer select-none"
        onClick={() => handleSort("name")}
      >
        Name
        <SortArrow active={sort.sort_by === "name"} order={sort.sort_order} />
      </div>

      {/* Category */}
      <div
        className="col-span-2 cursor-pointer select-none"
        onClick={() => handleSort("category")}
      >
        Category
        <SortArrow
          active={sort.sort_by === "category"}
          order={sort.sort_order}
        />
      </div>

      {/* Quantity */}
      <div
        className="col-span-2 cursor-pointer select-none"
        onClick={() => handleSort("quantity")}
      >
        Quantity
        <SortArrow
          active={sort.sort_by === "quantity"}
          order={sort.sort_order}
        />
      </div>

      {/* Storage */}
      <div
        className="col-span-2 cursor-pointer select-none"
        onClick={() => handleSort("storage_type")}
      >
        Storage
        <SortArrow
          active={sort.sort_by === "storage_type"}
          order={sort.sort_order}
        />
      </div>

      {/* Expiry */}
      <div
        className="col-span-2 cursor-pointer select-none"
        onClick={() => handleSort("expiry_date")}
      >
        Expiry
        <SortArrow
          active={sort.sort_by === "expiry_date"}
          order={sort.sort_order}
        />
      </div>

      {/* Actions */}
      <div className="col-span-1 text-right">Actions</div>
    </div>
  );
};

export default FoodTableHeader;

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
    <thead className="hidden sm:table-header-group bg-[#F9F4F1] border-b border-[#E1E1E1]">
      <tr>
        {/* Name */}
        <th
          className="px-5 py-3 text-xs text-[#898D90] text-left cursor-pointer select-none"
          onClick={() => handleSort("name")}
        >
          Name
          <SortArrow active={sort.sort_by === "name"} order={sort.sort_order} />
        </th>

        {/* Category */}
        <th
          className="px-5 py-3 text-xs text-[#898D90] text-left cursor-pointer select-none"
          onClick={() => handleSort("category")}
        >
          Category
          <SortArrow
            active={sort.sort_by === "category"}
            order={sort.sort_order}
          />
        </th>

        {/* Quantity */}
        <th
          className="px-5 py-3 text-xs text-[#898D90] text-left cursor-pointer select-none"
          onClick={() => handleSort("quantity")}
        >
          Quantity
          <SortArrow
            active={sort.sort_by === "quantity"}
            order={sort.sort_order}
          />
        </th>

        {/* Storage */}
        <th
          className="px-5 py-3 text-xs text-[#898D90] text-left cursor-pointer select-none"
          onClick={() => handleSort("storage_type")}
        >
          Storage
          <SortArrow
            active={sort.sort_by === "storage_type"}
            order={sort.sort_order}
          />
        </th>

        {/* Expiry */}
        <th
          className="px-5 py-3 text-xs text-[#898D90] text-left cursor-pointer select-none"
          onClick={() => handleSort("expiry_date")}
        >
          Expiry
          <SortArrow
            active={sort.sort_by === "expiry_date"}
            order={sort.sort_order}
          />
        </th>

        {/* Actions */}
        <th className="px-5 py-3 text-xs text-[#898D90] text-right">Actions</th>
      </tr>
    </thead>
  );
};

export default FoodTableHeader;

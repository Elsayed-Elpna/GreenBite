const categoryColors = {
  fruit: "bg-green-100 text-green-700",
  vegetable: "bg-emerald-100 text-emerald-700",
  meat: "bg-red-100 text-red-700",
  dairy: "bg-blue-100 text-blue-700",
  bread: "bg-gray-100 text-gray-700",
};

const FoodTableRow = ({ item, onEdit, onDelete }) => {
  return (
    <>
      <tbody>
        {/* ================= Desktop / Tablet Table Row ================= */}
        <tr className="hidden sm:table-row hover:bg-gray-50 border-b border-[#00000010]">
          {/* Name */}
          <td className="px-5 py-4 text-sm font-medium text-gray-800">
            {item.name}
          </td>

          {/* Category */}
          <td className="px-5 py-4 text-sm">
            <span
              className={`px-3 py-1 rounded-full text-xs capitalize ${
                categoryColors[item.category] || "bg-gray-100 text-gray-700"
              }`}
            >
              {item.category}
            </span>
          </td>

          {/* Quantity */}
          <td className="px-5 py-4 text-sm text-gray-600">
            {item.quantity} {item.unit}
          </td>

          {/* Storage */}
          <td className="px-5 py-4 text-sm capitalize text-gray-600">
            {item.storage_type}
          </td>

          {/* Expiry */}
          <td className="px-5 py-4 text-sm text-gray-600">
            {item.expiry_date}
          </td>

          {/* Actions */}
          <td className="px-5 py-4 text-sm">
            <div className="flex gap-2 justify-end text-xs">
              <button
                className="text-blue-500 bg-[#0000ff27] rounded py-2 px-2 flex-1 hover:bg-[#3a3afd27]"
                onClick={() => onEdit(item)}
              >
                Edit
              </button>
              <button
                className="text-red-500 bg-[#ff000027] rounded py-2 px-2 flex-1 hover:bg-[#f83a3a59]"
                onClick={onDelete}
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      </tbody>

      <tbody>
        {/* ================= Mobile Card ================= */}
        <tr className="sm:hidden">
          <td colSpan="6" className="p-0">
            <div className="p-4 border-b border-[#00000010]">
              <div className="flex flex-col gap-3">
                {/* Name */}
                <div className="font-semibold text-gray-800 text-base">
                  {item.name}
                </div>

                {/* Category + Quantity */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                      categoryColors[item.category] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.category}
                  </span>

                  <span className="text-gray-500 text-sm">
                    {item.quantity} {item.unit}
                  </span>
                </div>

                {/* Storage */}
                <div className="text-gray-500 text-sm">
                  <span className="font-medium">Storage:</span>{" "}
                  <span className="capitalize">{item.storage_type}</span>
                </div>

                {/* Expiry */}
                <div className="text-gray-500 text-sm">
                  <span className="font-medium">Expiry:</span>{" "}
                  {item.expiry_date}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    className="text-blue-500 bg-[#0000ff27] rounded py-2 px-4 flex-1 hover:bg-[#3a3afd27]"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 bg-[#ff000027] rounded py-2 px-4 flex-1 hover:bg-[#f83a3a59]"
                    onClick={onDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </>
  );
};

export default FoodTableRow;

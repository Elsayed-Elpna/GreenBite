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
      {/* ================= Desktop / Tablet ================= */}
      <div className="hidden sm:grid grid-cols-12 px-5 py-4 text-sm hover:bg-gray-50 items-center border-b border-[#00000010] ">
        {/* Name */}
        <div className="col-span-3 font-medium text-gray-800">{item.name}</div>

        {/* Category */}
        <div className="col-span-2">
          <span
            className={`px-3 py-1 rounded-full text-xs capitalize ${
              categoryColors[item.category] || "bg-gray-100 text-gray-700"
            }`}
          >
            {item.category}
          </span>
        </div>

        {/* Quantity */}
        <div className="col-span-2 text-gray-600">
          {item.quantity} {item.unit}
        </div>

        {/* Storage */}
        <div className="col-span-2 capitalize text-gray-600">
          {item.storage_type}
        </div>

        {/* Expiry */}
        <div className="col-span-2 text-gray-600">{item.expiry_date}</div>

        {/* Actions */}
        <div className="col-span-1 flex    gap-2 justify-end text-xs">
          <button
            className="text-blue-500 bg-[#0000ff27] rounded py-2 px-2 flex-1 hover:bg-[#3a3afd27]  "
            onClick={() => onEdit(item)}
          >
            Edit
          </button>
          <button
            className="text-red-500  bg-[#ff000027] rounded py-2 px-2 flex-1 hover:bg-[#f83a3a59]"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>

      {/* ================= Mobile ================= */}
      <div
        className="
  sm:hidden
  p-4 
  flex w-full
  items-center
  justify-between
  gap-4
  text-sm
"
      >
        {/* Name */}
        <div className="font-semibold text-gray-800 flex-1 leading-none min-w-0 truncate">
          {item.name}
        </div>

        {/* Category + Quantity */}
        <div className="flex items-center gap-2 flex-1 leading-none min-w-0 truncate">
          <span
            className={`flex items-center px-2 py-0.5 rounded-full text-xs capitalize ${
              categoryColors[item.category] || "bg-gray-100 text-gray-700"
            }`}
          >
            {item.category}
          </span>

          <span className="text-gray-500">
            {item.quantity} {item.unit}
          </span>
        </div>

        {/* Storage */}
        <div className="text-gray-500 flex-1 leading-none  min-w-0 truncate">
          <span className="font-medium">Storage:</span>{" "}
          <span className="capitalize">{item.storage_type}</span>
        </div>

        {/* Expiry */}
        <div className="text-gray-500 flex-1 leading-none  min-w-0 truncate">
          <span className="font-medium">Expiry:</span> {item.expiry_date}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 flex-1 leading-none min-w-0 truncate">
          <button className="text-blue-500 hover:underline">Edit</button>
          <button className="text-red-500 hover:underline">Delete</button>
        </div>
      </div>
    </>
  );
};

export default FoodTableRow;

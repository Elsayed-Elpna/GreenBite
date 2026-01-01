const WasteLogTable = ({
  data,
  filters,
  setFilters,
  onAdd,
  onEdit,
  onDelete,
}) => {
  const toggleOrdering = (field) => {
    setFilters((prev) => {
      if (prev.ordering === field) {
        return { ...prev, ordering: `-${field}` };
      }
      if (prev.ordering === `-${field}`) {
        return { ...prev, ordering: null };
      }
      return { ...prev, ordering: field };
    });
  };

  const renderArrow = (field) => {
    if (filters.ordering === field) return "▲";
    if (filters.ordering === `-${field}`) return "▼";
    return "";
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ===== Toolbar ===== */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-4 bg-[#ffffff] rounded-t-2xl">
        <input
          type="text"
          placeholder="Search name..."
          value={filters.name}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, name: e.target.value }))
          }
          className="input input-sm input-bordered rounded-full w-full sm:w-64"
        />

        <button
          className="px-4 py-2 text-sm font-semibold text-white
               bg-green-500 rounded-lg
               hover:bg-green-600
               focus:outline-none focus:ring-2 focus:ring-green-400
               transition flex items-center justify-center"
          onClick={onAdd}
        >
          + Add
        </button>
      </div>

      {/* ===== Desktop Table View ===== */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F9F4F1] text-[#898D90] text-xs border-b border-[#E1E1E1]">
            <tr>
              <th
                className="px-5 py-3 text-left cursor-pointer select-none"
                onClick={() => toggleOrdering("name")}
              >
                Name {renderArrow("name")}
              </th>

              <th
                className="px-5 py-3 text-left cursor-pointer select-none"
                onClick={() => toggleOrdering("estimated_amount")}
              >
                Amount {renderArrow("estimated_amount")}
              </th>

              <th className="px-5 py-3 text-left">Reason</th>
              <th className="px-5 py-3 text-left">Disposal</th>
              <th className="px-5 py-3 text-left">Reuse Ideas</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No results found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  className="hidden sm:table-row hover:bg-gray-50 border-b border-[#00000010]"
                >
                  <td className="px-5 py-4 text-sm font-medium text-gray-800">
                    {item.name}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{`${item.estimated_amount} ${item.unit}`}</td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {item.why}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs capitalize ${
                        item.disposal === "compost"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.disposal}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {item.reuse_ideas[0]}
                  </td>
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
                        onClick={() => onDelete(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Mobile Card View ===== */}
      <div className="md:hidden p-4 space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No results found</div>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {`${item.estimated_amount} ${item.unit}`}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    item.disposal === "compost"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.disposal}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </span>
                  <p className="text-sm text-gray-700 mt-1">{item.why}</p>
                </div>

                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Reuse Ideas
                  </span>
                  <p className="text-sm text-gray-700 mt-1">
                    {item.reuse_ideas[0]}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 text-blue-500 bg-[#0000ff27] rounded-lg py-2.5 px-4 hover:bg-[#3a3afd27] transition font-medium text-sm"
                  onClick={() => onEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="flex-1 text-red-500 bg-[#ff000027] rounded-lg py-2.5 px-4 hover:bg-[#f83a3a59] transition font-medium text-sm"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WasteLogTable;

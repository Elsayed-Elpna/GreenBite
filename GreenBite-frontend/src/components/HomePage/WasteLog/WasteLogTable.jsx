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
    <div className="bg-white rounded-t-lg shadow ">
      {/* ===== Toolbar ===== */}
      <div className="flex flex-wrap gap-3 items-center justify-between p-4 bg-[#ffffff] rounded-2xl">
        <input
          type="text"
          placeholder="Search name..."
          value={filters.name}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, name: e.target.value }))
          }
          className="input input-sm input-bordered rounded-full"
        />

        <button
          className="px-4 py-2 text-sm font-semibold text-white
               bg-green-500 rounded-lg
               hover:bg-green-600
               focus:outline-none focus:ring-2 focus:ring-green-400
               transition flex items-center"
          onClick={onAdd}
        >
          + Add
        </button>
      </div>

      {/* ===== Table ===== */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-[#faf7f5] text-gray-500 text-sm">
            <tr>
              <th
                className="cursor-pointer select-none"
                onClick={() => toggleOrdering("name")}
              >
                Name {renderArrow("name")}
              </th>

              <th
                className="cursor-pointer select-none"
                onClick={() => toggleOrdering("estimated_amount")}
              >
                Amount {renderArrow("estimated_amount")}
              </th>

              <th>Reason</th>
              <th>Disposal</th>
              <th>Reuse Ideas</th>
              <th className="text-right">Actions</th>
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
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="font-medium">{item.name}</td>
                  <td>{`${item.estimated_amount} ${item.unit}`}</td>
                  <td>{item.why}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.disposal === "compost"
                          ? "px-3 py-1 rounded-full text-xs capitalize bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.disposal}
                    </span>
                  </td>
                  <td className="text-sm text-gray-500 overflow-hidden">
                    {item.reuse_ideas[0]}
                  </td>
                  <td className="text-right space-x-2">
                    <button
                      className="text-blue-500 bg-[#0000ff27] rounded py-2 px-2 flex-1 hover:bg-[#3a3afd27]  "
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500  bg-[#ff000027] rounded py-2 px-2 flex-1 hover:bg-[#f83a3a59]"
                      onClick={() => onDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WasteLogTable;

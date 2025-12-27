const WasteLogPagination = ({ page, setPage, count }) => {
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(count / PAGE_SIZE);

  if (!count || totalPages <= 1) return null;

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="flex justify-center items-center gap-2 p-4 bg-[white]">
      {/* Previous */}
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page === 1}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition
          ${
            page === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-[#7EB685] border border-[#7EB685] hover:bg-[#7EB685] hover:text-white"
          }`}
      >
        Previous
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }).map((_, index) => {
        const pageNumber = index + 1;
        const isActive = page === pageNumber;

        return (
          <button
            key={pageNumber}
            onClick={() => goToPage(pageNumber)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition
              ${
                isActive
                  ? "bg-[#7EB685] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => goToPage(page + 1)}
        disabled={page === totalPages}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition
          ${
            page === totalPages
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white text-[#7EB685] border border-[#7EB685] hover:bg-[#7EB685] hover:text-white"
          }`}
      >
        Next
      </button>
    </div>
  );
};

export default WasteLogPagination;

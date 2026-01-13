import { useState } from "react";
import { useReportsList } from "@/hooks/reports/useReportsList";
import ReportsTable from "@/components/marketplace/reports/ReportsTable";
import ReportsCard from "@/components/marketplace/reports/ReportsCard";

export default function ReportsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    target_type: "",
  });

  const { data, isLoading, isError } = useReportsList({
    page,
    ...filters,
  });

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setPage(1);
    setFilters({
      status: "",
      target_type: "",
    });
  };

  const hasActiveFilters = filters.status || filters.target_type;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 text-center">
        <svg
          className="w-12 h-12 text-red-600 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-red-800 font-semibold">Error loading reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-[90%] m-auto py-8">
      {/* Filters Section */}
      <div className="bg-gradient-to-br from-white to-green-50/30 rounded-xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-green-900 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-300"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>

          {/* Target Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Type
            </label>
            <select
              value={filters.target_type}
              onChange={(e) =>
                handleFilterChange("target_type", e.target.value)
              }
              className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-lg text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-300"
            >
              <option value="">All Types</option>
              <option value="MARKET">Marketplace</option>
              <option value="USER">User</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-green-50 text-green-800 rounded-full text-sm font-medium border border-green-200">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange("status", "")}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
            {filters.target_type && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-100 to-green-50 text-green-800 rounded-full text-sm font-medium border border-green-200">
                Type: {filters.target_type}
                <button
                  onClick={() => handleFilterChange("target_type", "")}
                  className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found{" "}
          <span className="font-semibold text-green-700">
            {data?.count || 0}
          </span>{" "}
          report(s)
        </p>
      </div>

      {/* Reports Display */}
      {!data?.results?.length ? (
        <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-12 text-center">
          <svg
            className="w-16 h-16 text-green-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 font-medium">No reports found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-green-600 hover:text-green-800 font-medium text-sm"
            >
              Clear filters to see all reports
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <ReportsTable reports={data.results} />
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-4">
            {data.results.map((r) => (
              <ReportsCard key={r.id} report={r} />
            ))}
          </div>
        </>
      )}

      {data && data.count > 10 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            disabled={!data.previous}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 rounded-lg border border-green-200 text-green-700 font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed
                 hover:bg-green-50 transition"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600 font-medium">
            Page {page} of {Math.ceil(data.count / 10)}
          </span>

          <button
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg border border-green-200 text-green-700 font-medium
                 disabled:opacity-50 disabled:cursor-not-allowed
                 hover:bg-green-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

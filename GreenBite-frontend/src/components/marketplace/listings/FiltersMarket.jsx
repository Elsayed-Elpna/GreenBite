import { Search, X, DollarSign } from "lucide-react";
import FloatingInput from "@/components/ui/FloatingInput";
import Button from "@/components/ui/Button";
import { MARKETPLACE_ACTIONS } from "@/reducers/marketplaceReducer";

const MarketplaceFilters = ({ filters, dispatch }) => {
  const handleSearchChange = (e) => {
    dispatch({
      type: MARKETPLACE_ACTIONS.SET_FILTERS,
      payload: { search: e.target.value },
    });
  };

  const handlePriceChange = (field, value) => {
    dispatch({
      type: MARKETPLACE_ACTIONS.SET_FILTERS,
      payload: { [field]: value },
    });
  };

  const handleClearFilters = () => {
    dispatch({ type: MARKETPLACE_ACTIONS.CLEAR_FILTERS });
  };

  const hasActiveFilters =
    filters.search || filters.minPrice || filters.maxPrice;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-emerald-100/50 border-2 border-emerald-100 mb-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-200/50">
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Search className="h-5 w-5 text-emerald-500" />
          </div>
          <FloatingInput
            placeholder="Search listings..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-12 pr-4 h-12 rounded-xl border-2 border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none bg-white text-gray-800 placeholder:text-gray-400 transition-all duration-300"
          />
        </div>

        {/* Price Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 lg:w-auto w-full">
          <div className="relative flex-1 sm:flex-none sm:w-36">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <FloatingInput
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              className="pl-10 pr-3 h-12 rounded-xl border-2 border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none bg-white text-gray-800 placeholder:text-gray-400 transition-all duration-300 w-full"
            />
          </div>

          <div className="relative flex-1 sm:flex-none sm:w-36">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <FloatingInput
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
              className="pl-10 pr-3 h-12 rounded-xl border-2 border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:outline-none bg-white text-gray-800 placeholder:text-gray-400 transition-all duration-300 w-full"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="h-12 w-full sm:w-12 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
              title="Clear all filters"
            >
              <X className="h-5 w-5" />
              <span className="sm:hidden">Clear Filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              <Search className="h-3.5 w-3.5" />
              <span className="truncate max-w-[150px]">{filters.search}</span>
            </div>
          )}
          {filters.minPrice && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <DollarSign className="h-3.5 w-3.5" />
              Min: {filters.minPrice}
            </div>
          )}
          {filters.maxPrice && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
              <DollarSign className="h-3.5 w-3.5" />
              Max: {filters.maxPrice}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketplaceFilters;

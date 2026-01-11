import { Search, X } from 'lucide-react';
import FloatingInput from '@/components/ui/FloatingInput';
import  Button from '@/components/ui/Button';
import { MARKETPLACE_ACTIONS } from '@/reducers/marketplaceReducer';

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

  const hasActiveFilters = filters.search || filters.minPrice || filters.maxPrice;

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm border border-border mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <FloatingInput
            placeholder="Search listings..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <FloatingInput
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            className="w-28"
          /> 
          <FloatingInput
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            className="w-28"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={handleClearFilters} size="icon">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MarketplaceFilters;

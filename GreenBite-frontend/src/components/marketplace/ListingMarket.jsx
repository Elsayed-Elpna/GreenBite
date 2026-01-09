import { useReducer, useEffect } from 'react';
import { Store, Plus } from 'lucide-react';
import  Button  from '@/components/ui/Button';
import ListingCard from './ListingCard';
import MarketplaceFilters from './FiltersMarket';
import { marketplaceReducer, initialMarketplaceState, MARKETPLACE_ACTIONS } from '@/reducers/marketplaceReducer';

// Mock data for now - will be replaced with API calls
const mockListings = [
  {
    id: '1',
    title: 'Homemade Chocolate Chip Cookies',
    price: 150,
    currency: 'EGP',
    quantity: 2,
    unit: 'kg',
    status: 'Active',
    featured_image: null,
    available_until: '2026-01-20',
    seller: { id: '1', name: 'Fatma', trust_score: 4.6 },
  },
  {
    id: '2',
    title: 'Fresh Organic Vegetables',
    price: 80,
    currency: 'EGP',
    quantity: 5,
    unit: 'kg',
    status: 'Active',
    featured_image: null,
    available_until: '2026-01-15',
    seller: { id: '2', name: 'Ahmed', trust_score: 4.8 },
  },
  {
    id: '3',
    title: 'Homemade Jam',
    price: 120,
    currency: 'EGP',
    quantity: 3,
    unit: 'jar',
    status: 'Active',
    featured_image: null,
    available_until: '2026-02-01',
    seller: { id: '3', name: 'Sara', trust_score: 4.2 },
  },
];

const MarketplaceListings = () => {
  const [state, dispatch] = useReducer(marketplaceReducer, initialMarketplaceState);
  const { listings, loading, error, filters } = state;
  useEffect(() => {
  const loadListings = async () => {
    dispatch({ type: MARKETPLACE_ACTIONS.SET_LOADING, payload: true });

    try {
      const res = await fetchListings({
        search: filters.search,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
        page: 1,
      });

      dispatch({
        type: MARKETPLACE_ACTIONS.SET_LISTINGS,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: MARKETPLACE_ACTIONS.SET_ERROR,
        payload: 'Failed to load listings',
      });
    }
  };

  loadListings();
}, [filters]);

  const handleOrder = (listing) => {
    console.log('Order:', listing);
    // TODO: Open order modal
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-right" />
          <h2 className="text-2xl font-bold text-foreground">Marketplace</h2>
        </div>
        <Button>
          <p className='flex'>
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
          </p>
        </Button>
      </div>

      <MarketplaceFilters filters={filters} dispatch={dispatch} />

      {loading && (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      )}

      {error && (
        <div className="text-center py-8 text-destructive">{error}</div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No listings found. Try adjusting your filters.
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} onOrder={handleOrder} />
          ))}
        </div>
      )}
    </section>
  );
};

export default MarketplaceListings;

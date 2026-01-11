import { useReducer, useEffect, useState } from 'react';
import { Store, Plus, RefreshCw } from 'lucide-react';
import  Button  from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ListingCard from './ListingCard';
import MarketplaceFilters from './FiltersMarket';
import ListingDetailsDialog from '@/components/marketplace/dialog/listingDetails';
import CreateListingDialog from '@/components/marketplace/dialog/listingDialog';
// import OrderDialog from './OrderDialog';/
// import ReviewDialog from './ReviewDialog';
// import ReportDialog from './ReportDialog';
import { marketplaceReducer, initialMarketplaceState, MARKETPLACE_ACTIONS } from '@/reducers/marketplaceReducer';
import { useAuth } from '@/context/AuthProvider';


// Mock data for now - will be replaced with API calls
const mockListings = [
  {
    id: '1',
    title: 'Homemade Chocolate Chip Cookies',
    description: 'Delicious homemade cookies made with premium chocolate chips.',
    price: 150,
    currency: 'EGP',
    quantity: 2,
    unit: 'kg',
    status: 'Active',
    featured_image: null,
    available_until: '2026-01-20',
    seller: { id: '2', name: 'Fatma', trust_score: 4.6 },
    average_rating: 4.5,
    review_count: 12,
  },
  {
    id: '2',
    title: 'Fresh Organic Vegetables',
    description: 'Freshly picked organic vegetables from local farms.',
    price: 80,
    currency: 'EGP',
    quantity: 5,
    unit: 'kg',
    status: 'Active',
    featured_image: null,
    available_until: '2026-01-15',
    seller: { id: '3', name: 'Ahmed', trust_score: 4.8 },
    average_rating: 4.8,
    review_count: 24,
  },
  {
    id: '3',
    title: 'Homemade Jam',
    description: 'Traditional homemade jam with natural ingredients.',
    price: 120,
    currency: 'EGP',
    quantity: 3,
    unit: 'jar',
    status: 'Active',
    featured_image: null,
    available_until: '2026-02-01',
    seller: { id: '4', name: 'Sara', trust_score: 4.2 },
    average_rating: 4.2,
    review_count: 8,
  },
];

const MarketplaceListings = () => {
  const [state, dispatch] = useReducer(marketplaceReducer, initialMarketplaceState);
  const { listings, loading, error, filters } = state;
  const { user, isSeller, toggleRole } = useAuth();

  // Dialog states
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    // Simulate API fetch with filters
    dispatch({ type: MARKETPLACE_ACTIONS.SET_LOADING, payload: true });

    // Filter mock data based on filters
    let filtered = [...mockListings];

    if (filters.search) {
      filtered = filtered.filter((l) =>
        l.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter((l) => l.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter((l) => l.price <= Number(filters.maxPrice));
    }

    // Simulate network delay
    setTimeout(() => {
      dispatch({
        type: MARKETPLACE_ACTIONS.SET_LISTINGS,
        payload: { results: filtered, count: filtered.length },
      });
    }, 300);
  }, [filters]);

  // Handlers
  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setDetailsOpen(true);
  };

  const handleOrder = (listing) => {
    setSelectedListing(listing);
    setOrderOpen(true);
  };

  const handleReview = (listing) => {
    setSelectedListing(listing);
    setReviewOpen(true);
  };

  const handleReport = (listing) => {
    setSelectedListing(listing);
    setReportOpen(true);
  };

  const handleDelete = (listing) => {
    console.log('Delete listing:', listing.id);
    toast.success('Listing deleted successfully');
    setDetailsOpen(false);
  };

  const handleCreateListing = async (data) => {
    console.log('Create listing:', data);
    toast.success('Listing created successfully');
  };

  const handleSubmitOrder = async (data) => {
    console.log('Submit order:', data);
    toast.success('Order placed successfully!');
  };

  const handleSubmitReview = async (data) => {
    console.log('Submit review:', data);
    toast.success('Review submitted successfully!');
  };

  const handleSubmitReport = async (data) => {
    console.log('Submit report:', data);
    toast.success('Report submitted. Thank you for your feedback.');
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Store className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Marketplace</h2>
          <Badge variant="outline" className="ml-2">
            {user?.role === 'seller' ? 'Seller' : 'Buyer'}
          </Badge>
        </div>
        <div className="flex gap-2">
          {/* Role toggle for demo */}
          <Button variant="outline" size="sm" onClick={toggleRole}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Switch to {user?.role === 'buyer' ? 'Seller' : 'Buyer'}
          </Button>
          
          {/* Create listing button - only for sellers */}
          {isSeller && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          )}
        </div>
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
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              onViewDetails={handleViewDetails}
              onOrder={handleOrder}
              onReview={handleReview}
              onReport={handleReport}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ListingDetailsDialog
        listing={selectedListing}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onOrder={handleOrder}
        onDelete={handleDelete}
        onReport={handleReport}
      />

      <CreateListingDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateListing}
      />

    
    </section>
  );
};

export default MarketplaceListings;

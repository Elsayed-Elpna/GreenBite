import { useReducer, useEffect, useState } from 'react';
import { Store, Plus, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ListingCard from './ListingCard';
import MarketplaceFilters from './FiltersMarket';
import ListingDetailsDialog from '@/components/marketplace/dialog/listingDetails';
import CreateListingDialog from '@/components/marketplace/dialog/CreatelistingDialog';
import EditListingDialog from '@/components/marketplace/dialog/EditListingDialog';
import { marketplaceReducer, initialMarketplaceState, MARKETPLACE_ACTIONS } from '@/reducers/marketplaceReducer';
import { useAuth } from '@/context/AuthProvider';
import { getListings } from '@/api/marketplace.api';
import { toast } from 'react-hot-toast';
import { useListings } from "@/hooks/uselistings";
import OrderDetailsDialog from '@/pages/HomePages/Market/OrderDetailsDialog';
import CreateReportDialog from "@/components/marketplace/reports/CreateReportDialog";
import useDialog from "@/hooks/useDialog";
import { useNavigate } from 'react-router-dom';


const MarketplaceListings = () => {
  const [state, dispatch] = useReducer(marketplaceReducer, initialMarketplaceState);
  const { listings, loading, error, filters } = state;
  const { user, isSubscribed } = useAuth();
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";

  const navigate = useNavigate();

  const { fetchListings, create, update, remove } = useListings();

  const canCreateListing = Boolean((isSubscribed ) || isAdmin);

  // Dialog states
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const reportDialog = useDialog();
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      dispatch({ type: MARKETPLACE_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: MARKETPLACE_ACTIONS.SET_ERROR, payload: null });

      try {
        const data = await getListings({
          page: 1,
          pageSize: 12,
          search: filters.search || undefined,
          minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
          sellerId: filters.sellerId || undefined,
        });

        if (cancelled) return;

        const rawResults = Array.isArray(data) ? data : (data?.results ?? []);
        const count = Array.isArray(data) ? data.length : (data?.count ?? rawResults.length);

        // Normalize backend fields to what UI expects
        const results = rawResults.map((l) => ({
          ...l,
          featured_image: l.featured_image_url ?? null, // used by ListingCard + ListingDetailsDialog
          seller: {
            ...l.seller,
            name: l.seller?.name ?? l.seller?.email ?? "Unknown",
            trust_score: l.seller?.trust_score ?? 0,
          },
        }));

        dispatch({
          type: MARKETPLACE_ACTIONS.SET_LISTINGS,
          payload: { results, count },
        });
      } catch (e) {
        if (cancelled) return;
        const msg =
          e?.response?.data?.detail ||
          e?.message ||
          "Failed to load marketplace listings.";
        dispatch({ type: MARKETPLACE_ACTIONS.SET_ERROR, payload: msg });
      } finally {
        if (!cancelled) {
          dispatch({ type: MARKETPLACE_ACTIONS.SET_LOADING, payload: false });
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [filters.search, filters.minPrice, filters.maxPrice, filters.sellerId]);

  // Handlers
  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setDetailsOpen(true);
  };

  const handleOrder = (listing) => {
    if (!listing?.id) return;
    navigate(`/home/marketplace/checkout/${listing.id}`);

  };

  const handleReview = (listing) => {
    setSelectedListing(listing);
    toast("Review not wired yet.");
  };

  const handleReport = (listing) => {
    reportDialog.open(listing);
  };


  const refreshListings = async () => {
    const { results, count } = await fetchListings(filters);
    dispatch({ type: MARKETPLACE_ACTIONS.SET_LISTINGS, payload: { results, count } });
  };

  const handleDelete = async (listing) => {
    console.log("[handleDelete] clicked:", listing?.id);
  try {
    await remove(listing.id);
    setDetailsOpen(false);
    await refreshListings();
  } catch (e) {
    // toast already in hook
  }
  };

  const handleOpenCreate = () => {
    if (!canCreateListing) {
      toast.error("You need to subscribe first to create a listing.");
      return;
    }
    setCreateOpen(true);
  };

  const handleCreate = async (payload) => {
    try {
      await create(payload);
      setCreateOpen(false);
      await refreshListings();
    } catch (e) {}
  };

  const handleOpenEdit = (listing) => {
    setSelectedListing(listing);
    setEditOpen(true);
  };

  const handleEditSubmit = async (listingId, payload) => {
    try {
      const updated = await update(listingId, payload);
      setSelectedListing((prev) => (prev?.id === listingId ? { ...prev, ...updated } : prev));
      setEditOpen(false);
      await refreshListings();
    } catch (e) {
      // toast already shown in hook
    }
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Store className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Marketplace</h2>

          <Badge variant="outline" className="ml-2">
            {isSubscribed ? 'Seller' : 'Buyer'}
          </Badge>
        </div>


        <div className="flex gap-2">
          {(isSubscribed || isAdmin) ? (
          <Button onClick={handleOpenCreate}>
            <p className="flex">
            <Plus className="h-4 w-4 mr-2" />
            Create Listing
            </p>
          </Button>) : (
            <div className="flex gap-2">

            <Button onClick={() => navigate(`/home/marketplace/orders/buyer/`)}>
              <p className="flex">
                <ShoppingBag className="h-4 w-4 mr-2" />
                your Orders
              </p>
            </Button>
            <Button onClick={() => navigate('/pricing/')}>
              <p className="flex">
                <Plus className="h-4 w-4 mr-2" />
                Become a Seller
              </p>
            </Button>
            </div>
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
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ListingDetailsDialog
        listing={selectedListing}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onDelete={handleDelete}
        onEdit={handleOpenEdit}
        onOrder={handleOrder}
        onReport={handleReport}
      />

      <CreateListingDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />

      <EditListingDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        listing={selectedListing}
        onSubmit={handleEditSubmit}
      />

      <CreateReportDialog
        listing={reportDialog.data[0]}
        defaultTargetType="MARKET"
        onClose={reportDialog.close}
      />
    </section>
  );
};

export default MarketplaceListings;

import { useReducer, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Plus, ShoppingBag, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import ListingCard from "./ListingCard";
import MarketplaceFilters from "./FiltersMarket";
import ListingDetailsDialog from "@/components/marketplace/dialog/listingDetails";
import CreateListingDialog from "@/components/marketplace/dialog/CreatelistingDialog";
import EditListingDialog from "@/components/marketplace/dialog/EditListingDialog";
import ListingReviewsDialog from "@/components/marketplace/dialog/ListingReviewsDialog";

import {
  marketplaceReducer,
  initialMarketplaceState,
  MARKETPLACE_ACTIONS,
} from "@/reducers/marketplaceReducer";
import { useAuth } from "@/context/AuthProvider";
import { getListings } from "@/api/marketplace.api";
import { toast } from "react-hot-toast";
import { useListings } from "@/hooks/uselistings";
import OrderDetailsDialog from "@/pages/HomePages/Market/OrderDetailsDialog";
import CreateReportDialog from "@/components/marketplace/reports/CreateReportDialog";
import useDialog from "@/hooks/useDialog";
import { useNavigate } from "react-router-dom";

const MarketplaceListings = () => {
  const [state, dispatch] = useReducer(
    marketplaceReducer,
    initialMarketplaceState
  );
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const { listings, loading, error, filters } = state;
  const { user, isSubscribed } = useAuth();
  const isAdmin = user?.role === "admin";
  const isSeller = user?.role === "seller";

  const navigate = useNavigate();

  const { fetchListings, create, update, remove } = useListings();

  const canCreateListing = Boolean(isSubscribed || isAdmin);

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

        const rawResults = Array.isArray(data) ? data : data?.results ?? [];
        const count = Array.isArray(data)
          ? data.length
          : data?.count ?? rawResults.length;

        // Normalize backend fields to what UI expects
        const results = rawResults.map((l) => ({
          ...l,
          featured_image: l.featured_image_url ?? null,
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
    setReviewsOpen(true);
  };

  const handleReport = (listing) => {
    reportDialog.open(listing);
  };

  const refreshListings = async () => {
    const { results, count } = await fetchListings(filters);
    dispatch({
      type: MARKETPLACE_ACTIONS.SET_LISTINGS,
      payload: { results, count },
    });
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
      setSelectedListing((prev) =>
        prev?.id === listingId ? { ...prev, ...updated } : prev
      );
      setEditOpen(false);
      await refreshListings();
    } catch (e) {
      // toast already shown in hook
    }
  };

  return (
    <section className="py-8 px-4 min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-3xl">
      {/* Header Section with Gradient Background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-2xl shadow-emerald-500/30 overflow-hidden"
      >
        {/* Decorative Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
        />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 sm:gap-4"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg"
            >
              <Store className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg mb-1">
                Marketplace
              </h2>
              <Badge className="bg-white/25 text-white border-white/30 backdrop-blur-sm px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold">
                {isSubscribed ? "✨ Seller Account" : "🛍️ Buyer Account"}
              </Badge>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto"
          >
            {isSubscribed || isAdmin ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleOpenCreate}
                    className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 shadow-lg font-semibold flex-1 sm:flex-none px-4"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Create Listing
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate(`/user/profile/buyer`)}
                    className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 shadow-lg font-semibold flex-1 sm:flex-none px-4"
                  >
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Your Orders
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => navigate("/pricing/")}
                    className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 hover:bg-white/30 shadow-lg font-semibold flex-1 sm:flex-none px-4"
                  >
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Become a Seller
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-8"
      >
        <MarketplaceFilters filters={filters} dispatch={dispatch} />
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full"
              />
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              >
                <Sparkles className="h-6 w-6 text-emerald-500" />
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-emerald-600 font-medium"
            >
              Loading marketplace...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center shadow-lg">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-5xl mb-3"
              >
                ⚠️
              </motion.div>
              <p className="text-red-600 font-semibold text-lg">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {!loading && !error && listings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white border-2 border-emerald-200 rounded-3xl p-12 text-center shadow-xl">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center"
              >
                <Store className="h-12 w-12 text-emerald-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Listings Found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or check back later for new items.
              </p>
              {(isSubscribed || isAdmin) && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleOpenCreate}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create First Listing
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listings Grid */}
      <AnimatePresence>
        {!loading && !error && listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                }}
              >
                <ListingCard
                  listing={listing}
                  onViewDetails={handleViewDetails}
                  onOrder={handleOrder}
                  onReview={handleReview}
                  onReport={handleReport}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

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

      <ListingReviewsDialog
        open={reviewsOpen}
        onOpenChange={setReviewsOpen}
        listing={selectedListing}
      />
    </section>
  );
};

export default MarketplaceListings;

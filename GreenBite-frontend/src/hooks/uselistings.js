import { getListings, createListing , updateListing, deleteListing} from '@/api/marketplace.api';
import { toast } from 'react-hot-toast';
import { useCallback , useState} from 'react';

const normalizeListing = (l) => ({
  ...l,
  featured_image: l.featured_image_url ?? l.featured_image ?? null,
  seller: {
    ...l.seller,
    name: l.seller?.name ?? l.seller?.email ?? "Unknown",
    trust_score: l.seller?.trust_score ?? 0,
  },
});
const toCreateFormData = (payload) => {
  const fd = new FormData();
  fd.append("title", payload.title ?? "");
  fd.append("description", payload.description ?? "");

  fd.append("price", String(payload.price));
  fd.append("currency", payload.currency || "EGP");
  fd.append("quantity", String(payload.quantity));
  fd.append("unit", payload.unit || "kg");
  fd.append("available_until", payload.available_until);

  //must be a File object
  if (payload.featured_image instanceof File) {
    fd.append("featured_image", payload.featured_image);
    } 

  return fd;
};
const toUpdateFormData = (payload) => {
  const fd = new FormData();

  // only allowed fields
  if (payload.title !== undefined) fd.append("title", payload.title ?? "");
  if (payload.description !== undefined) fd.append("description", payload.description ?? "");
  if (payload.price !== undefined) fd.append("price", String(payload.price));
  if (payload.quantity !== undefined) fd.append("quantity", String(payload.quantity));
  if (payload.unit !== undefined) fd.append("unit", payload.unit ?? "kg");
  if (payload.available_until !== undefined) fd.append("available_until", payload.available_until ?? "");

  // optional image update
  if (payload.featured_image instanceof File) fd.append("featured_image", payload.featured_image);

  return fd;
};


export const useListings = () => {
  const [loading, setLoading] = useState(false);

  const fetchListings = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getListings({
        page: 1,
        pageSize: 12,
        search: filters.search || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        sellerId: filters.sellerId || undefined,
      });

      const rawResults = Array.isArray(data) ? data : data?.results ?? [];
      const count = Array.isArray(data) ? rawResults.length : data?.count ?? rawResults.length;

      return { results: rawResults.map(normalizeListing), count };
    } finally {
      setLoading(false);
    }
  }, []);

    const create = useCallback(async (payload) => {
    try {
      const fd = toCreateFormData(payload);
      const created = await createListing(fd);
      toast.success("Listing created");
      return created;
    } catch (e) {
    const data = e?.response?.data;
    const firstKey = data && typeof data === "object" ? Object.keys(data)[0] : null;
    const msg =
      data?.detail ||
      (firstKey ? `${firstKey}: ${Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]}` : null) ||
      e?.message ||
      "Failed to create listing.";
    toast.error(msg);
    throw e;
  }
  }, []);

  const update = useCallback(async (listingId, payload) => {
    try {
      const updated = await updateListing(listingId, toUpdateFormData(payload));
      toast.success("Listing updated");
      return updated;
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "Failed to update listing.";
      toast.error(msg);
      throw e;
    }
  }, []);

 const remove = useCallback(async (listingId) => {
  try {
    console.log("[remove] sending DELETE for listing:", listingId);
    const resp = await deleteListing(listingId);
    console.log("[remove] DELETE response:", resp?.status);

    toast.success("Listing deleted");
    return true;
  } catch (e) {
    // These often exist when request didn't happen / was blocked:
    console.error("[remove] DELETE error object:", e);

    const status = e?.response?.status;
    const data = e?.response?.data;
    console.error("[remove] DELETE failed:", { status, data });

    // Axios network errors: e.request exists but e.response is undefined
    if (!e?.response && e?.request) {
      toast.error("Network error: request sent but no response (check backend/CORS).");
    } else {
      const msg = data?.detail || e?.message || "Failed to delete listing.";
      toast.error(msg);
    }
    throw e;
  }
}, []);

  return { loading, fetchListings, create, update, remove };
};
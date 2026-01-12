import axios from '@/api/axios';

/**
 * =========================
 * MARKETPLACE – LISTINGS
 * =========================
 */

/**
 * View all listings
 * GET /community/market/listings
 */

export const getListings = async (params = {}) => {
  const response = await axios.get('/api/community/market/listings', {
    params: {
      page: params.page,
      page_size: params.pageSize,
      search: params.search,
      min_price: params.minPrice,
      max_price: params.maxPrice,
      seller_id: params.sellerId,
      status: params.status,
      available_before: params.availableBefore,
    },
  });
    return response.data;
};

/**
 * Create listing
 * POST /community/market/listings
 */
export const createListing = async (data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  if (isFormData) {
    const response = await axios.post('/api/community/market/listings/', data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  // fallback JSON (no image)
  const response = await axios.post('/api/community/market/listings/', {
    title: data.title,
    description: data.description || null,
    price: Number(data.price),
    currency: data.currency || 'EGP',
    quantity: Number(data.quantity),
    unit: data.unit,
    available_until: data.available_until,
  });
  return response.data;
};


export const updateListing = async (listingId, data) => {
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const response = await axios.patch(`/api/community/market/listings/${listingId}/`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const deleteListing = async (listingId) => {
  const response = await axios.delete(`/api/community/market/listings/${listingId}/`);
  return response.data; 
};
/**
 * =========================
 * MARKETPLACE – REVIEWS
 * =========================
 */

/**
 * View listing reviews
 * GET /community/market/listings/{listing_id}/reviews
 */
export const getListingReviews = async (listingId, params = {}) => {
  const response = await axios.get(
    `/api/community/market/listings/${listingId}/reviews`,
    {
      params: {
        page: params.page,
        page_size: params.pageSize,
      },
    }
  );
  return response.data;
};

/**
 * Create review
 * POST /community/market/reviews
 */
export const createReview = async (data) => {
  const response = await axios.post('/api/community/market/reviews', {
    market_id: data.market_id,
    rating: data.rating,
    comment: data.comment,
  });
  return response.data;
};

/**
 * =========================
 * MARKETPLACE – REPORTS
 * =========================
 */

/**
 * Report listing
 * POST /community/reports
 */
export const reportListing = async (data) => {
  const response = await axios.post('/api/community/reports', {
    target_type: 'MARKET',
    target_id: data.target_id,
    reason: data.reason,
    details: data.details,
  });
  return response.data;
};


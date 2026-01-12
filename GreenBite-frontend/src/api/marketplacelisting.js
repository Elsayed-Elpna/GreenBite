import axios from './axios';

export const fetchListings = (params) =>
  axios.get('/api/community/market/listings/', { params });

export const createListing = (data) =>
  axios.post('/api/community/market/listings/', data);

export const createOrder = (data) =>
  axios.post('/api/community/market/orders/', data);

import axios from './axios';

export const fetchListings = (params) =>
  axios.get('/community/market/listings', { params });

export const createListing = (data) =>
  axios.post('/community/market/listings', data);

export const createOrder = (data) =>
  axios.post('/community/market/orders', data);

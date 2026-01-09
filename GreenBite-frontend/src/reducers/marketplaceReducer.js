// Marketplace state actions
export const MARKETPLACE_ACTIONS = {
  SET_LISTINGS: 'SET_LISTINGS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_PAGE: 'SET_PAGE',
};

export const initialMarketplaceState = {
  listings: [],
  count: 0,
  loading: false,
  error: null,
  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
    status: 'Active',
  },
  page: 1,
  pageSize: 10,
};

export const marketplaceReducer = (state, action) => {
  switch (action.type) {
    case MARKETPLACE_ACTIONS.SET_LISTINGS:
      return {
        ...state,
        listings: action.payload.results,
        count: action.payload.count,
        loading: false,
        error: null,
      };
    case MARKETPLACE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case MARKETPLACE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case MARKETPLACE_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        page: 1,
      };
    case MARKETPLACE_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialMarketplaceState.filters,
        page: 1,
      };
    case MARKETPLACE_ACTIONS.SET_PAGE:
      return {
        ...state,
        page: action.payload,
      };
    default:
      return state;
  }
};

import * as actionTypes from '../../constants/POS/productConstants';
const initialState = {
  allProducts: [],
  filteredProducts: [],
  categories: [],
  subcategories: {},
  currentCategory: 'all',
  currentSubcategory: null,
  searchQuery: '',
  loading: false,
  error: null
};
const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_PRODUCTS_REQUEST:
    case actionTypes.FETCH_CATEGORIES_REQUEST:
    case actionTypes.FETCH_SUBCATEGORIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case actionTypes.FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        allProducts: action.payload,
        filteredProducts: action.payload
      };
    case actionTypes.FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload
      };
    case actionTypes.FETCH_SUBCATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        subcategories: {
          ...state.subcategories,
          [action.payload.mainId]: action.payload.subcategories
        }
      };
    case actionTypes.FETCH_PRODUCTS_FAILURE:
    case actionTypes.FETCH_CATEGORIES_FAILURE:
    case actionTypes.FETCH_SUBCATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case actionTypes.SET_PRODUCTS:
      return {
        ...state,
        filteredProducts: action.payload
      };
    case actionTypes.FILTER_PRODUCTS:
      if (action.payload === 'all') {
        return {
          ...state,
          currentCategory: 'all',
          currentSubcategory: null,
          filteredProducts: state.allProducts
        };
      }
      
      const filtered = state.allProducts.filter(product => 
        String(product.category) === String(action.payload)
      );
      
      return {
        ...state,
        currentCategory: action.payload,
        currentSubcategory: null,
        filteredProducts: filtered
      };
    case actionTypes.SEARCH_PRODUCTS:
      const query = action.payload.toLowerCase();
      const searchedProducts = state.allProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.sku || '').toLowerCase().includes(query) ||
        (product.barcode || '').toLowerCase().includes(query) ||
        String(product.category).toLowerCase().includes(query)
      );
      
      return {
        ...state,
        searchQuery: action.payload,
        filteredProducts: searchedProducts
      };
    case actionTypes.SET_CURRENT_CATEGORY:
      return {
        ...state,
        currentCategory: action.payload
      };
    case actionTypes.SET_CURRENT_SUBCATEGORY:
      return {
        ...state,
        currentSubcategory: action.payload
      };
    default:
      return state;
  }
};
export default productReducer;
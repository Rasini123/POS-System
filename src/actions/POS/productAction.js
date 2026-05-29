import * as actionTypes from '../../constants/POS/productConstants';
import { 
  dbGetProducts, 
  dbGetCategories, 
  dbGetSubcategories 
} from '../../utils/mockDb';

const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'saree': 'fas fa-female',
    'sarong': 'fas fa-male',
    'frock': 'fas fa-child',
    'shirt': 'fas fa-tshirt',
    'fabric': 'fas fa-scroll',
    'dress': 'fas fa-user-tie'
  };
  const lowerName = categoryName.toLowerCase();
  return iconMap[lowerName] || 'fas fa-box';
};

export const fetchProducts = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_PRODUCTS_REQUEST });
  try {
    const products = dbGetProducts().filter(p => p.ppd_is_active === 'A');
    
    const formattedProducts = products.map((product) => {
      return {
        id: product.ppd_product_id, 
        productId: product.ppd_product_id,
        name: product.ppd_product_name,
        price: parseFloat(product.ppd_price) || 0,
        discountType: null,
        discountValue: 0,
        discountedPrice: parseFloat(product.ppd_price) || 0,
        markedPrice: parseFloat(product.ppd_price) || 0,
        category: product.ppd_category_id,
        subCategory: product.ppd_subcategory_id,
        stock: 9999, // Infinite stock since inventory is disabled
        sku: product.ppd_product_code,
        barcode: product.ppd_barcode || product.ppd_product_code,
        image: product.ppd_product_image || '',
        Whcode: 'WH-01',
        hasMultipleBatches: false,
        totalBatches: 1,
        allBatches: [],
        originalProduct: product
      };
    });

    dispatch({
      type: actionTypes.FETCH_PRODUCTS_SUCCESS,
      payload: formattedProducts
    });
  } catch (error) {
    dispatch({
      type: actionTypes.FETCH_PRODUCTS_FAILURE,
      payload: error.message
    });
  }
};

export const fetchCategories = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_CATEGORIES_REQUEST });
  try {
    const categories = dbGetCategories().filter(c => c.pcd_is_active === 'A');
    const formattedCategories = categories.map(cat => ({
      id: cat.pcd_category_id,
      label: cat.pcd_category_name,
      icon: getCategoryIcon(cat.pcd_category_name),
      subcategories: []
    }));
    formattedCategories.unshift({
      id: 'all',
      icon: 'fas fa-boxes',
      label: 'All Products',
      subcategories: []
    });

    dispatch({
      type: actionTypes.FETCH_CATEGORIES_SUCCESS,
      payload: formattedCategories
    });
  } catch (error) {
    dispatch({
      type: actionTypes.FETCH_CATEGORIES_FAILURE,
      payload: error.message
    });
  }
};

export const fetchSubcategories = (mainId) => async (dispatch) => {
  if (mainId === 'all') return;
  dispatch({ type: actionTypes.FETCH_SUBCATEGORIES_REQUEST });
  try {
    const subcategories = dbGetSubcategories().filter(
      s => s.psd_category_id === parseInt(mainId) && s.psd_is_active === 'A'
    );
    const formattedSubcategories = subcategories.map(sub => ({
      id: sub.psd_subcategory_id,
      label: sub.psd_subcategory_name
    }));
    dispatch({
      type: actionTypes.FETCH_SUBCATEGORIES_SUCCESS,
      payload: { mainId, subcategories: formattedSubcategories }
    });
  } catch (error) {
    dispatch({
      type: actionTypes.FETCH_SUBCATEGORIES_FAILURE,
      payload: error.message
    });
  }
};

export const fetchProductsBySubcategory = (subId) => async (dispatch) => {
  try {
    const products = dbGetProducts().filter(
      p => p.ppd_subcategory_id === parseInt(subId) && p.ppd_is_active === 'A'
    );
    const formattedProducts = products.map((product) => {
      return {
        id: product.ppd_product_id,
        productId: product.ppd_product_id,
        name: product.ppd_product_name,
        price: parseFloat(product.ppd_price) || 0,
        discountType: null,
        discountValue: 0,
        discountedPrice: parseFloat(product.ppd_price) || 0,
        markedPrice: parseFloat(product.ppd_price) || 0,
        category: product.ppd_category_id,
        subCategory: product.ppd_subcategory_id,
        stock: 9999,
        sku: product.ppd_product_code,
        barcode: product.ppd_barcode || product.ppd_product_code,
        image: product.ppd_product_image || '',
        Whcode: 'WH-01',
        hasMultipleBatches: false,
        totalBatches: 1,
        allBatches: [],
        originalProduct: product
      };
    });
    
    dispatch({
      type: actionTypes.SET_PRODUCTS,
      payload: formattedProducts
    });
  } catch (error) {
  }
};

export const filterProducts = (categoryId) => ({
  type: actionTypes.FILTER_PRODUCTS,
  payload: categoryId
});

export const searchProducts = (query) => ({
  type: actionTypes.SEARCH_PRODUCTS,
  payload: query
});

export const setCurrentCategory = (categoryId) => ({
  type: actionTypes.SET_CURRENT_CATEGORY,
  payload: categoryId
});

export const setCurrentSubcategory = (subcategoryId) => ({
  type: actionTypes.SET_CURRENT_SUBCATEGORY,
  payload: subcategoryId
});

export const refreshProducts = () => ({
  type: actionTypes.REFRESH_PRODUCTS
});
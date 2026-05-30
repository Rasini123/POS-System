import * as actionTypes from '../../constants/POS/productConstants';
import { productService } from '../../services/POS/ProductService';
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

const pickFirst = (...values) => values.find(value => value !== undefined && value !== null && value !== '');

const toActiveFlag = (value) => {
  if (value === undefined || value === null || value === '') return 'A';
  if (value === true || value === 'true' || value === 'A' || value === '1' || value === 1) return 'A';
  return 'I';
};

const normalizeCategory = (category) => ({
  pcd_category_id: pickFirst(category.pcd_category_id, category.CategoryId, category.categoryId, category.category_id),
  pcd_category_name: pickFirst(category.pcd_category_name, category.CategoryName, category.categoryName, category.category_name),
  pcd_is_active: toActiveFlag(pickFirst(category.pcd_is_active, category.IsActive, category.isActive, category.is_active))
});

const normalizeSubcategory = (subcategory) => ({
  psd_subcategory_id: pickFirst(subcategory.psd_subcategory_id, subcategory.SubCategoryId, subcategory.subCategoryId, subcategory.subcategoryId, subcategory.sub_category_id),
  psd_category_id: pickFirst(subcategory.psd_category_id, subcategory.CategoryId, subcategory.categoryId, subcategory.category_id),
  psd_subcategory_name: pickFirst(subcategory.psd_subcategory_name, subcategory.SubCategoryName, subcategory.subCategoryName, subcategory.subcategoryName, subcategory.sub_category_name),
  psd_is_active: toActiveFlag(pickFirst(subcategory.psd_is_active, subcategory.IsActive, subcategory.isActive, subcategory.is_active))
});

export const fetchProducts = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_PRODUCTS_REQUEST });
  try {
    let products = [];
    try {
      const apiProducts = await productService.getAllProducts();
      if (apiProducts && apiProducts.length > 0) {
        products = apiProducts;
      } else {
        products = dbGetProducts().filter(p => p.ppd_is_active === 'A');
      }
    } catch (err) {
      products = dbGetProducts().filter(p => p.ppd_is_active === 'A');
    }
    
    const formattedProducts = products.map((product) => {
      return {
        id: product.ppd_product_id || product.ProductId, 
        productId: product.ppd_product_id || product.ProductId,
        name: product.ppd_product_name || product.ProductName,
        price: parseFloat(product.ppd_price || product.Price) || 0,
        discountType: null,
        discountValue: 0,
        discountedPrice: parseFloat(product.ppd_price || product.Price) || 0,
        markedPrice: parseFloat(product.ppd_price || product.Price) || 0,
        category: product.ppd_category_id || product.CategoryId,
        subCategory: product.ppd_subcategory_id || product.SubCategoryId,
        stock: 9999, // Infinite stock since inventory is disabled
        sku: product.ppd_product_code || product.ProductCode,
        barcode: product.ppd_barcode || product.Barcode || product.ppd_product_code || product.ProductCode,
        image: product.ppd_product_image || product.ProductImage || '',
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
    let categoriesData = [];
    try {
      const apiCategories = await productService.getAllCategories();
      if (apiCategories && apiCategories.length > 0) {
        categoriesData = apiCategories.map(normalizeCategory);
      } else {
        categoriesData = dbGetCategories().filter(c => c.pcd_is_active === 'A');
      }
    } catch (err) {
      categoriesData = dbGetCategories().filter(c => c.pcd_is_active === 'A');
    }

    const formattedCategories = categoriesData
      .map(normalizeCategory)
      .filter(c => c.pcd_is_active === 'A' && c.pcd_category_id && c.pcd_category_name)
      .map(cat => ({
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
    let subcategoriesData = [];
    try {
      const apiSubcategories = await productService.getSubcategoriesByMainId(mainId);
      if (apiSubcategories && apiSubcategories.length > 0) {
        subcategoriesData = apiSubcategories.map(normalizeSubcategory);
      } else {
        subcategoriesData = dbGetSubcategories().filter(
          s => s.psd_category_id === parseInt(mainId) && s.psd_is_active === 'A'
        );
      }
    } catch (err) {
      subcategoriesData = dbGetSubcategories().filter(
        s => s.psd_category_id === parseInt(mainId) && s.psd_is_active === 'A'
      );
    }

    const formattedSubcategories = subcategoriesData
      .map(normalizeSubcategory)
      .filter(s => String(s.psd_category_id) === String(mainId) && s.psd_is_active === 'A' && s.psd_subcategory_id && s.psd_subcategory_name)
      .map(sub => ({
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
    let products = [];
    try {
      const apiProducts = await productService.getProductsBySubId(subId);
      if (apiProducts && apiProducts.length > 0) {
        products = apiProducts;
      } else {
        products = dbGetProducts().filter(
          p => p.ppd_subcategory_id === parseInt(subId) && p.ppd_is_active === 'A'
        );
      }
    } catch (err) {
      products = dbGetProducts().filter(
        p => p.ppd_subcategory_id === parseInt(subId) && p.ppd_is_active === 'A'
      );
    }

    const formattedProducts = products.map((product) => {
      return {
        id: product.ppd_product_id || product.ProductId,
        productId: product.ppd_product_id || product.ProductId,
        name: product.ppd_product_name || product.ProductName,
        price: parseFloat(product.ppd_price || product.Price) || 0,
        discountType: null,
        discountValue: 0,
        discountedPrice: parseFloat(product.ppd_price || product.Price) || 0,
        markedPrice: parseFloat(product.ppd_price || product.Price) || 0,
        category: product.ppd_category_id || product.CategoryId,
        subCategory: product.ppd_subcategory_id || product.SubCategoryId,
        stock: 9999,
        sku: product.ppd_product_code || product.ProductCode,
        barcode: product.ppd_barcode || product.Barcode || product.ppd_product_code || product.ProductCode,
        image: product.ppd_product_image || product.ProductImage || '',
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

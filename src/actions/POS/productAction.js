import * as actionTypes from '../../constants/POS/productConstants';
import { productService } from '../../services/POS/ProductService';
import { API_URL } from '../../config';
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

const getProductImageUrl = (product) => {
  const id = pickFirst(product.ProductId, product.ppd_product_id, product.productId, product.product_id);
  const rawImg = pickFirst(product.ppd_product_image, product.ProductImage, product.productImage, product.product_image);
  
  if (rawImg && (rawImg.startsWith('blob:') || rawImg.startsWith('data:'))) return rawImg;
  if (rawImg && rawImg.includes('svg+xml')) return rawImg;
  
  if (id) {
    return `${API_URL}/Products/GetProductImage?ProductId=${id}`;
  }
  
  if (rawImg && rawImg.startsWith('http')) return rawImg;
  return '';
};

const normalizeProduct = (product) => {
  const id = pickFirst(product.ppd_product_id, product.ProductId, product.productId, product.product_id);
  const price = parseFloat(pickFirst(product.ppd_price, product.Price, product.price, 0)) || 0;

  return {
    id,
    productId: id,
    name: pickFirst(product.ppd_product_name, product.ProductName, product.productName, product.product_name, ''),
    price,
    discountType: null,
    discountValue: 0,
    discountedPrice: price,
    markedPrice: price,
    category: pickFirst(product.ppd_category_id, product.CategoryId, product.categoryId, product.category_id),
    subCategory: pickFirst(product.ppd_subcategory_id, product.SubCategoryId, product.subCategoryId, product.subcategoryId, product.sub_category_id),
    stock: 9999,
    sku: pickFirst(product.ppd_product_code, product.ProductCode, product.productCode, product.product_code, ''),
    barcode: pickFirst(product.ppd_barcode, product.BarCode, product.Barcode, product.barCode, product.barcode, product.ppd_product_code, product.ProductCode, ''),
    image: getProductImageUrl(product),
    Whcode: 'WH-01',
    hasMultipleBatches: false,
    totalBatches: 1,
    allBatches: [],
    originalProduct: product
  };
};

const productIdentityKeys = (product) => {
  const id = pickFirst(product.ppd_product_id, product.ProductId, product.productId, product.product_id);
  const sku = pickFirst(product.ppd_product_code, product.ProductCode, product.productCode, product.product_code);
  const barcode = pickFirst(product.ppd_barcode, product.BarCode, product.Barcode, product.barCode, product.barcode);

  return [id && `id:${id}`, sku && `sku:${sku}`, barcode && `barcode:${barcode}`].filter(Boolean).map(String);
};

const loadProductsFromApiAndLocal = async () => {
  let apiProducts = [];

  try {
    apiProducts = await productService.getAllProducts();
  } catch (err) {
    apiProducts = [];
  }

  const localProducts = dbGetProducts();

  if (!apiProducts || apiProducts.length === 0) {
    return localProducts.filter(p => toActiveFlag(p.ppd_is_active) === 'A');
  }

  const mergedProducts = [...apiProducts];
  const seenKeys = new Set();

  apiProducts.forEach(product => {
    productIdentityKeys(product).forEach(key => seenKeys.add(key));
  });

  localProducts.forEach(product => {
    const keys = productIdentityKeys(product);
    const alreadyExists = keys.some(key => seenKeys.has(key));

    if (!alreadyExists) {
      mergedProducts.push(product);
      keys.forEach(key => seenKeys.add(key));
    }
  });

  return mergedProducts.filter(product => (
    toActiveFlag(pickFirst(product.ppd_is_active, product.IsActive, product.isActive, product.is_active)) === 'A'
  ));
};

export const fetchProducts = () => async (dispatch) => {
  dispatch({ type: actionTypes.FETCH_PRODUCTS_REQUEST });
  try {
    const products = await loadProductsFromApiAndLocal();
    const formattedProducts = products.map(normalizeProduct);

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
    const products = await loadProductsFromApiAndLocal();
    const formattedProducts = products
      .map(normalizeProduct)
      .filter(product => String(product.subCategory) === String(subId));
    
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

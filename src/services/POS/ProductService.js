import axios from "axios";
import { API_URL } from "../../config";

const PRODUCT_ADD_API_URL = process.env.REACT_APP_PRODUCT_ADD_API_URL || `${API_URL}/Products/AddProductsDetails`;
const PRODUCT_ADD_API_BASE_URL = PRODUCT_ADD_API_URL.replace(/\/Products\/AddProductsDetails\/?$/, "") || API_URL;

const pickFirst = (...values) => values.find(value => value !== undefined && value !== null && value !== "");
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const toActiveFlag = (value) => {
  if (value === undefined || value === null || value === "") return "A";
  if (value === true || value === "true" || value === "A" || value === "1" || value === 1) return "A";
  return "I";
};

const getProductIdFromResponse = (data) => {
  const resultSet = Array.isArray(data?.ResultSet) ? data.ResultSet[0] : data?.ResultSet;
  const numericResult = /^\d+$/.test(String(data?.Result || "")) ? data.Result : "";

  return pickFirst(
    resultSet?.ProductId,
    resultSet?.productId,
    resultSet?.UID,
    data?.ProductId,
    data?.productId,
    data?.UID,
    numericResult
  );
};

const findCreatedProduct = async (productData) => {
  const productCode = String(productData.ppd_product_code || productData.ProductCode || "");
  const barcode = String(productData.ppd_barcode || productData.BarCode || productData.Barcode || "");
  const productName = String(productData.ppd_product_name || productData.ProductName || "");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const products = await productService.getAllProducts();
    const match = [...products]
      .filter(product => {
        const candidateCode = String(product.ProductCode || product.ppd_product_code || "");
        const candidateBarcode = String(product.BarCode || product.Barcode || product.ppd_barcode || "");
        const candidateName = String(product.ProductName || product.ppd_product_name || "");

        return (
          (productCode && candidateCode === productCode) ||
          (barcode && candidateBarcode === barcode) ||
          (productName && candidateName === productName)
        );
      })
      .sort((left, right) => Number(right.ProductId || right.ppd_product_id || 0) - Number(left.ProductId || left.ppd_product_id || 0))[0];

    const productId = pickFirst(match?.ProductId, match?.ppd_product_id);
    if (productId) return productId;

    await sleep(400);
  }

  return null;
};

const isImageFile = (file) => (
  file && typeof File !== "undefined" && file instanceof File
);

export const productService = {
  // 1. GET: get all products
  getAllProducts: async () => {
    const response = await axios.get(`${API_URL}/Products/GetAllProducts`);
    return response.data.ResultSet || [];
  },

  getAllCategories: async () => {
    const response = await axios.get(`${API_URL}/Categories/GetAllCategories`);
    return response.data.ResultSet || [];
  },

  getSubcategoriesByMainId: async (mainId) => {
    const response = await axios.get(`${API_URL}/SubCategories/GetAllSubCategories`);
    const subCategories = response.data.ResultSet || [];
    return subCategories.filter(sub => String(sub.CategoryId ?? sub.categoryId ?? sub.psd_category_id) === String(mainId));
  },

  getProductsBySubId: async (subId) => {
    const response = await axios.get(`${API_URL}/Products/GetAllProducts`);
    const products = response.data.ResultSet || [];
    return products.filter(prod => String(prod.SubCategoryId ?? prod.subCategoryId ?? prod.ppd_subcategory_id) === String(subId));
  },
  
  addCategory: async (categoryName) => {
    const formData = new FormData();
    formData.append("CategoryName", categoryName);
    const response = await axios.post(`${API_URL}/Categories/AddCategoriesDetails`, formData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryName, isActive) => {
    const formData = new FormData();
    formData.append("CategoryId", categoryId);
    formData.append("CategoryName", categoryName);
    formData.append("IsActive", toActiveFlag(isActive));
    const response = await axios.post(`${API_URL}/Categories/PutCategoriesDetails`, formData);
    return response.data;
  },

  getCategoryById: async (categoryId) => {
    const response = await axios.get(`${API_URL}/Categories/GetCategoriesByCategoryId`, {
      params: { CategoryId: String(categoryId) }
    });
    return Array.isArray(response.data.ResultSet) 
      ? response.data.ResultSet[0] 
      : response.data.ResultSet || response.data.Result || response.data;
  },

  getAllSubcategories: async () => {
    const response = await axios.get(`${API_URL}/SubCategories/GetAllSubCategories`);
    return response.data.ResultSet || [];
  },

  addSubcategory: async (categoryId, subcategoryName) => {
    const formData = new FormData();
    formData.append("CategoryId", categoryId);
    formData.append("SubCategoryName", subcategoryName);
    const response = await axios.post(`${API_URL}/SubCategories/AddSubCategoriesDetails`, formData);
    return response.data;
  },

  updateSubcategory: async (subcategoryId, categoryId, subcategoryName, isActive) => {
    const formData = new FormData();
    formData.append("SubCategoryId", subcategoryId);
    formData.append("CategoryId", categoryId);
    formData.append("SubCategoryName", subcategoryName);
    formData.append("IsActive", toActiveFlag(isActive));
    const response = await axios.post(`${API_URL}/SubCategories/PutSubCategoriesDetails`, formData);
    return response.data;
  },

  getSubcategoryById: async (subcategoryId) => {
    const response = await axios.get(`${API_URL}/SubCategories/GetSubCategoriesBySubCategoryId`, {
      params: { SubCategoryId: String(subcategoryId) }
    });
    return Array.isArray(response.data.ResultSet) 
      ? response.data.ResultSet[0] 
      : response.data.ResultSet || response.data.Result || response.data;
  },

  // 2. GET: get by product ID
  getProductById: async (productId) => {
    const response = await axios.get(`${API_URL}/Products/GetProductsByProductId`, {
      params: { ProductId: String(productId) }
    });
    return Array.isArray(response.data.ResultSet) 
      ? response.data.ResultSet[0] 
      : response.data.ResultSet || response.data.Result || response.data;
  },

  // 3. POST: add product (query params mapping with optional automatic image upload integration)
  addProduct: async (productData) => {
    try {
      const response = await axios.post(PRODUCT_ADD_API_URL, null, {
        params: {
          ProductCode: String(productData.ppd_product_code || productData.ProductCode || ""),
          BarCode: String(productData.ppd_barcode || productData.BarCode || productData.Barcode || ""),
          ProductName: String(productData.ppd_product_name || productData.ProductName || ""),
          CategoryId: String(productData.ppd_category_id || productData.CategoryId || ""),
          SubCategoryId: String(productData.ppd_subcategory_id || productData.SubCategoryId || ""),
          UnitType: String(productData.UnitType || productData.ppd_unit_type || "PCS"),
          Price: String(productData.ppd_price || productData.Price || "0"),
          CreatedBy: String(productData.CreatedBy || productData.ppd_created_by || "1")
        }
      });

      let productId = getProductIdFromResponse(response.data);
      if (!productId && isImageFile(productData._imageFile)) {
        productId = await findCreatedProduct(productData);
      }

      if (productId && isImageFile(productData._imageFile)) {
        try {
          await productService.uploadProductImage(productId, productData._imageFile);
          await sleep(500);
        } catch (imgErr) {
          console.error("Failed to upload product image after creating product:", imgErr);
        }
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 4. POST: update product details (query params mapping with optional image upload integration)
  updateProduct: async (productData) => {
    try {
      const productId = productData.ppd_product_id || productData.ProductId;
      const response = await axios.post(`${API_URL}/Products/PutProductsDetails`, null, {
        params: {
          ProductId: String(productId || ""),
          ProductCode: String(productData.ppd_product_code || productData.ProductCode || ""),
          BarCode: String(productData.ppd_barcode || productData.BarCode || productData.Barcode || ""),
          ProductName: String(productData.ppd_product_name || productData.ProductName || ""),
          Price: String(productData.ppd_price || productData.Price || "0"),
          CategoryId: String(productData.ppd_category_id || productData.CategoryId || ""),
          SubCategoryId: String(productData.ppd_subcategory_id || productData.SubCategoryId || ""),
          UnitType: String(productData.UnitType || productData.ppd_unit_type || "PCS"),
          IsActive: toActiveFlag(productData.ppd_is_active ?? productData.IsActive),
          UpdatedBy: String(productData.UpdatedBy || productData.ppd_updated_by || "1")
        }
      });

      if (productId && isImageFile(productData._imageFile)) {
        try {
          await productService.uploadProductImage(productId, productData._imageFile);
          await sleep(500);
        } catch (imgErr) {
          console.error("Failed to upload product image after updating product:", imgErr);
        }
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 5. POST: soft delete product
  deleteProduct: async (productId) => {
    try {
      const response = await axios.post(`${API_URL}/Products/DeleteProduct`, null, {
        params: { ProductId: String(productId) }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 6. POST: reactive product
  restoreProduct: async (productId) => {
    try {
      const response = await axios.post(`${API_URL}/Products/RestoreProduct`, null, {
        params: { ProductId: String(productId) }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 7. POST: upload and replace existing product image
  uploadProductImage: async (productId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("ImageFile", imageFile);
      const response = await axios.post(`${PRODUCT_ADD_API_BASE_URL}/Products/UploadProductImage`, formData, {
        params: { ProductId: String(productId) },
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 9. GET: get image (review) URL preview generator
  getProductPhotoPreviewUrl: (productId) => {
    if (!productId) return "";
    return `${API_URL}/Products/GetProductImage?ProductId=${productId}`;
  },

  // GET: fetch image blob and create object URL
  getProductImage: async (idOrUrl) => {
    if (!idOrUrl) return null;
    try {
      let url = idOrUrl;
      if (typeof idOrUrl === 'string' && idOrUrl.startsWith('http') && !idOrUrl.includes('/Products/GetProductImage')) {
        return idOrUrl;
      }
      if (typeof idOrUrl === 'number' || !isNaN(idOrUrl)) {
        url = `${API_URL}/Products/GetProductImage?ProductId=${idOrUrl}`;
      }
      const response = await axios.get(url);
      const imageUrl = response.data?.imageUrl || response.data?.ImageUrl;

      if (imageUrl) {
        return imageUrl;
      }

      if (response.data instanceof Blob) {
        return URL.createObjectURL(response.data);
      }

      return url;
    } catch (err) {
      return null;
    }
  },

  // 10. POST: DELETE product image (permanent)
  deleteProductImage: async (productId) => {
    try {
      const response = await axios.post(`${API_URL}/Products/DeleteProductImage`, null, {
        params: { ProductId: String(productId) }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

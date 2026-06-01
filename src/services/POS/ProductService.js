import axios from "axios";
import { API_URL } from "../../config";

export const productService = {
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
    formData.append("IsActive", String(isActive));
    const response = await axios.post(`${API_URL}/Categories/PutCategoriesDetails`, formData);
    return response.data;
  },

  getCategoryById: async (categoryId) => {
    const response = await axios.get(`${API_URL}/Categories/GetCategoriesByCategoryId`, {
      params: { CategoryId: categoryId }
    });
    return response.data.ResultSet?.[0] || response.data.Result || response.data;
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
    formData.append("IsActive", String(isActive));
    const response = await axios.post(`${API_URL}/SubCategories/PutSubCategoriesDetails`, formData);
    return response.data;
  },

  getSubcategoryById: async (subcategoryId) => {
    const response = await axios.get(`${API_URL}/SubCategories/GetSubCategoriesBySubCategoryId`, {
      params: { SubCategoryId: subcategoryId }
    });
    return response.data.ResultSet?.[0] || response.data.Result || response.data;
  },

  addProduct: async (productData) => {
    const formData = new FormData();
    formData.append("ProductCode", productData.ppd_product_code || productData.ProductCode || "");
    formData.append("BarCode", productData.ppd_barcode || productData.BarCode || "");
    formData.append("ProductName", productData.ppd_product_name || productData.ProductName || "");
    formData.append("CategoryId", String(productData.ppd_category_id || productData.CategoryId || ""));
    formData.append("SubCategoryId", String(productData.ppd_subcategory_id || productData.SubCategoryId || ""));
    formData.append("Price", String(productData.ppd_price || productData.Price || "0"));
    formData.append("IsActive", "A");
    
    // Use the File object if available, otherwise use the image string (for backward compatibility)
    if (productData._imageFile && productData._imageFile instanceof File) {
      formData.append("ProductImage", productData._imageFile);
    } else if (productData.ppd_product_image && !productData.ppd_product_image.startsWith('blob:')) {
      // Only append if it's not a blob URL and not empty
      formData.append("ProductImage", productData.ppd_product_image);
    }
    
    const response = await axios.post(`${API_URL}/Products/AddProductsDetails`, formData);
    return response.data;
  },

  updateProduct: async (productData) => {
    const formData = new FormData();
    formData.append("ProductId", String(productData.ppd_product_id || productData.ProductId || ""));
    formData.append("ProductCode", productData.ppd_product_code || productData.ProductCode || "");
    formData.append("BarCode", productData.ppd_barcode || productData.BarCode || "");
    formData.append("ProductName", productData.ppd_product_name || productData.ProductName || "");
    formData.append("CategoryId", String(productData.ppd_category_id || productData.CategoryId || ""));
    formData.append("SubCategoryId", String(productData.ppd_subcategory_id || productData.SubCategoryId || ""));
    formData.append("Price", String(productData.ppd_price || productData.Price || "0"));
    formData.append("IsActive", String(productData.ppd_is_active || productData.IsActive || "A"));
    
    // Use the File object if available, otherwise use the image string (for backward compatibility)
    if (productData._imageFile && productData._imageFile instanceof File) {
      formData.append("ProductImage", productData._imageFile);
    } else if (productData.ppd_product_image && !productData.ppd_product_image.startsWith('blob:')) {
      // Only append if it's not a blob URL and not empty
      formData.append("ProductImage", productData.ppd_product_image);
    }
    
    const response = await axios.post(`${API_URL}/Products/PutProductsDetails`, formData);
    return response.data;
  },

  getProductById: async (productId) => {
    const response = await axios.get(`${API_URL}/Products/GetProductsByProductId`, {
      params: { ProductId: productId }
    });
    return response.data.ResultSet?.[0] || response.data.Result || response.data;
  },

  getProductPhotoPreviewUrl: (imageName) => {
    if (!imageName) return "";
    return `${API_URL}/Products/ProductPhotoPreview?imageName=${encodeURIComponent(imageName)}`;
  },

  getProductImage: async (imageUrl) => {
    if (!imageUrl) return null;
    try {
      const response = await axios.get(imageUrl, {
        responseType: "blob",
      });
      return URL.createObjectURL(response.data);
    } catch (err) {
      return null;
    }
  },
};


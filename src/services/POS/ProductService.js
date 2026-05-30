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
    return products.filter(prod => prod.SubCategoryId === String(subId));
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


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
    return subCategories.filter(sub => sub.CategoryId === String(mainId));
  },

  getProductsBySubId: async (subId) => {
    const response = await axios.get(`${API_URL}/Products/GetAllProducts`);
    const products = response.data.ResultSet || [];
    return products.filter(prod => prod.SubCategoryId === String(subId));
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


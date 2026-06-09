import axios from "axios";
import { API_URL } from "../../config";

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
    formData.append("IsActive", String(isActive));
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
    formData.append("IsActive", String(isActive));
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
      const response = await axios.post(`${API_URL}/Products/AddProductsDetails`, null, {
        params: {
          ProductCode: String(productData.ppd_product_code || productData.ProductCode || ""),
          ProductName: String(productData.ppd_product_name || productData.ProductName || ""),
          CategoryId: String(productData.ppd_category_id || productData.CategoryId || ""),
          SubCategoryId: String(productData.ppd_subcategory_id || productData.SubCategoryId || ""),
          UnitType: String(productData.UnitType || productData.ppd_unit_type || "PCS"),
          Price: String(productData.ppd_price || productData.Price || "0"),
          CreatedBy: String(productData.CreatedBy || productData.ppd_created_by || "1")
        }
      });

      console.log("Add Product Response:", response.data);

      // Check if product creation was successful
      const statusCode = response.data?.StatusCode || response.status;
      const isSuccess = statusCode === 200 || response.data?.Result === "Added";
      
      if (!isSuccess) {
        console.warn("Product creation may have failed:", response.data);
        return response.data; // Return early if creation failed
      }

      // Extract new product ID to upload the image file automatically
      // API returns UID as the product ID in successful add response
      const resSet = response.data?.ResultSet;
      let productId = response.data?.UID || 
                      (Array.isArray(resSet) ? resSet[0]?.ProductId || resSet[0]?.UID : resSet?.ProductId || resSet?.UID) || 
                      response.data?.ProductId;

      console.log("Extracted ProductId:", productId, "Type:", typeof productId);

      if (productId && productData._imageFile && productData._imageFile instanceof File) {
        try {
          // Ensure productId is a number
          const numProductId = Number(productId);
          console.log("Converted ProductId to number:", numProductId);
          
          if (!isNaN(numProductId) && numProductId > 0) {
            console.log("Attempting to upload image with ProductId:", numProductId);
            const imgResponse = await productService.uploadProductImage(numProductId, productData._imageFile);
            console.log("Image upload response:", imgResponse);
          } else {
            console.warn("Invalid product ID for image upload. Raw value:", productId, "Converted:", Number(productId));
          }
        } catch (imgErr) {
          console.error("Failed to upload product image after creating product:", imgErr);
          // Don't throw - product was created successfully even if image upload failed
        }
      } else {
        console.log("No image file to upload. File provided:", !!productData._imageFile, "Is File:", productData._imageFile instanceof File);
      }

      return response.data;
    } catch (error) {
      console.error("Add product error:", error);
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
          ProductName: String(productData.ppd_product_name || productData.ProductName || ""),
          Price: String(productData.ppd_price || productData.Price || "0"),
          CategoryId: String(productData.ppd_category_id || productData.CategoryId || ""),
          SubCategoryId: String(productData.ppd_subcategory_id || productData.SubCategoryId || ""),
          UnitType: String(productData.UnitType || productData.ppd_unit_type || "PCS"),
          IsActive: String(productData.ppd_is_active || productData.IsActive || "A"),
          UpdatedBy: String(productData.UpdatedBy || productData.ppd_updated_by || "1")
        }
      });

      if (productId && productData._imageFile && productData._imageFile instanceof File) {
        try {
          await productService.uploadProductImage(productId, productData._imageFile);
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
      // Ensure productId is a valid number
      const numProductId = Number(productId);
      if (isNaN(numProductId) || numProductId <= 0) {
        throw new Error(`Invalid ProductId: ${productId}`);
      }

      console.log("Uploading image for ProductId:", numProductId, "File:", imageFile.name, "Size:", imageFile.size);
      
      // Method 1: Try with ProductId as query parameter (standard)
      try {
        const formData = new FormData();
        formData.append("ImageFile", imageFile);
        
        const response = await axios.post(`${API_URL}/Products/UploadProductImage`, formData, {
          params: { ProductId: numProductId }
        });
        
        console.log("Image upload successful via Method 1:", response.data);
        return response.data;
      } catch (method1Error) {
        console.warn("Method 1 failed (query param):", method1Error.message);
        
        // Method 2: Try with ProductId in FormData
        try {
          const formData = new FormData();
          formData.append("ProductId", numProductId);
          formData.append("ImageFile", imageFile);
          
          const response = await axios.post(`${API_URL}/Products/UploadProductImage`, formData);
          
          console.log("Image upload successful via Method 2:", response.data);
          return response.data;
        } catch (method2Error) {
          console.warn("Method 2 failed (FormData param):", method2Error.message);
          
          // Method 3: Try with image binary directly
          try {
            const response = await axios.post(
              `${API_URL}/Products/UploadProductImage?ProductId=${numProductId}`,
              imageFile,
              {
                headers: {
                  "Content-Type": imageFile.type || "image/jpeg"
                }
              }
            );
            
            console.log("Image upload successful via Method 3:", response.data);
            return response.data;
          } catch (method3Error) {
            console.error("All image upload methods failed");
            console.error("Method 1 error:", method1Error.response?.data || method1Error.message);
            console.error("Method 2 error:", method2Error.response?.data || method2Error.message);
            console.error("Method 3 error:", method3Error.response?.data || method3Error.message);
            
            throw new Error(`Image upload failed. Original error: ${method1Error.response?.data?.Result || method1Error.message}`);
          }
        }
      }
    } catch (error) {
      console.error("Image upload error details:", {
        productId: productId,
        errorMessage: error.message,
        responseData: error.response?.data,
        responseStatus: error.response?.status
      });
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
      if (typeof idOrUrl === 'number' || !isNaN(idOrUrl)) {
        url = `${API_URL}/Products/GetProductImage?ProductId=${idOrUrl}`;
      }
      const response = await axios.get(url, {
        responseType: "blob",
      });
      return URL.createObjectURL(response.data);
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

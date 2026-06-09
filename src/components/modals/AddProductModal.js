
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../actions/modalActions';
import Modal from '../common/Modal';
import { productService } from '../../services/POS/ProductService';
import { FiImage, FiX } from 'react-icons/fi';

const AddProductModal = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  
  const [productData, setProductData] = useState({
    ProductCode: '',
    ProductName: '',
    CategoryId: '',
    SubCategoryId: '',
    Price: '',
    Barcode: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerAlert('Image size should be less than 2MB', 'error');
        return;
      }
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
  };

  const triggerAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddProduct = async () => {
    if (!productData.ProductName || !productData.ProductCode || !productData.Price || !productData.CategoryId) {
      triggerAlert('Please fill in all required fields!', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...productData,
        CategoryId: parseInt(productData.CategoryId),
        SubCategoryId: productData.SubCategoryId ? parseInt(productData.SubCategoryId) : null,
        Price: parseFloat(productData.Price),
        _imageFile: imageFile
      };

      const response = await productService.addProduct(payload);
      triggerAlert('Product added successfully!', 'success');
      
      // Clean up
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      
      // Reset and close
      setProductData({
        ProductCode: '',
        ProductName: '',
        CategoryId: '',
        SubCategoryId: '',
        Price: '',
        Barcode: ''
      });
      setImageFile(null);
      setImagePreview(null);
      
      setTimeout(() => {
        dispatch(closeModal());
      }, 1500);
    } catch (error) {
      triggerAlert(error?.message || 'Error adding product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      {alert.show && (
        <div className={`mb-4 px-4 py-3 rounded-lg ${alert.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {alert.message}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 dark:text-white">Add Product Item</h2>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {/* Image Upload */}
        <div className={`relative border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${
          darkMode 
            ? 'bg-gray-700/30 border-gray-600 hover:border-green-500' 
            : 'bg-gray-50 border-gray-300 hover:border-green-500'
        } group`}>
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
              <button
                onClick={removeImage}
                type="button"
                className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-center py-4">
              <FiImage className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm dark:text-gray-300">Click to upload product image</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <input
          type="text"
          name="ProductName"
          value={productData.ProductName}
          onChange={handleInputChange}
          placeholder="Product Name *"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="text"
          name="ProductCode"
          value={productData.ProductCode}
          onChange={handleInputChange}
          placeholder="Product Code *"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="number"
          step="0.01"
          name="Price"
          value={productData.Price}
          onChange={handleInputChange}
          placeholder="Price *"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="text"
          name="Barcode"
          value={productData.Barcode}
          onChange={handleInputChange}
          placeholder="Barcode"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        <input
          type="text"
          name="CategoryId"
          value={productData.CategoryId}
          onChange={handleInputChange}
          placeholder="Category ID *"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        <input
          type="text"
          name="SubCategoryId"
          value={productData.SubCategoryId}
          onChange={handleInputChange}
          placeholder="Subcategory ID"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => dispatch(closeModal())}
          className="flex-1 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleAddProduct}
          disabled={loading}
          className="flex-1 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Product'}
        </button>
      </div>
    </Modal>
  );
};

export default AddProductModal;

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal } from '../../actions/modalActions';
import Modal from '../common/Modal';

const AddProductModal = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  
  const [productData, setProductData] = useState({
    name: '',
    pulCode: '',
    defaultPrice: '',
    vipPrice: '',
    department: '',
    stockNumber: '',
    discount: '',
    barcode: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = () => {
    if (!productData.name) {
      alert('Product name is required!');
      return;
    }
    
    alert(`Product ${productData.name} added! In a real system, this would save to database.`);
    dispatch(closeModal());
  };

  return (
    <Modal>
      <h2 className="text-xl font-bold mb-4 dark:text-white">Add Product Item</h2>
      
      <div className="space-y-3">
        <input
          type="text"
          name="name"
          value={productData.name}
          onChange={handleInputChange}
          placeholder="Product Name"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="text"
          name="pulCode"
          value={productData.pulCode}
          onChange={handleInputChange}
          placeholder="PUL CODE"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="number"
          name="defaultPrice"
          value={productData.defaultPrice}
          onChange={handleInputChange}
          placeholder="Default Price"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="number"
          name="vipPrice"
          value={productData.vipPrice}
          onChange={handleInputChange}
          placeholder="VIP Price"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="text"
          name="department"
          value={productData.department}
          onChange={handleInputChange}
          placeholder="Department"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="number"
          name="stockNumber"
          value={productData.stockNumber}
          onChange={handleInputChange}
          placeholder="Stock Number"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="number"
          name="discount"
          value={productData.discount}
          onChange={handleInputChange}
          placeholder="Discount"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="text"
          name="barcode"
          value={productData.barcode}
          onChange={handleInputChange}
          placeholder="Barcode Create"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        
        <input
          type="file"
          accept="image/*"
          placeholder="Add Product Picture"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
      
      <button
        onClick={handleAddProduct}
        className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 mt-4"
      >
        Add Product
      </button>
    </Modal>
  );
};

export default AddProductModal;
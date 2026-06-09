import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  FiPlus, FiSearch, FiEdit3, FiEye, FiTrash2, FiTag, FiFolder, 
  FiFolderPlus, FiImage, FiGrid, FiDollarSign, FiHash, FiCheckCircle, FiX 
} from 'react-icons/fi';
import { API_URL } from '../../config';
import { productService } from '../../services/POS/ProductService';

const ProductManagement = () => {
  const { darkMode } = useSelector((state) => state.ui);
  
  // Tabs: 'products' | 'categories'
  const [activeTab, setActiveTab] = useState('products');
  
  // Lists State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  
  // Search & Filter
  const [prodSearch, setProdSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  
  // Product Modal State
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    ppd_product_id: null,
    ppd_product_code: '',
    ppd_barcode: '',
    ppd_product_name: '',
    ppd_category_id: '',
    ppd_subcategory_id: '',
    ppd_price: '',
    ppd_product_image: ''
  });
  
  // Category / Subcategory modal & forms
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [isSubcatModalOpen, setIsSubcatModalOpen] = useState(false);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  // Alerts
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Load all lists
  const refreshAllData = async () => {
    try {
      let apiProducts = [];
      let apiCategories = [];
      let apiSubcategories = [];
      
      // Try to fetch from API
      try {
        const response = await productService.getAllProducts();
        if (response && Array.isArray(response) && response.length > 0) {
          apiProducts = response;
        }
      } catch (err) {
        console.warn('Failed to fetch products from API:', err.message);
      }

      // Map API products to state format
      const mapped = apiProducts.map(p => ({
        ppd_product_id: p.ProductId || p.ppd_product_id,
        ppd_product_code: p.ProductCode || p.ppd_product_code,
        ppd_barcode: p.BarCode || p.Barcode || p.ppd_barcode,
        ppd_product_name: p.ProductName || p.ppd_product_name,
        ppd_category_id: parseInt(p.CategoryId || p.ppd_category_id),
        ppd_subcategory_id: (p.SubCategoryId || p.ppd_subcategory_id) ? parseInt(p.SubCategoryId || p.ppd_subcategory_id) : null,
        ppd_price: parseFloat(p.Price || p.ppd_price) || 0,
        ppd_product_image: (() => {
          const rawImg = p.ImageUrl || p.imageUrl || p.ProductImage || p.ppd_product_image || '';
          const productId = p.ProductId || p.ppd_product_id;
          
          if (rawImg && (rawImg.startsWith('blob:') || rawImg.startsWith('data:'))) {
            return rawImg;
          }
          if (rawImg && rawImg.includes('svg+xml')) {
            return rawImg;
          }
          if (rawImg && rawImg.startsWith('http')) {
            return rawImg;
          }
          return '';
        })(),
        ppd_is_active: p.IsActive || p.ppd_is_active || 'A',
      }));
      setProducts(mapped);
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
    }
    
    // Load categories from API, fallback to mockDb
    try {
      const apiCategories = await productService.getAllCategories();
      if (apiCategories && apiCategories.length > 0) {
        const mapped = apiCategories.map(c => ({
          pcd_category_id: c.CategoryId || c.categoryId,
          pcd_category_name: c.CategoryName || c.categoryName,
          pcd_is_active: c.IsActive === false ? 'I' : 'A',
        }));
        setCategories(mapped);
      } else {
        setCategories([]);
      }
    } catch {
      console.warn('Failed to fetch categories from API');
      setCategories([]);
    }

    // Load subcategories from API, fallback to mockDb
    try {
      const apiSubcategories = await productService.getAllSubcategories();
      if (apiSubcategories && apiSubcategories.length > 0) {
        const mapped = apiSubcategories.map(s => ({
          psd_subcategory_id: s.SubCategoryId || s.subCategoryId,
          psd_category_id: s.CategoryId || s.categoryId,
          psd_subcategory_name: s.SubCategoryName || s.subCategoryName,
          psd_is_active: s.IsActive === false ? 'I' : 'A',
        }));
        setSubcategories(mapped);
      } else {
        setSubcategories([]);
      }
    } catch {
      console.warn('Failed to fetch subcategories from API');
      setSubcategories([]);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const triggerAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
  };

  // Image upload - keep file object for API, use preview URL for display
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerAlert('Image size should be less than 2MB', 'error');
        return;
      }
      // Store the file object in a temporary property for API upload
      // Store the preview URL separately for display
      const previewUrl = URL.createObjectURL(file);
      setCurrentProduct(prev => ({
        ...prev,
        ppd_product_image: previewUrl, // For preview display
        _imageFile: file // Temporary file object for API
      }));
    }
  };

  // Save Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const { ppd_product_code, ppd_barcode, ppd_product_name, ppd_category_id, ppd_price } = currentProduct;
    
    if (!ppd_product_code || !ppd_barcode || !ppd_product_name || !ppd_category_id || !ppd_price) {
      triggerAlert('Please fill in all required fields.', 'error');
      return;
    }

    try {
      const payload = {
        ...currentProduct,
        ppd_category_id: parseInt(currentProduct.ppd_category_id),
        ppd_subcategory_id: currentProduct.ppd_subcategory_id ? parseInt(currentProduct.ppd_subcategory_id) : null,
        ppd_price: parseFloat(ppd_price),
        ppd_is_active: currentProduct.ppd_is_active || 'A',
        _imageFile: currentProduct._imageFile || null // Include file object if available
      };

      let success = false;
      let isNew = !currentProduct.ppd_product_id;
      
      try {
        if (currentProduct.ppd_product_id) {
          const response = await productService.updateProduct(payload);
          if (response.StatusCode === 200) {
            triggerAlert('Product updated successfully!');
            success = true;
          } else {
            triggerAlert(response.Result || 'Product updated!');
            success = true;
          }
        } else {
          const response = await productService.addProduct(payload);
          if (response.StatusCode === 200) {
            triggerAlert('Product added successfully!');
            success = true;
          } else {
            triggerAlert(response.Result || 'Product added!');
            success = true;
          }
        }
      } catch (apiErr) {
        console.error('API Error:', apiErr);
        triggerAlert('Error saving product to API', 'error');
        success = false;
      }

      if (success) {
        setIsProdModalOpen(false);
        // Clean up object URL if it was created
        if (currentProduct._imageFile && currentProduct.ppd_product_image?.startsWith('blob:')) {
          URL.revokeObjectURL(currentProduct.ppd_product_image);
        }
        // Refresh all data from API/DB
        // This will get the latest products and avoid duplicates
        await refreshAllData();
      }
    } catch (err) {
      triggerAlert('Error saving product', 'error');
      console.error('Product save error:', err);
    }
  };

  // Edit product
  const openEditProduct = (prod) => {
    setCurrentProduct({
      ppd_product_id: prod.ppd_product_id,
      ppd_product_code: prod.ppd_product_code,
      ppd_barcode: prod.ppd_barcode,
      ppd_product_name: prod.ppd_product_name,
      ppd_category_id: prod.ppd_category_id,
      ppd_subcategory_id: prod.ppd_subcategory_id || '',
      ppd_price: prod.ppd_price,
      ppd_product_image: prod.ppd_product_image,
      ppd_is_active: prod.ppd_is_active
    });
    setIsProdModalOpen(true);
  };

  const openNewProduct = () => {
    setCurrentProduct({
      ppd_product_id: null,
      ppd_product_code: 'RSB-' + Math.floor(1000 + Math.random() * 9000),
      ppd_barcode: '880' + Math.floor(1000000000 + Math.random() * 9000000000),
      ppd_product_name: '',
      ppd_category_id: categories[0]?.pcd_category_id || '',
      ppd_subcategory_id: '',
      ppd_price: '',
      ppd_product_image: ''
    });
    setIsProdModalOpen(true);
  };

  // Add/Edit Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      if (editingCategory) {
        const response = await productService.updateCategory(
          editingCategory.pcd_category_id,
          categoryName.trim(),
          editingCategory.pcd_is_active === 'A'
        );
        if (response.StatusCode === 200) {
          triggerAlert(`Category "${categoryName}" updated successfully!`);
        } else {
          triggerAlert(response.Result || `Category "${categoryName}" updated!`);
        }
      } else {
        const response = await productService.addCategory(categoryName.trim());
        if (response.StatusCode === 200) {
          triggerAlert(`Category "${categoryName}" created successfully!`);
        } else {
          triggerAlert(response.Result || `Category "${categoryName}" created!`);
        }
      }
      setCategoryName('');
      setEditingCategory(null);
      setIsCatModalOpen(false);
      await refreshAllData();
    } catch (err) {
      triggerAlert(err.response?.data?.Result || err.message || 'Error saving category', 'error');
    }
  };

  // Add/Edit Subcategory
  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!subcategoryName.trim() || !parentCategoryId) return;
    try {
      if (editingSubcategory) {
        const response = await productService.updateSubcategory(
          editingSubcategory.psd_subcategory_id,
          parseInt(parentCategoryId),
          subcategoryName.trim(),
          editingSubcategory.psd_is_active === 'A'
        );
        if (response.StatusCode === 200) {
          triggerAlert(`Subcategory "${subcategoryName}" updated successfully!`);
        } else {
          triggerAlert(response.Result || `Subcategory "${subcategoryName}" updated!`);
        }
      } else {
        const response = await productService.addSubcategory(
          parseInt(parentCategoryId),
          subcategoryName.trim()
        );
        if (response.StatusCode === 200) {
          triggerAlert(`Subcategory "${subcategoryName}" created successfully!`);
        } else {
          triggerAlert(response.Result || `Subcategory "${subcategoryName}" created!`);
        }
      }
      setSubcategoryName('');
      setEditingSubcategory(null);
      setIsSubcatModalOpen(false);
      await refreshAllData();
    } catch (err) {
      triggerAlert(err.response?.data?.Result || err.message || 'Error saving subcategory', 'error');
    }
  };

  // Toggle Statuses
  const toggleProdStatus = async (id) => {
    try {
      const prod = products.find(p => p.ppd_product_id === id);
      if (!prod) return;
      
      let response;
      if (prod.ppd_is_active === 'A') {
        response = await productService.deleteProduct(id);
        if (response.StatusCode === 200) {
          triggerAlert('Product deactivated successfully!');
        } else {
          triggerAlert(response.Result || 'Product deactivated!');
        }
      } else {
        response = await productService.restoreProduct(id);
        if (response.StatusCode === 200) {
          triggerAlert('Product reactivated successfully!');
        } else {
          triggerAlert(response.Result || 'Product reactivated!');
        }
      }
      await refreshAllData();
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to update product status on API', 'error');
    }
  };

  const toggleCatStatus = async (id) => {
    try {
      const cat = categories.find(c => c.pcd_category_id === id);
      if (!cat) return;
      const newStatus = cat.pcd_is_active !== 'A';
      const response = await productService.updateCategory(id, cat.pcd_category_name, newStatus);
      if (response.StatusCode === 200) {
        triggerAlert('Category status updated successfully!');
      } else {
        triggerAlert(response.Result || 'Category status updated!');
      }
      await refreshAllData();
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to update category status on API', 'error');
    }
  };

  const toggleSubcatStatus = async (id) => {
    try {
      const sub = subcategories.find(s => s.psd_subcategory_id === id);
      if (!sub) return;
      const newStatus = sub.psd_is_active !== 'A';
      const response = await productService.updateSubcategory(
        id,
        sub.psd_category_id,
        sub.psd_subcategory_name,
        newStatus
      );
      if (response.StatusCode === 200) {
        triggerAlert('Subcategory status updated successfully!');
      } else {
        triggerAlert(response.Result || 'Subcategory status updated!');
      }
      await refreshAllData();
    } catch (err) {
      console.error(err);
      triggerAlert('Failed to update subcategory status on API', 'error');
    }
  };

  // Filtering
  const filteredProducts = products.filter(p => {
    const matchSearch = String(p.ppd_product_id) === prodSearch.trim() ||
                        p.ppd_product_name.toLowerCase().includes(prodSearch.toLowerCase()) ||
                        p.ppd_product_code.toLowerCase().includes(prodSearch.toLowerCase()) ||
                        p.ppd_barcode.toLowerCase().includes(prodSearch.toLowerCase());
    const matchCat = selectedCatFilter === 'all' || p.ppd_category_id === parseInt(selectedCatFilter);
    return matchSearch && matchCat;
  });

  const getCategoryName = (id) => {
    return categories.find(c => String(c.pcd_category_id) === String(id))?.pcd_category_name || 'N/A';
  };

  const getSubcategoryName = (id) => {
    return subcategories.find(s => String(s.psd_subcategory_id) === String(id))?.psd_subcategory_name || 'None';
  };

  const handleApiSearch = async () => {
    if (!prodSearch.trim()) {
      triggerAlert('Please enter a product ID, code, barcode, or name to search', 'error');
      return;
    }
    const query = prodSearch.trim().toLowerCase();
    
    // Find matching product locally
    const match = products.find(p => 
      String(p.ppd_product_id) === query ||
      p.ppd_product_name.toLowerCase() === query ||
      p.ppd_product_code.toLowerCase() === query ||
      p.ppd_barcode.toLowerCase() === query
    );

    if (match) {
      try {
        const apiProductRaw = await productService.getProductById(match.ppd_product_id);
        if (apiProductRaw) {
           const updatedProduct = {
             ...match,
             ppd_product_name: apiProductRaw.ProductName || match.ppd_product_name,
             ppd_price: parseFloat(apiProductRaw.Price || match.ppd_price),
             ppd_product_code: apiProductRaw.ProductCode || match.ppd_product_code,
             ppd_barcode: apiProductRaw.BarCode || match.ppd_barcode,
             ppd_category_id: apiProductRaw.CategoryId ? parseInt(apiProductRaw.CategoryId) : match.ppd_category_id,
             ppd_subcategory_id: apiProductRaw.SubCategoryId ? parseInt(apiProductRaw.SubCategoryId) : match.ppd_subcategory_id,
             ppd_product_image: apiProductRaw.ImageUrl || apiProductRaw.imageUrl || apiProductRaw.ProductImage || match.ppd_product_image,
             ppd_is_active: apiProductRaw.IsActive || match.ppd_is_active
           };
           setProducts(products.map(p => p.ppd_product_id === match.ppd_product_id ? updatedProduct : p));
           triggerAlert('Product data refreshed from API');
        } else {
           triggerAlert('Product not found via API', 'error');
        }
      } catch (err) {
        console.error(err);
        triggerAlert('Error connecting to API', 'error');
      }
    } else {
      triggerAlert(`No products found matching "${prodSearch}" in the system.`, 'error');
    }
  };

  return (
    <div className={`flex flex-col p-6 rounded-2xl shadow-xl h-full overflow-hidden transition-all duration-300 ${
      darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-800'
    } border`}>

      {/* Alert Header */}
      {alert.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down w-full max-w-md px-4">
          <div className={`flex items-center justify-between p-4 rounded-xl shadow-lg border ${
            alert.type === 'success' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              {alert.type === 'success' ? <FiCheckCircle className="w-5 h-5 text-green-600" /> : <FiX className="w-5 h-5 text-red-600" />}
              <p className="font-semibold text-sm">{alert.message}</p>
            </div>
            <button onClick={() => setAlert({ show: false, message: '', type: 'success' })} className="hover:opacity-70">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg text-white">
            <FiGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Product Catalog</h1>
            <p className="text-xs opacity-75">Manage Bathik clothing products and category filters</p>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'products' ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Products Catalog
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'categories' ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Categories & Subcategories
          </button>
        </div>
      </div>

      {/* RENDER PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="flex-grow flex flex-col overflow-hidden">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-grow flex shadow-sm rounded-xl">
              <div className="relative flex-grow">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  placeholder="Search by code, barcode, or product name..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleApiSearch(); }}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-l-xl border border-r-0 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <button
                onClick={handleApiSearch}
                className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-r-xl font-bold transition-all border border-teal-600 shadow-sm"
              >
                Search
              </button>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCatFilter}
                onChange={(e) => setSelectedCatFilter(e.target.value)}
                className={`px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-700'
                }`}
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.pcd_category_id} value={c.pcd_category_id}>{c.pcd_category_name}</option>
                ))}
              </select>

              <button
                onClick={openNewProduct}
                className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95 whitespace-nowrap"
              >
                <FiPlus className="w-5 h-5" /> Add Product
              </button>
            </div>
          </div>

          {/* Grid/Table View */}
          <div className="flex-grow overflow-auto rounded-2xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'}`}>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Image</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Code/Barcode</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Product Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Price (LKR)</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredProducts.map((prod) => (
                  <tr key={prod.ppd_product_id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-bold opacity-60">
                      {prod.ppd_product_id}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-700 bg-gray-100 flex items-center justify-center">
                        {prod.ppd_product_image ? (
                          <img
                            src={prod.ppd_product_image}
                            alt={prod.ppd_product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const src = e.target.src;
                              if (!src || !src.includes('imageName=')) return;
                              
                              const retryCount = parseInt(e.target.dataset.retryCount || '0', 10);
                              const extensions = ['.jpeg', '.jpg', '.png', '.webp', '.gif'];
                              
                              // Only retry a maximum of 3 times
                              if (retryCount >= extensions.length) {
                                e.target.style.display = 'none';
                                return;
                              }
                              
                              try {
                                const url = new URL(src);
                                const imageName = url.searchParams.get('imageName');
                                
                                if (imageName) {
                                  // Remove any existing extension from imageName
                                  const baseImageName = imageName.replace(/\.\w+$/, '');
                                  const newExt = extensions[retryCount];
                                  e.target.src = `${API_URL}/Products/ServeImage?fileName=${baseImageName}${newExt}`;
                                  e.target.dataset.retryCount = (retryCount + 1).toString();
                                } else {
                                  e.target.style.display = 'none';
                                }
                              } catch (err) {
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                        ) : (
                          <FiImage className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-bold text-teal-600 dark:text-teal-400">{prod.ppd_product_code}</div>
                      <div className="text-xs opacity-60 flex items-center gap-1 mt-0.5">
                        <FiHash className="w-3.5 h-3.5" /> {prod.ppd_barcode}
                      </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-bold">
                      {prod.ppd_product_name}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="text-sm">{getCategoryName(prod.ppd_category_id)}</div>
                      <div className="text-xs opacity-60 mt-0.5">{getSubcategoryName(prod.ppd_subcategory_id)}</div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-bold">
                      {prod.ppd_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        prod.ppd_is_active === 'A'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${prod.ppd_is_active === 'A' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {prod.ppd_is_active === 'A' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditProduct(prod)}
                          title="Edit Product"
                          className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40 transition-colors"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleProdStatus(prod.ppd_product_id)}
                          title={prod.ppd_is_active === 'A' ? 'Deactivate Product' : 'Activate Product'}
                          className={`p-2 rounded-lg transition-colors ${
                            prod.ppd_is_active === 'A'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                              : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40'
                          }`}
                        >
                          {prod.ppd_is_active === 'A' ? <FiTrash2 className="w-4 h-4" /> : <FiCheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <FiGrid className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-semibold opacity-75">No products found</p>
                <p className="text-xs opacity-60">Add a product or adjust your filters to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
          
          {/* Categories Manager Column */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiTag className="text-teal-500" /> Categories (ps_categories_details)
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryName('');
                  setIsCatModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-2 rounded-xl transition-all shadow"
              >
                <FiPlus /> Add Category
              </button>
            </div>
            
            <div className="flex-grow overflow-auto border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border-b dark:border-gray-700`}>
                    <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">ID</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Category Name</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 text-center">Status</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {categories.map(cat => (
                    <tr key={cat.pcd_category_id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}`}>
                      <td className="px-5 py-3 text-sm font-bold opacity-60">{cat.pcd_category_id}</td>
                      <td className="px-5 py-3 text-sm font-bold">{cat.pcd_category_name}</td>
                      <td className="px-5 py-3 text-sm text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          cat.pcd_is_active === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-red-100 text-red-800 dark:bg-red-900/30'
                        }`}>
                          {cat.pcd_is_active === 'A' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategoryName(cat.pcd_category_name);
                              setIsCatModalOpen(true);
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleCatStatus(cat.pcd_category_id)}
                            className={`text-xs font-bold underline transition-colors ${
                              cat.pcd_is_active === 'A' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'
                            }`}
                          >
                            {cat.pcd_is_active === 'A' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subcategories Manager Column */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FiFolder className="text-teal-500" /> Subcategories (ps_subcategories_details)
              </h2>
              <button
                onClick={() => {
                  setEditingSubcategory(null);
                  setSubcategoryName('');
                  setParentCategoryId(categories[0]?.pcd_category_id || '');
                  setIsSubcatModalOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-2 rounded-xl transition-all shadow"
              >
                <FiPlus /> Add Subcategory
              </button>
            </div>
            
            <div className="flex-grow overflow-auto border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-800/10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} border-b dark:border-gray-700`}>
                    <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">ID</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Subcategory</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Parent Category</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 text-center">Status</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {subcategories.map(sub => (
                    <tr key={sub.psd_subcategory_id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/40' : 'hover:bg-gray-50'}`}>
                      <td className="px-5 py-3 text-sm font-bold opacity-60">{sub.psd_subcategory_id}</td>
                      <td className="px-5 py-3 text-sm font-bold">{sub.psd_subcategory_name}</td>
                      <td className="px-5 py-3 text-sm font-semibold">{getCategoryName(sub.psd_category_id)}</td>
                      <td className="px-5 py-3 text-sm text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sub.psd_is_active === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-red-100 text-red-800 dark:bg-red-900/30'
                        }`}>
                          {sub.psd_is_active === 'A' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setEditingSubcategory(sub);
                              setSubcategoryName(sub.psd_subcategory_name);
                              setParentCategoryId(sub.psd_category_id);
                              setIsSubcatModalOpen(true);
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleSubcatStatus(sub.psd_subcategory_id)}
                            className={`text-xs font-bold underline transition-colors ${
                              sub.psd_is_active === 'A' ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'
                            }`}
                          >
                            {sub.psd_is_active === 'A' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DIALOG MODAL */}
      {isProdModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up ${
            darkMode ? 'bg-gray-850 border border-gray-700 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">{currentProduct.ppd_product_id ? 'Edit Product Details' : 'Add New Product'}</h2>
              <button onClick={() => setIsProdModalOpen(false)} className="hover:opacity-75"><FiX className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSaveProduct}>
              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                
                {/* Image and basic info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1 flex flex-col items-center justify-center">
                    <div className="w-28 h-28 rounded-2xl overflow-hidden border border-dashed border-gray-300 dark:border-gray-650 bg-gray-50 dark:bg-gray-850 flex items-center justify-center relative group">
                      {currentProduct.ppd_product_image ? (
                        <>
                          <img
                            src={currentProduct.ppd_product_image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const src = e.target.src;
                              if (!src || !src.includes('imageName=')) return;
                              
                              const retryCount = parseInt(e.target.dataset.retryCount || '0', 10);
                              const extensions = ['.jpeg', '.jpg', '.png', '.webp', '.gif'];
                              
                              // Only retry a maximum of 3 times
                              if (retryCount >= extensions.length) {
                                e.target.style.display = 'none';
                                return;
                              }
                              
                              try {
                                const url = new URL(src);
                                const imageName = url.searchParams.get('imageName');
                                
                                if (imageName) {
                                  // Remove any existing extension from imageName
                                  const baseImageName = imageName.replace(/\.\w+$/, '');
                                  const newExt = extensions[retryCount];
                                  e.target.src = `${API_URL}/Products/ServeImage?fileName=${baseImageName}${newExt}`;
                                  e.target.dataset.retryCount = (retryCount + 1).toString();
                                } else {
                                  e.target.style.display = 'none';
                                }
                              } catch (err) {
                                e.target.style.display = 'none';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (currentProduct.ppd_product_id) {
                                try {
                                  await productService.deleteProductImage(currentProduct.ppd_product_id);
                                  triggerAlert("Product image permanently deleted.");
                                } catch (err) {
                                  console.error(err);
                                  triggerAlert("Failed to delete image on API", "error");
                                }
                              }
                              setCurrentProduct(prev => ({
                                ...prev,
                                ppd_product_image: "",
                                _imageFile: null
                              }));
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-750 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 shadow-lg z-20"
                            title="Delete Image"
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-2">
                          <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                          <span className="text-[10px] opacity-60">Upload Photo</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs font-bold mb-1 uppercase tracking-wide">Product Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Blue Indigo Silk Saree"
                        value={currentProduct.ppd_product_name}
                        onChange={e => setCurrentProduct({ ...currentProduct, ppd_product_name: e.target.value })}
                        className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 uppercase tracking-wide">Price (LKR) *</label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="Price"
                          value={currentProduct.ppd_price}
                          onChange={e => setCurrentProduct({ ...currentProduct, ppd_price: e.target.value })}
                          className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wide">Product Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RSB-SAR-001"
                      value={currentProduct.ppd_product_code}
                      onChange={e => setCurrentProduct({ ...currentProduct, ppd_product_code: e.target.value })}
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wide">Barcode (EAN/SKU) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8801122330012"
                      value={currentProduct.ppd_barcode}
                      onChange={e => setCurrentProduct({ ...currentProduct, ppd_barcode: e.target.value })}
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wide">Category *</label>
                    <select
                      required
                      value={currentProduct.ppd_category_id}
                      onChange={e => setCurrentProduct({ ...currentProduct, ppd_category_id: e.target.value, ppd_subcategory_id: '' })}
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map(c => (
                        <option key={c.pcd_category_id} value={c.pcd_category_id}>{c.pcd_category_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold mb-1 uppercase tracking-wide">Subcategory</label>
                    <select
                      value={currentProduct.ppd_subcategory_id}
                      onChange={e => setCurrentProduct({ ...currentProduct, ppd_subcategory_id: e.target.value })}
                      className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <option value="">None / Select Subcategory</option>
                      {subcategories
                        .filter(s => String(s.psd_category_id) === String(currentProduct.ppd_category_id))
                        .map(s => (
                          <option key={s.psd_subcategory_id} value={s.psd_subcategory_id}>{s.psd_subcategory_name}</option>
                        ))}
                    </select>
                  </div>
                </div>

              </div>
              <div className="flex justify-end gap-3 p-5 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsProdModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-transparent border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY DIALOG MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up ${
            darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => { setIsCatModalOpen(false); setEditingCategory(null); }} className="hover:opacity-75"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCategory}>
              <div className="p-5">
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Saree, Sarong, Frock"
                  value={categoryName}
                  onChange={e => setCategoryName(e.target.value)}
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div className="flex justify-end gap-3 p-5 bg-gray-50 dark:bg-gray-900/40">
                <button
                  type="button"
                  onClick={() => { setIsCatModalOpen(false); setEditingCategory(null); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-transparent border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow"
                >
                  {editingCategory ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBCATEGORY DIALOG MODAL */}
      {isSubcatModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className={`rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up ${
            darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold">{editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}</h2>
              <button onClick={() => { setIsSubcatModalOpen(false); setEditingSubcategory(null); }} className="hover:opacity-75"><FiX className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveSubcategory}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide">Parent Category *</label>
                  <select
                    required
                    value={parentCategoryId}
                    onChange={e => setParentCategoryId(e.target.value)}
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c.pcd_category_id} value={c.pcd_category_id}>{c.pcd_category_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 uppercase tracking-wide">Subcategory Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cotton, Silk, Linen"
                    value={subcategoryName}
                    onChange={e => setSubcategoryName(e.target.value)}
                    className={`w-full px-3.5 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-5 bg-gray-50 dark:bg-gray-900/40">
                <button
                  type="button"
                  onClick={() => { setIsSubcatModalOpen(false); setEditingSubcategory(null); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-transparent border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow"
                >
                  {editingSubcategory ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManagement;

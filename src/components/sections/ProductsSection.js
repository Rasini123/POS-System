// import React, { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   filterProducts,
//   searchProducts,
//   fetchCategories,
//   fetchSubcategories,
//   fetchProductsBySubcategory,
//   setCurrentCategory,
//   setCurrentSubcategory,
//   fetchProducts,
// } from "../../actions/POS/productAction";
// import { addToCartWithSync } from "../../actions/POS/cartActions";
// import ProductCard from "../common/ProductCard";

// const ProductsSection = () => {
//   const dispatch = useDispatch();
//   const {
//     filteredProducts,
//     allProducts,
//     categories,
//     subcategories,
//     currentCategory,
//     currentSubcategory,
//     searchQuery,
//     loading,
//   } = useSelector((state) => state.products);

//   const { darkMode } = useSelector((state) => state.ui);
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [isSearchFocused, setIsSearchFocused] = useState(false);
//   const barcodeInputRef = useRef(null);

//   useEffect(() => {
//     dispatch(fetchCategories());
//     dispatch(fetchProducts());
     
//     if (barcodeInputRef.current) {
//       barcodeInputRef.current.focus();
//     }
//   }, [dispatch]);
 
//   useEffect(() => {
//     const handleFocusLoss = () => { 
//       if (barcodeInputRef.current && 
//           document.activeElement !== barcodeInputRef.current &&
//           document.activeElement.tagName !== 'INPUT' &&
//           !isSearchFocused) {
//         setTimeout(() => {
//           barcodeInputRef.current?.focus();
//         }, 100);
//       }
//     };
 
//     document.addEventListener('click', handleFocusLoss);
//     document.addEventListener('keydown', handleFocusLoss);

//     return () => {
//       document.removeEventListener('click', handleFocusLoss);
//       document.removeEventListener('keydown', handleFocusLoss);
//     };
//   }, [isSearchFocused]);

//   const handleCategoryClick = async (categoryId) => {
//     if (selectedCategory === categoryId) {
//       setSelectedCategory(null);
//       dispatch(setCurrentCategory("all"));
//       dispatch(setCurrentSubcategory(null));
//       dispatch(filterProducts("all"));
//     } else {
//       setSelectedCategory(categoryId);
//       dispatch(setCurrentCategory(categoryId));
//       dispatch(setCurrentSubcategory(null));

//       if (categoryId === "all") {
//         dispatch(filterProducts("all"));
//       } else {
//         await dispatch(fetchSubcategories(categoryId));
//         dispatch(filterProducts(categoryId));
//       }
//     }
     
//     setTimeout(() => {
//       barcodeInputRef.current?.focus();
//     }, 100);
//   };

//   const handleSubcategoryClick = async (subcategoryId) => {
//     dispatch(setCurrentSubcategory(subcategoryId));
//     await dispatch(fetchProductsBySubcategory(subcategoryId));
     
//     setTimeout(() => {
//       barcodeInputRef.current?.focus();
//     }, 100);
//   };

//   const validateStockAndAddToCart = (product) => {
//     if (product.stock <= 0) {
//       alert(`"${product.name}" is out of stock!`);
//       return false;
//     }

//     if (product.stock < 5) {
//       const proceed = window.confirm(
//         `"${product.name}" has low stock (${product.stock} items remaining). Continue adding to cart?`
//       );
//       if (!proceed) return false;
//     }

//     dispatch(addToCartWithSync(product));
//     return true;
//   };

//   const handleSearch = (e) => {
//     if (e.key === "Enter" || e.type === "click") {
//        if (selectedCategory || currentSubcategory) {
//       setSelectedCategory(null);
//       dispatch(setCurrentCategory("all"));
//       dispatch(setCurrentSubcategory(null));
//     }
//       dispatch(searchProducts(searchQuery));
       
//       setTimeout(() => {
//         barcodeInputRef.current?.focus();
//       }, 100);
//     }
//   };

//   const handleBarcodeScan = (e) => {
//     if (e.key === "Enter" && barcodeInput.trim()) {
//       const product = allProducts.find(
//         (p) => p.barcode === barcodeInput.trim()
//       );
//       if (product && product.stock > 0) {
//         dispatch(addToCartWithSync(product));
//         setBarcodeInput("");
//         // Re-focus after successful scan
//         setTimeout(() => {
//           barcodeInputRef.current?.focus();
//         }, 50);
//       } else {
//         alert("Product not found or out of stock");
//         setBarcodeInput("");
//         // Re-focus after error
//         setTimeout(() => {
//           barcodeInputRef.current?.focus();
//         }, 50);
//       }
//     }
//   };

//   // Handle barcode input changes
//   const handleBarcodeChange = (e) => {
//     setBarcodeInput(e.target.value);
//   };

//   // Modern skeleton loader component
//   const CategorySkeleton = () => (
//     <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3 mb-3 md:mb-4">
//       {[...Array(6)].map((_, i) => (
//         <div
//           key={i}
//           className={`rounded-xl p-3 md:p-4 animate-pulse ${
//             darkMode ? "bg-gray-700/50" : "bg-gray-200/50"
//           }`}
//         >
//           <div
//             className={`h-8 w-8 mx-auto mb-2 rounded-full ${
//               darkMode ? "bg-gray-600" : "bg-gray-300"
//             }`}
//           ></div>
//           <div
//             className={`h-3 w-16 mx-auto rounded ${
//               darkMode ? "bg-gray-600" : "bg-gray-300"
//             }`}
//           ></div>
//         </div>
//       ))}
//     </div>
//   );

//   const ProductSkeleton = () => (
//     <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
//       {[...Array(10)].map((_, i) => (
//         <div
//           key={i}
//           className={`rounded-xl p-3 animate-pulse ${
//             darkMode ? "bg-gray-700/50" : "bg-gray-200/50"
//           }`}
//         >
//           <div
//             className={`h-32 w-full mb-3 rounded-lg ${
//               darkMode ? "bg-gray-600" : "bg-gray-300"
//             }`}
//           ></div>
//           <div
//             className={`h-4 w-3/4 mb-2 rounded ${
//               darkMode ? "bg-gray-600" : "bg-gray-300"
//             }`}
//           ></div>
//           <div
//             className={`h-3 w-1/2 rounded ${
//               darkMode ? "bg-gray-600" : "bg-gray-300"
//             }`}
//           ></div>
//         </div>
//       ))}
//     </div>
//   );

//   if (loading) {
//     return (
//       <div
//         className={`flex flex-col p-4 md:p-6 rounded-2xl shadow-lg h-full ${
//           darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
//         } border`}
//       >
//         <div className="mb-4">
//           {/* Search skeleton */}
//           <div
//             className={`h-12 mb-3 rounded-xl animate-pulse ${
//               darkMode ? "bg-gray-700/50" : "bg-gray-200/50"
//             }`}
//           ></div>
//           <div
//             className={`h-12 mb-4 rounded-xl animate-pulse ${
//               darkMode ? "bg-gray-700/50" : "bg-gray-200/50"
//             }`}
//           ></div>

//           <CategorySkeleton />
//         </div>

//         <div className="flex-grow overflow-hidden">
//           <ProductSkeleton />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`flex flex-col p-3 md:p-5 rounded-2xl shadow-lg h-full transition-all duration-300 ${
//         darkMode
//           ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
//           : "bg-white border-gray-200"
//       } border`}
//     >
//       {/* Search Section */}
//       <div className="mb-4 md:mb-5 space-y-3">
//         {/* Combined Barcode and Search Inputs in One Line */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           {/* Barcode Input - Left Side - Always Focused */}
//           <div className="relative group">
//             <div
//               className={`flex items-center rounded-md overflow-hidden shadow-sm transition-all duration-200 ${
//                 darkMode
//                   ? "bg-gray-700/50 border-green-500 shadow-md"
//                   : "bg-gray-50 border-green-500 shadow-md"
//               } border-2`}
//             >
//               <div className="pl-2 pr-1 text-green-500">
//                 <i className="fas fa-barcode text-sm"></i>
//               </div>

//               <input
//                 ref={barcodeInputRef}
//                 type="text"
//                 value={barcodeInput}
//                 onChange={handleBarcodeChange}
//                 onKeyPress={handleBarcodeScan}
//                 placeholder="Scan or type barcode..."
//                 className={`flex-grow px-2 py-2 bg-transparent focus:outline-none text-xs ${
//                   darkMode
//                     ? "text-white placeholder-gray-400"
//                     : "text-gray-800 placeholder-gray-500"
//                 }`}
//                 autoFocus
//               />

//               <button
//                 onClick={() => handleBarcodeScan({ key: "Enter" })}
//                 className="px-3 py-1 ml-1 rounded-r-md bg-gradient-to-r from-green-500 to-green-600 text-white text-xs transition-all hover:from-green-600 hover:to-green-700 active:scale-95"
//               >
//                 <i className="fas fa-arrow-right text-sm"></i>
//               </button>
//             </div>
//             {/* <div className="absolute -bottom-5 left-0 text-xs text-green-500 font-medium">
//               ✓ Always ready for barcode scan
//             </div> */}
//           </div>

//           {/* Product Search - Right Side */}
//           <div className="relative group">
//             <div
//               className={`flex items-center rounded-md overflow-hidden shadow-sm transition-all duration-200 ${
//                 isSearchFocused
//                   ? darkMode
//                     ? "bg-gray-700/50 border-green-500 shadow-md"
//                   : "bg-gray-50 border-green-500 shadow-md"
//                   : darkMode
//                   ? "bg-gray-700/50 border-gray-600"
//                   : "bg-gray-50 border-gray-300"
//               } border-2`}
//             >
//               <div
//                 className={`pl-2 pr-1 transition-colors ${
//                   isSearchFocused ? "text-blue-500" : "text-gray-400"
//                 }`}
//               >
//                 <i className="fas fa-search text-sm"></i>
//               </div>

//               <input
//                 type="text"
//                 value={searchQuery}
//                   onChange={(e) => { 
//     if (selectedCategory || currentSubcategory) {
//       setSelectedCategory(null);
//       dispatch(setCurrentCategory("all"));
//       dispatch(setCurrentSubcategory(null));
//     }

//     dispatch(searchProducts(e.target.value));
//   }}
//                 onKeyPress={handleSearch}
//                 onFocus={() => setIsSearchFocused(true)}
//                 onBlur={() => {
//                   setIsSearchFocused(false); 
//                   setTimeout(() => {
//                     barcodeInputRef.current?.focus();
//                   }, 200);
//                 }}
//                 placeholder="Search by name, SKU, category..."
//                 className={`flex-grow px-2 py-2 bg-transparent focus:outline-none text-xs ${
//                   darkMode
//                     ? "text-white placeholder-gray-400"
//                     : "text-gray-800 placeholder-gray-500"
//                 }`}
//               />

//               {searchQuery && (
//                 <button
//                   onClick={() => {
//                     dispatch(searchProducts("")); 
//                     setTimeout(() => {
//                       barcodeInputRef.current?.focus();
//                     }, 100);
//                   }}
//                   className="px-2 text-gray-400 hover:text-red-500 transition-colors text-xs"
//                   title="Clear"
//                 >
//                   <i className="fas fa-times text-sm"></i>
//                 </button>
//               )}

//               <button
//                 onClick={handleSearch}
//                 className="px-3 py-2 ml-1 rounded-r-md bg-gradient-to-r from-green-500 to-green-600 text-white text-xs transition-all hover:from-green-600 hover:to-green-700 active:scale-95"
//               >
//                 Search
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Main Categories */}
//         <div className="relative">
//           <div className="flex items-center justify-between mb-1">
//             <h3
//               className={`text-xs font-semibold ${
//                 darkMode ? "text-gray-300" : "text-gray-700"
//               }`}
//             >
//               Categories
//             </h3>
//             {selectedCategory && (
//               <button
//                 onClick={() => handleCategoryClick(selectedCategory)}
//                 className="text-[11px] text-green-500 hover:text-green-600 font-medium flex items-center gap-1"
//               >
//                 <i className="fas fa-times-circle text-[10px]"></i>
//                 Clear
//               </button>
//             )}
//           </div>

//           <div className="relative">
//             <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 custom-scrollbar-horizontal">
//               {categories.map((category) => (
//                 <button
//                   key={category.id}
//                   onClick={() => handleCategoryClick(category.id)}
//                   className={`group relative flex flex-col items-center justify-center min-w-[70px] md:min-w-[85px] p-2 md:p-2.5 rounded-md text-center transition-all duration-200 transform hover:scale-105 flex-shrink-0 ${
//                     selectedCategory === category.id
//                       ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-500/40 scale-105"
//                       : darkMode
//                       ? "bg-gray-700/70 text-gray-300 hover:bg-gray-700 hover:shadow-sm"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
//                   }`}
//                 >
//                   <div
//                     className={`mb-1 transition-transform duration-200 ${
//                       selectedCategory === category.id
//                         ? "scale-110"
//                         : "group-hover:scale-110"
//                     }`}
//                   >
//                     <i className={`${category.icon} text-sm md:text-base`}></i>
//                   </div>
//                   <span className="text-[10px] font-medium whitespace-nowrap leading-tight">
//                     {category.label}
//                   </span>

//                   {selectedCategory === category.id && (
//                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
//                       <i className="fas fa-check text-green-500 text-[9px]"></i>
//                     </div>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Subcategories */}
//         {selectedCategory && subcategories[selectedCategory]?.length > 0 && (
//           <div className="relative animate-fadeIn">
//             <div className="flex items-center justify-between mb-2">
//               <h3
//                 className={`text-sm font-semibold ${
//                   darkMode ? "text-gray-300" : "text-gray-700"
//                 }`}
//               >
//                 Subcategories
//               </h3>
//               {currentSubcategory && (
//                 <button
//                   onClick={() => {
//                     dispatch(setCurrentSubcategory(null));
//                     dispatch(filterProducts(selectedCategory));
//                     // Re-focus barcode input
//                     setTimeout(() => {
//                       barcodeInputRef.current?.focus();
//                     }, 100);
//                   }}
//                   className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
//                 >
//                   <i className="fas fa-times-circle"></i>
//                   Clear
//                 </button>
//               )}
//             </div>
//             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
//               {subcategories[selectedCategory].map((subcategory) => (
//                 <button
//                   key={subcategory.id}
//                   onClick={() => handleSubcategoryClick(subcategory.id)}
//                   className={`relative px-4 py-3 rounded-lg text-center transition-all duration-300 transform hover:scale-105 ${
//                     currentSubcategory === subcategory.id
//                       ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105"
//                       : darkMode
//                       ? "bg-gray-600/70 text-gray-300 hover:bg-gray-600 hover:shadow-md"
//                       : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md"
//                   }`}
//                 >
//                   <span className="text-xs font-medium">
//                     {subcategory.label}
//                   </span>
//                   {currentSubcategory === subcategory.id && (
//                     <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
//                       <i className="fas fa-check text-blue-500 text-xs"></i>
//                     </div>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Products Grid */}
//       <div className="flex-grow overflow-hidden">
//         <div
//           className={`h-full rounded-xl p-3 md:p-4 overflow-y-auto custom-scrollbar ${
//             darkMode ? "bg-gray-900/30" : "bg-gray-50/50"
//           }`}
//         >
//           {filteredProducts.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full text-center py-12">
//               <div
//                 className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
//                   darkMode ? "bg-gray-700" : "bg-gray-200"
//                 }`}
//               >
//                 <i className="fas fa-box-open text-3xl text-gray-400"></i>
//               </div>
//               <p
//                 className={`text-lg font-medium mb-1 ${
//                   darkMode ? "text-gray-300" : "text-gray-700"
//                 }`}
//               >
//                 No products found
//               </p>
//               <p
//                 className={`text-sm ${
//                   darkMode ? "text-gray-400" : "text-gray-500"
//                 }`}
//               >
//                 Try adjusting your search or filters
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="flex items-center justify-between mb-3">
//                 <p
//                   className={`text-sm font-medium ${
//                     darkMode ? "text-gray-400" : "text-gray-600"
//                   }`}
//                 >
//                   {filteredProducts.length}{" "}
//                   {filteredProducts.length === 1 ? "product" : "products"} found
//                 </p>
//               </div>
//               <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
//                 {filteredProducts.map((product) => (
//                   <ProductCard
//                     key={product.id}
//                     product={product}
//                     darkMode={darkMode}
//                   />
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }

//         /* 🌿 Ultra-Compact Custom Scrollbar */
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 3px;
//           height: 3px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: transparent;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: ${darkMode ? "rgba(107,114,128,0.4)" : "rgba(156,163,175,0.4)"};
//           border-radius: 10px;
//           transition: background 0.2s ease, width 0.2s ease;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: ${darkMode ? "rgba(107,114,128,0.7)" : "rgba(156,163,175,0.7)"};
//         }

//         .custom-scrollbar {
//           scrollbar-width: thin;
//           scrollbar-color: ${darkMode ? "rgba(107,114,128,0.4) transparent" : "rgba(156,163,175,0.4) transparent"};
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ProductsSection;

 





import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  filterProducts,
  searchProducts,
  fetchCategories,
  fetchSubcategories,
  fetchProductsBySubcategory,
  setCurrentCategory,
  setCurrentSubcategory,
  fetchProducts,
} from "../../actions/POS/productAction";
import { addToCartWithSync } from "../../actions/POS/cartActions";
import ProductCard from "../common/ProductCard";
import BatchSelectionModal from "../modals/BatchSelectionModal";

const ProductsSection = () => {
  const dispatch = useDispatch();
  const {
    filteredProducts,
    allProducts,
    categories,
    subcategories,
    currentCategory,
    currentSubcategory,
    searchQuery,
    loading,
  } = useSelector((state) => state.products);

  const { darkMode } = useSelector((state) => state.ui);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedProductBatches, setSelectedProductBatches] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const barcodeInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());

    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [dispatch]);

  useEffect(() => {
    const handleFocusLoss = () => {
      if (barcodeInputRef.current &&
        document.activeElement !== barcodeInputRef.current &&
        document.activeElement.tagName !== 'INPUT' &&
        !isSearchFocused) {
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, 100);
      }
    };

    document.addEventListener('click', handleFocusLoss);
    document.addEventListener('keydown', handleFocusLoss);

    return () => {
      document.removeEventListener('click', handleFocusLoss);
      document.removeEventListener('keydown', handleFocusLoss);
    };
  }, [isSearchFocused]);

  const handleCategoryClick = async (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      dispatch(setCurrentCategory("all"));
      dispatch(setCurrentSubcategory(null));
      dispatch(filterProducts("all"));
    } else {
      setSelectedCategory(categoryId);
      dispatch(setCurrentCategory(categoryId));
      dispatch(setCurrentSubcategory(null));

      if (categoryId === "all") {
        dispatch(filterProducts("all"));
      } else {
        await dispatch(fetchSubcategories(categoryId));
        dispatch(filterProducts(categoryId));
      }
    }

    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  const handleBatchSelect = (selectedBatch) => {


    // Validate stock for the selected batch
    if (selectedBatch.stock <= 0) {
      alert(`"${selectedBatch.name}" (Batch ${selectedBatch.batchId}) is out of stock!`);
      return;
    }

    if (selectedBatch.stock < 5) {
      const proceed = window.confirm(
        `"${selectedBatch.name}" (Batch ${selectedBatch.batchId}) has low stock (${selectedBatch.stock} items remaining). Continue adding to cart?`
      );
      if (!proceed) return;
    }

    // Dispatch with the complete batch data
    dispatch(addToCartWithSync(selectedBatch));
  };

  const handleSubcategoryClick = async (subcategoryId) => {
    dispatch(setCurrentSubcategory(subcategoryId));
    await dispatch(fetchProductsBySubcategory(subcategoryId));

    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  const validateStockAndAddToCart = (product) => {
    if (product.hasMultipleBatches && product.allBatches && product.allBatches.length > 1) {
      setSelectedProductBatches(product.allBatches);
      setSelectedProduct(product);
      setShowBatchModal(true);
      return false;
    }

    const productToAdd = product.isBatchProduct ? product : {
      ...product,
      batchId: product.batchId || product.allBatches?.[0]?.batchId || '0'
    };

    if (productToAdd.stock <= 0) {
      alert(`"${productToAdd.name}" is out of stock!`);
      return false;
    }

    if (productToAdd.stock < 5) {
      const proceed = window.confirm(
        `"${productToAdd.name}" has low stock (${productToAdd.stock} items remaining). Continue adding to cart?`
      );
      if (!proceed) return false;
    }

    dispatch(addToCartWithSync(productToAdd));
    return true;
  };



  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (selectedCategory || currentSubcategory) {
        setSelectedCategory(null);
        dispatch(setCurrentCategory("all"));
        dispatch(setCurrentSubcategory(null));
      }
      dispatch(searchProducts(searchQuery));

      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    }
  };

  const handleBarcodeScan = (e) => {
    if (e.key === "Enter" && barcodeInput.trim()) {

      const product = allProducts.find(
        (p) => p.barcode === barcodeInput.trim()
      );

      if (product) {
        if (product.hasMultipleBatches && product.allBatches && product.allBatches.length > 1) {
          setSelectedProductBatches(product.allBatches);
          setSelectedProduct(product);
          setShowBatchModal(true);
        } else {
          const productToAdd = {
            ...product,
            batchId: product.batchId || product.allBatches?.[0]?.batchId || '0'
          };

          if (productToAdd.stock > 0) {
            dispatch(addToCartWithSync(productToAdd));
          } else {
            alert("Product is out of stock");
          }
        }
      } else {
        alert("Product not found");
      }

      setBarcodeInput("");
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 50);
    }
  };

  const handleBarcodeChange = (e) => {
    setBarcodeInput(e.target.value);
  };

  const CategorySkeleton = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3 mb-3 md:mb-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`rounded-xl p-3 md:p-4 animate-pulse ${darkMode ? "bg-gray-700/50" : "bg-gray-200/50"
            }`}
        >
          <div
            className={`h-8 w-8 mx-auto mb-2 rounded-full ${darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
          ></div>
          <div
            className={`h-3 w-16 mx-auto rounded ${darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
          ></div>
        </div>
      ))}
    </div>
  );

  const ProductSkeleton = () => (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={`rounded-xl p-3 animate-pulse ${darkMode ? "bg-gray-700/50" : "bg-gray-200/50"
            }`}
        >
          <div
            className={`h-32 w-full mb-3 rounded-lg ${darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
          ></div>
          <div
            className={`h-4 w-3/4 mb-2 rounded ${darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
          ></div>
          <div
            className={`h-3 w-1/2 rounded ${darkMode ? "bg-gray-600" : "bg-gray-300"
              }`}
          ></div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div
        className={`flex flex-col p-4 md:p-6 rounded-2xl shadow-lg h-full ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          } border`}
      >
        <div className="mb-4">
          {/* Search skeleton */}
          <div
            className={`h-12 mb-3 rounded-xl animate-pulse ${darkMode ? "bg-gray-700/50" : "bg-gray-200/50"
              }`}
          ></div>
          <div
            className={`h-12 mb-4 rounded-xl animate-pulse ${darkMode ? "bg-gray-700/50" : "bg-gray-200/50"
              }`}
          ></div>

          <CategorySkeleton />
        </div>

        <div className="flex-grow overflow-hidden">
          <ProductSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col p-3 md:p-5 rounded-2xl shadow-lg h-full transition-all duration-300 ${darkMode
          ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
          : "bg-white border-gray-200"
        } border`}
    >
      {/* Search Section */}
      <div className="mb-4 md:mb-5 space-y-3">
        {/* Combined Barcode and Search Inputs in One Line */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Barcode Input - Left Side - Always Focused */}
          <div className="relative group">
            <div
              className={`flex items-center rounded-md overflow-hidden shadow-sm transition-all duration-200 ${darkMode
                  ? "bg-gray-700/50 border-green-500 shadow-md"
                  : "bg-gray-50 border-green-500 shadow-md"
                } border-2`}
            >
              <div className="pl-2 pr-1 text-green-500">
                <i className="fas fa-barcode text-sm"></i>
              </div>

              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={handleBarcodeChange}
                onKeyPress={handleBarcodeScan}
                placeholder="Scan or type barcode..."
                className={`flex-grow px-2 py-2 bg-transparent focus:outline-none text-xs ${darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-gray-800 placeholder-gray-500"
                  }`}
                autoFocus
              />

              <button
                onClick={() => handleBarcodeScan({ key: "Enter" })}
                className="px-3 py-1 ml-1 rounded-r-md bg-gradient-to-r from-green-500 to-green-600 text-white text-xs transition-all hover:from-green-600 hover:to-green-700 active:scale-95"
              >
                <i className="fas fa-arrow-right text-sm"></i>
              </button>
            </div>
          </div>

          {/* Product Search - Right Side */}
          <div className="relative group">
            <div
              className={`flex items-center rounded-md overflow-hidden shadow-sm transition-all duration-200 ${isSearchFocused
                  ? darkMode
                    ? "bg-gray-700/50 border-green-500 shadow-md"
                    : "bg-gray-50 border-green-500 shadow-md"
                  : darkMode
                    ? "bg-gray-700/50 border-gray-600"
                    : "bg-gray-50 border-gray-300"
                } border-2`}
            >
              <div
                className={`pl-2 pr-1 transition-colors ${isSearchFocused ? "text-blue-500" : "text-gray-400"
                  }`}
              >
                <i className="fas fa-search text-sm"></i>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  if (selectedCategory || currentSubcategory) {
                    setSelectedCategory(null);
                    dispatch(setCurrentCategory("all"));
                    dispatch(setCurrentSubcategory(null));
                  }

                  dispatch(searchProducts(e.target.value));
                }}
                onKeyPress={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  setIsSearchFocused(false);
                  setTimeout(() => {
                    barcodeInputRef.current?.focus();
                  }, 200);
                }}
                placeholder="Search by name, SKU, category..."
                className={`flex-grow px-2 py-2 bg-transparent focus:outline-none text-xs ${darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-gray-800 placeholder-gray-500"
                  }`}
              />

              {searchQuery && (
                <button
                  onClick={() => {
                    dispatch(searchProducts(""));
                    setTimeout(() => {
                      barcodeInputRef.current?.focus();
                    }, 100);
                  }}
                  className="px-2 text-gray-400 hover:text-red-500 transition-colors text-xs"
                  title="Clear"
                >
                  <i className="fas fa-times text-sm"></i>
                </button>
              )}

              <button
                onClick={handleSearch}
                className="px-3 py-2 ml-1 rounded-r-md bg-gradient-to-r from-green-500 to-green-600 text-white text-xs transition-all hover:from-green-600 hover:to-green-700 active:scale-95"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Main Categories */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`text-xs font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"
                }`}
            >
              Categories
            </h3>
            {selectedCategory && (
              <button
                onClick={() => handleCategoryClick(selectedCategory)}
                className="text-[11px] text-green-500 hover:text-green-600 font-medium flex items-center gap-1"
              >
                <i className="fas fa-times-circle text-[10px]"></i>
                Clear
              </button>
            )}
          </div>

          <div className="relative">
            <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 custom-scrollbar-horizontal">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`group relative flex flex-col items-center justify-center min-w-[70px] md:min-w-[85px] p-2 md:p-2.5 rounded-md text-center transition-all duration-200 transform hover:scale-105 flex-shrink-0 ${selectedCategory === category.id
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-500/40 scale-105"
                      : darkMode
                        ? "bg-gray-700/70 text-gray-300 hover:bg-gray-700 hover:shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                    }`}
                >
                  <div
                    className={`mb-1 transition-transform duration-200 ${selectedCategory === category.id
                        ? "scale-110"
                        : "group-hover:scale-110"
                      }`}
                  >
                    <i className={`${category.icon} text-sm md:text-base`}></i>
                  </div>
                  <span className="text-[10px] font-medium whitespace-nowrap leading-tight">
                    {category.label}
                  </span>

                  {selectedCategory === category.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <i className="fas fa-check text-green-500 text-[9px]"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {selectedCategory && subcategories[selectedCategory]?.length > 0 && (
          <div className="relative animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <h3
                className={`text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                Subcategories
              </h3>
              {currentSubcategory && (
                <button
                  onClick={() => {
                    dispatch(setCurrentSubcategory(null));
                    dispatch(filterProducts(selectedCategory));
                    // Re-focus barcode input
                    setTimeout(() => {
                      barcodeInputRef.current?.focus();
                    }, 100);
                  }}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                >
                  <i className="fas fa-times-circle"></i>
                  Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
              {subcategories[selectedCategory].map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory.id)}
                  className={`relative px-4 py-3 rounded-lg text-center transition-all duration-300 transform hover:scale-105 ${currentSubcategory === subcategory.id
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105"
                      : darkMode
                        ? "bg-gray-600/70 text-gray-300 hover:bg-gray-600 hover:shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md"
                    }`}
                >
                  <span className="text-xs font-medium">
                    {subcategory.label}
                  </span>
                  {currentSubcategory === subcategory.id && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
                      <i className="fas fa-check text-blue-500 text-xs"></i>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="flex-grow overflow-hidden">
        <div
          className={`h-full rounded-xl p-3 md:p-4 overflow-y-auto custom-scrollbar ${darkMode ? "bg-gray-900/30" : "bg-gray-50/50"
            }`}
        >
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
              >
                <i className="fas fa-box-open text-3xl text-gray-400"></i>
              </div>
              <p
                className={`text-lg font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
              >
                No products found
              </p>
              <p
                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
              >
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <p
                  className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "product" : "products"} found
                </p>
              </div>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    darkMode={darkMode}
                    onAddToCart={() => validateStockAndAddToCart(product)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Batch Selection Modal */}
      {showBatchModal && (
        <BatchSelectionModal
          product={selectedProduct}
          batches={selectedProductBatches}
          darkMode={darkMode}
          onClose={() => setShowBatchModal(false)}
          onBatchSelect={handleBatchSelect}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* 🌿 Ultra-Compact Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${darkMode ? "rgba(107,114,128,0.4)" : "rgba(156,163,175,0.4)"};
          border-radius: 10px;
          transition: background 0.2s ease, width 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? "rgba(107,114,128,0.7)" : "rgba(156,163,175,0.7)"};
        }

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${darkMode ? "rgba(107,114,128,0.4) transparent" : "rgba(156,163,175,0.4) transparent"};
        }
      `}</style>
    </div>
  );
};

export default ProductsSection;
//  import React, { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   clearCart,
//   applyDiscount,
//   addTab,
//   removeTab,
//   switchTab,
//   renameTab,
//   updateQuantityWithSync,
//   removeFromCartWithSync,
//   holdSale,
//   resumeSale,
//   getHeldSales,
// } from "../../actions/POS/cartActions";
// import { addInvoice } from "../../actions/POS/invoiceActions";
// import { openModal } from "../../actions/modalActions";
// import { toast } from "react-toastify";
// import {
//   FiCheckCircle,
//   FiX,
//   FiPackage,
//   FiTruck,
//   FiUserCheck,
//   FiUserX,
//   FiAlertTriangle,
//   FiPlay,
//   FiPause,
// } from "react-icons/fi";
// import useLedDisplay from "../../hooks/useLedDisplay";

// const formatCurrency = (value) => {
//   return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// };

// const CartSection = () => {
//   const dispatch = useDispatch();
//   const { tabs, activeTabId, loading, syncLoading, resumeLoading, holdLoading } =
//     useSelector((state) => state.cart);
//   const { darkMode } = useSelector((state) => state.ui);
//   const { isAuthenticated } = useSelector((state) => state.auth);
//   const [quantityInputValues, setQuantityInputValues] = useState({});
//   const [isRenaming, setIsRenaming] = useState(null);
//   const [renameValue, setRenameValue] = useState("");
//   const [swipeData, setSwipeData] = useState({});
//   const [touchStart, setTouchStart] = useState(0);
//   const [touchEnd, setTouchEnd] = useState(0);
//   const [activeInput, setActiveInput] = useState(null);
//   const renameInputRef = useRef(null);
//   const quantityInputRefs = useRef({});

//   const [heldSales, setHeldSales] = useState([]);
//   const [showHeldSalesModal, setShowHeldSalesModal] = useState(false);

//   const { clearDisplay } = useLedDisplay();

//   const [alertMessage, setAlertMessage] = useState("");
//   const [alertType, setAlertType] = useState("success");
//   const [showAlert, setShowAlert] = useState(false);

//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [confirmConfig, setConfirmConfig] = useState({
//     title: "",
//     message: "",
//     onConfirm: null,
//     onCancel: null,
//     confirmText: "OK",
//     cancelText: "Cancel",
//   });

//   const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
//   const { items, discount, discountType, isHeld = false, saleId } = activeTab;

//   const isPaymentDisabled = loading || items.length === 0 || isHeld;

//   const isFirstTab = tabs.length > 0 && activeTabId === tabs[0].id;

//   useEffect(() => {
//     loadHeldSales();

//   }, [tabs]);

//   const getProductDiscount = (item) => {
//     if (item.discountType === "Percentage") { 
//       const discount = (item.price * item.discountValue) / 100;
//       return Math.round(discount * 100) / 100;  
//     } else if (item.discountType === "Value") { 
//       return Math.round(item.discountValue * 100) / 100;
//     }
//     return 0;
//   };

//   const getDiscountedPrice = (item) => {
//     const discountAmount = getProductDiscount(item);
//     const discountedPrice = item.price - discountAmount;
//     return Math.round(discountedPrice * 100) / 100;  
//   };

//   const getItemTotal = (item) => {
//     const discountedPrice = getDiscountedPrice(item);
//     const total = discountedPrice * item.quantity;
//     return Math.round(total * 100) / 100; 
//   };

//   const getItemDiscountAmount = (item) => {
//     const discountAmount = getProductDiscount(item);
//     const totalDiscount = discountAmount * item.quantity;
//     return Math.round(totalDiscount * 100) / 100;
//   };

//   const getItemDiscountPercentage = (item) => {
//     if (item.discountType === "Percentage") {
//       return item.discountValue;
//     } else if (item.discountType === "Value" && item.price > 0) {
//       const percentage = (item.discountValue / item.price) * 100;
//       return Math.round(percentage * 10) / 10;  
//     }
//     return 0;
//   };


//   const subtotal = items.reduce((sum, item) => {
//     const itemTotal = getItemTotal(item);
//     const total = sum + itemTotal;
//     return Math.round(total * 100) / 100;
//   }, 0);

//   const totalProductDiscount = items.reduce((sum, item) => {
//     const itemDiscount = getItemDiscountAmount(item);
//     const total = sum + itemDiscount;
//     return Math.round(total * 100) / 100;
//   }, 0);

//   const totalDiscount =
//     Math.round((totalProductDiscount + discount) * 100) / 100;

//   const total = Math.round((subtotal - discount) * 100) / 100;

//   useEffect(() => {
//     window.alert = function (message) {
//       console.log("Browser alert blocked:", message);
//       return;
//     };
//   }, []);

//   const showConfirm = (config) => {
//     setConfirmConfig(config);
//     setShowConfirmModal(true);
//   };

//   const handleConfirm = () => {
//     setShowConfirmModal(false);
//     if (confirmConfig.onConfirm) {
//       confirmConfig.onConfirm();
//     }
//   };

//   const handleCancel = () => {
//     setShowConfirmModal(false);
//     if (confirmConfig.onCancel) {
//       confirmConfig.onCancel();
//     }
//   };

//   const showAlertMessage = (message, type = "success") => {
//     setAlertMessage(message);
//     setAlertType(type);
//     setShowAlert(true);

//     setTimeout(() => {
//       setShowAlert(false);
//     }, 5000);
//   };

//   // Clear LED display when cart becomes empty
//   useEffect(() => {
//     if (items.length === 0) {
//       clearDisplay();
//     }
//   }, [items.length, clearDisplay]);

//   const loadHeldSales = () => {
//     const sales = getHeldSales();
//     console.log('Loaded held sales:', sales); // Debug log
//     setHeldSales(sales);
//   };

//   const handleHoldSale = () => {
//     if (!isAuthenticated) {
//       dispatch(openModal("LOGIN"));
//       return;
//     }

//     if (items.length === 0) {
//       showAlertMessage("Cannot hold an empty cart", "error");
//       return;
//     }

//     showConfirm({
//       title: "Hold Sale",
//       message: "Hold this sale? You can resume it later.",
//       confirmText: "Hold",
//       onConfirm: () => {
//         dispatch(holdSale())
//           .then((result) => {
//             if (result && result.success) {
//               loadHeldSales();
//               showAlertMessage(
//                 "Sale held successfully! You can resume it later.",
//                 "success"
//               );
//             }
//           })
//           .catch((error) => {
//             showAlertMessage("Failed to hold sale. Please try again.", "error");
//           });
//       },
//     });
//   };

//   const performResumeSale = (saleId) => {
//     console.log('Performing resume sale for:', saleId); 
//     dispatch(resumeSale(saleId))
//       .then((result) => {
//         if (result && result.success) {
//           setShowHeldSalesModal(false);
//           loadHeldSales();
//           showAlertMessage("Sale resumed successfully!", "success");
//         }
//       })
//       .catch((error) => {
//         showAlertMessage("Failed to resume sale. Please try again.", "error");
//       });
//   };

//   const handleResumeSale = (saleId) => {
//     if (!isAuthenticated) {
//       dispatch(openModal("LOGIN"));
//       return;
//     }

//     if (items.length > 0 && !isHeld) {
//       showConfirm({
//         title: "Resume Sale",
//         message: "Current cart items will be replaced. Continue?",
//         confirmText: "Continue",
//         onConfirm: () => {
//           performResumeSale(saleId);
//         },
//       });
//     } else {
//       performResumeSale(saleId);
//     }
//   };

//   // FIXED: openResumeModal function - ensure it properly opens the modal
//   const openResumeModal = () => {
//     console.log('Opening resume modal...'); // Debug log
//     loadHeldSales();
//     setShowHeldSalesModal(true);
//     console.log('showHeldSalesModal set to:', true); // Debug log
//   };

//   const hasHeldSales = heldSales.length > 0;

//   // FIXED: Add direct resume function for current held sale
//   const handleResumeCurrentHeldSale = () => {
//     console.log('Resuming current held sale, saleId:', saleId); // Debug log
//     if (isHeld && saleId) {
//       handleResumeSale(saleId);
//     } else {
//       showAlertMessage("No held sale found to resume", "error");
//     }
//   };

//   // FIXED: handleAddTab function - only creates new tabs
//   const handleAddTab = () => {
//     if (tabs.length < 2) {
//       dispatch(addTab());
//       showAlertMessage("New tab created successfully!", "success");
//     } else {
//       showAlertMessage("Maximum number of tabs reached (5)", "warning");
//     }
//   };

//   const handleRemoveTab = (tabId) => {
//     if (tabs.length > 1) {
//       showConfirm({
//         title: "Remove Tab",
//         message: "Are you sure you want to remove this tab?",
//         confirmText: "Remove",
//         onConfirm: () => {
//           dispatch(removeTab(tabId));
//           localStorage.removeItem("saleId");
//           showAlertMessage("Tab removed successfully!", "success");
//         },
//       });
//     }
//   };

//   const handleSwitchTab = (tabId) => {
//     dispatch(switchTab(tabId));
//   };

//   const startRenaming = (tabId, currentName) => {
//     setIsRenaming(tabId);
//     setRenameValue(currentName);
//   };

//   const finishRenaming = () => {
//     if (isRenaming && renameValue.trim()) {
//       dispatch(renameTab(isRenaming, renameValue.trim()));
//       showAlertMessage("Tab renamed successfully!", "success");
//     }
//     setIsRenaming(null);
//     setRenameValue("");
//   };

//   const cancelRenaming = () => {
//     setIsRenaming(null);
//     setRenameValue("");
//   };

//   const handleRenameKeyPress = (e) => {
//     if (e.key === "Enter") {
//       finishRenaming();
//     } else if (e.key === "Escape") {
//       cancelRenaming();
//     }
//   };

//   useEffect(() => {
//     const initialValues = {};
//     items.forEach((item) => {
//       initialValues[item.id] = item.quantity.toString();
//     });
//     setQuantityInputValues(initialValues);
//   }, [items]);

//   const handleQuantityChange = (itemId, newQuantity) => {
//     const item = items.find((item) => item.id === itemId);
//     if (!item) return;

//     const quantity = Math.max(1, parseInt(newQuantity) || 1);

//     if (quantity > item.stock) {
//       showAlertMessage(
//         `Cannot set quantity to ${quantity}. Only ${item.stock} items available in stock for "${item.name}".`,
//         "error"
//       );

//       setQuantityInputValues((prev) => ({
//         ...prev,
//         [itemId]: item.quantity.toString(),
//       }));
//       return;
//     }

//     dispatch(updateQuantityWithSync(itemId, quantity));
//     setActiveInput(null);
//   };

//   const handleQuantityInput = (e, itemId) => {
//     const value = e.target.value.replace(/[^0-9]/g, "");
//     setQuantityInputValues((prev) => ({
//       ...prev,
//       [itemId]: value,
//     }));
//   };

//   const handleQuantityBlur = (itemId) => {
//     const currentValue = quantityInputValues[itemId];
//     const currentItem = items.find((item) => item.id === itemId);

//     if (!currentItem) return;

//     if (!currentValue || currentValue === "" || parseInt(currentValue) < 1) {
//       setQuantityInputValues((prev) => ({
//         ...prev,
//         [itemId]: currentItem.quantity.toString(),
//       }));
//     } else {
//       const newQuantity = parseInt(currentValue);
//       const currentQuantity = currentItem.quantity;

//       if (newQuantity > currentItem.stock) {
//         showAlertMessage(
//           `Cannot set quantity to ${newQuantity}. Only ${currentItem.stock} items available in stock for "${currentItem.name}".`,
//           "error"
//         );
//         setQuantityInputValues((prev) => ({
//           ...prev,
//           [itemId]: currentQuantity.toString(),
//         }));
//         return;
//       }

//       if (newQuantity !== currentQuantity) {
//         dispatch(updateQuantityWithSync(itemId, newQuantity));
//       }
//     }
//     setActiveInput(null);
//   };

//   const handleQuantityKeyPress = (e, itemId) => {
//     if (e.key === "Enter") {
//       e.target.blur();
//       setActiveInput(null);
//     } else if (e.key === "Escape") {
//       const originalQuantity =
//         items.find((item) => item.id === itemId)?.quantity || 1;
//       setQuantityInputValues((prev) => ({
//         ...prev,
//         [itemId]: originalQuantity.toString(),
//       }));
//       setActiveInput(null);
//     }
//   };

//   const incrementQuantity = (itemId, currentQuantity) => {
//     const item = items.find((item) => item.id === itemId);
//     if (!item) return;

//     if (currentQuantity >= item.stock) {
//       showAlertMessage(
//         `Cannot add more "${item.name}". Only ${item.stock} items available in stock.`,
//         "error"
//       );
//       return;
//     }

//     dispatch(updateQuantityWithSync(itemId, currentQuantity + 1));
//   };

//   const decrementQuantity = (itemId, currentQuantity) => {
//     if (currentQuantity > 1) {
//       dispatch(updateQuantityWithSync(itemId, currentQuantity - 1));
//     } else {
//       showConfirm({
//         title: "Remove Item",
//         message: "Remove this item from cart?",
//         confirmText: "Remove",
//         onConfirm: () => {
//           dispatch(removeFromCartWithSync(itemId));
//           showAlertMessage("Item removed from cart", "success");
//         },
//       });
//     }
//   };

//   const handleQuantityButtonTouch = (e, itemId, action) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const item = items.find((item) => item.id === itemId);
//     if (!item) return;

//     if (action === "increment") {
//       if (item.quantity >= item.stock) {
//         showAlertMessage(
//           `Cannot add more "${item.name}". Only ${item.stock} items available in stock.`,
//           "error"
//         );
//         return;
//       }
//       incrementQuantity(itemId, item.quantity);
//     } else if (action === "decrement") {
//       decrementQuantity(itemId, item.quantity);
//     }

//     const button = e.currentTarget;
//     button.classList.add("opacity-70");
//     setTimeout(() => {
//       button.classList.remove("opacity-70");
//     }, 150);
//   };

//   const handleInputActivation = (e, itemId) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setActiveInput(itemId);
//   };

//   const handleTouchStart = (e, itemId) => {
//     setTouchStart(e.targetTouches[0].clientX);
//     setSwipeData({
//       ...swipeData,
//       [itemId]: {
//         startX: e.targetTouches[0].clientX,
//         currentX: e.targetTouches[0].clientX,
//         isSwiping: false,
//       },
//     });
//   };

//   const handleTouchMove = (e, itemId) => {
//     if (!swipeData[itemId]) return;

//     const touchX = e.targetTouches[0].clientX;
//     const deltaX = touchX - swipeData[itemId].startX;

//     if (Math.abs(deltaX) > 10) {
//       setSwipeData({
//         ...swipeData,
//         [itemId]: {
//           ...swipeData[itemId],
//           currentX: touchX,
//           isSwiping: true,
//         },
//       });
//     }
//   };

//   const handleTouchEnd = (e, itemId) => {
//     setTouchEnd(e.changedTouches[0].clientX);

//     if (!swipeData[itemId]) return;

//     const deltaX = swipeData[itemId].currentX - swipeData[itemId].startX;

//     if (deltaX < -60 || touchStart - touchEnd > 100) {
//       showConfirm({
//         title: "Remove Item",
//         message: "Remove this item from cart?",
//         confirmText: "Remove",
//         onConfirm: () => {
//           dispatch(removeFromCartWithSync(itemId));
//           showAlertMessage("Item removed from cart", "success");
//         },
//         onCancel: () => {
//           setSwipeData({
//             ...swipeData,
//             [itemId]: null,
//           });
//         },
//       });
//     } else {
//       setSwipeData({
//         ...swipeData,
//         [itemId]: null,
//       });
//     }
//   };

//   const getSwipeTranslation = (itemId) => {
//     if (!swipeData[itemId] || !swipeData[itemId].isSwiping) return 0;

//     const deltaX = swipeData[itemId].currentX - swipeData[itemId].startX;

//     if (deltaX > 0) return 0;
//     if (deltaX < -80) return -80;
//     return deltaX * 0.7;
//   };

//   const getSwipeOpacity = (itemId) => {
//     if (!swipeData[itemId] || !swipeData[itemId].isSwiping) return 1;

//     const deltaX = Math.abs(
//       swipeData[itemId].currentX - swipeData[itemId].startX
//     );
//     return Math.max(0.7, 1 - deltaX / 200);
//   };

//   // Handle clear cart with LED clearing
//   const handleClearCart = () => {
//     dispatch(clearCart());
//     clearDisplay(); // Clear LED display
//     showAlertMessage("Cart cleared successfully!", "success");
//   };

//   const getAlertBgColor = () => {
//     switch (alertType) {
//       case "success":
//         return "bg-green-100 border-green-300 dark:bg-green-900/70 dark:border-green-700";
//       case "error":
//         return "bg-red-100 border-red-300 dark:bg-red-900/70 dark:border-red-700";
//       case "warning":
//         return "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/70 dark:border-yellow-700";
//       case "info":
//         return "bg-blue-100 border-blue-300 dark:bg-blue-900/70 dark:border-blue-700";
//       default:
//         return "bg-gray-100 border-gray-300 dark:bg-gray-900/70 dark:border-gray-700";
//     }
//   };

//   const getAlertTextColor = () => {
//     switch (alertType) {
//       case "success":
//         return "text-green-800 dark:text-green-200";
//       case "error":
//         return "text-red-800 dark:text-red-200";
//       case "warning":
//         return "text-yellow-800 dark:text-yellow-200";
//       case "info":
//         return "text-blue-800 dark:text-blue-200";
//       default:
//         return "text-gray-800 dark:text-gray-200";
//     }
//   };

//   const getAlertIcon = () => {
//     switch (alertType) {
//       case "success":
//         return (
//           <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
//         );
//       case "error":
//         return <FiX className="w-5 h-5 text-red-600 dark:text-red-400" />;
//       case "warning":
//         return (
//           <FiPackage className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
//         );
//       case "info":
//         return <FiTruck className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
//       default:
//         return <FiTruck className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
//     }
//   };


//   useEffect(() => {
//     if (isRenaming && renameInputRef.current) {
//       renameInputRef.current.focus();
//       renameInputRef.current.select();
//     }
//   }, [isRenaming]);

//   useEffect(() => {
//     if (activeInput && quantityInputRefs.current[activeInput]) {
//       const input = quantityInputRefs.current[activeInput];
//       input.focus();
//       input.select();
//     }
//   }, [activeInput]);

//   const handleApplyDiscount = () => {
//     dispatch(openModal("DISCOUNT"));
//   };

//   const handleProductDiscount = (itemId) => {
//     dispatch(openModal("PRODUCT_DISCOUNT", { itemId }));
//   };

//   const handlePayment = () => {
//     if (!isAuthenticated) {
//       dispatch(openModal("LOGIN"));
//       return;
//     }

//     if (items.length === 0) {
//       showAlertMessage("Cannot process payment with empty cart", "error");
//       return;
//     }

//     if (isHeld) {
//       showAlertMessage(
//         "Cannot process payment on a held sale. Please resume the sale first.",
//         "error"
//       );
//       return;
//     }

//     dispatch(
//       openModal("PAYMENT", {
//         items,
//         subtotal,
//         discount: discount, 
//         totalProductDiscount, 
//         totalProductDiscount,
//         total,
//         onPaymentComplete: () => { 
//           clearDisplay();
//         }
//       })
//     );
//   };

//   if (items.length === 0 && tabs.length === 1 && !isHeld) {
//     return (
//       <div
//         className={`flex flex-col p-3 rounded-xl h-full ${
//           darkMode ? "bg-gray-800" : "bg-white"
//         } justify-center items-center relative`}
//       >
//         <div className="text-center py-6 text-gray-500 dark:text-gray-400">
//           <i className="fas fa-shopping-cart text-3xl mb-2 opacity-50"></i>
//           <p className="text-md font-medium">Your cart is empty</p>
//           <p className="text-xs mt-1">Add products to see them here</p>

//           <div className="flex gap-2 mt-3 justify-center">
//             {hasHeldSales && (
//             <button
//               onClick={handleAddTab}
//               // className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-sm hover:shadow transition-all"
//               className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-sm hover:shadow transition-all"
//             >
//               {/* <i className="fas fa-plus mr-1"></i> New Tab */}
//               <i className="fas fa-play mr-1"></i> Resume Sale
//             </button>
//             )}
//             {/* {hasHeldSales && (
//               <button
//                 onClick={openResumeModal}
//                 className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-sm hover:shadow transition-all"
//               >
//                 <i className="fas fa-play mr-1"></i> Resume Sale
//               </button>
//             )} */}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className={`flex flex-col p-2 rounded-xl h-full ${
//         darkMode ? "bg-gray-800" : "bg-white"
//       } transition-all duration-300 relative`}
//     >
//       {/* Alert Popup */}
//       {showAlert && (
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-fade-in-down w-full max-w-md px-2 sm:px-0">
//           <div
//             className={`flex items-center justify-between p-3 sm:p-4 rounded-xl shadow-lg border ${getAlertBgColor()} ${getAlertTextColor()} mx-2`}
//           >
//             <div className="flex items-center gap-2 sm:gap-3">
//               {getAlertIcon()}
//               <p className="font-medium text-sm sm:text-base">{alertMessage}</p>
//             </div>
//             <button
//               onClick={() => setShowAlert(false)}
//               className="hover:opacity-70 transition-opacity"
//             >
//               <FiX className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Custom Confirmation Modal */}
//       {showConfirmModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999] p-2">
//           <div
//             className={`rounded-xl shadow-xl w-full max-w-md ${
//               darkMode ? "bg-gray-800" : "bg-white"
//             }`}
//           >
//             <div className="p-4">
//               <div className="text-center">
//                 <div
//                   className={`mx-auto flex items-center justify-center h-10 w-10 rounded-full ${
//                     darkMode ? "bg-yellow-900/30" : "bg-yellow-100"
//                   }`}
//                 >
//                   <FiAlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
//                 </div>
//                 <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
//                   {confirmConfig.title}
//                 </h3>
//                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                   {confirmConfig.message}
//                 </p>
//               </div>
//               <div className="mt-4 flex justify-center gap-2">
//                 <button
//                   onClick={handleCancel}
//                   className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
//                     darkMode
//                       ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   {confirmConfig.cancelText || "Cancel"}
//                 </button>
//                 <button
//                   onClick={handleConfirm}
//                   className="px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
//                 >
//                   {confirmConfig.confirmText || "OK"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Loading Overlay */}
//       {(loading || syncLoading || holdLoading || resumeLoading) && (
//         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl z-10">
//           <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
//             <i className="fas fa-spinner fa-spin text-green-500 text-xl mr-2"></i>
//             <span className="text-gray-700 dark:text-gray-300">
//               {resumeLoading
//                 ? "Resuming sale..."
//                 : holdLoading
//                 ? "Holding sale..."
//                 : syncLoading
//                 ? "Syncing with server..."
//                 : "Updating cart..."}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Modern Tab Navigation - Compact */}
//       <div className="mb-0">
//         <div className="flex items-center gap-1 mb-1 overflow-x-auto pb-1 hide-scrollbar">
//           {tabs.map((tab, index) => (
//             <div
//               key={tab.id}
//               className={`flex items-center rounded-md px-8 py-1 cursor-pointer transition-all flex-shrink-0 text-xs ${
//                 tab.id === activeTabId
//                   ? darkMode
//                     ? "bg-gray-700 text-white"
//                     : "bg-blue-100 text-blue-800"
//                   : darkMode
//                   ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
//                   : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//               } ${tab.isHeld ? "border border-yellow-400" : ""}`}
//               onClick={() => handleSwitchTab(tab.id)}
//             >
//               <span className="truncate max-w-20">
//                 {tab.name || `Current Sale ${index + 1}`}
//                 {tab.isHeld && <span className="text-yellow-500 ml-1">●</span>}
//               </span>

//               {tabs.length > 1 && (
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleRemoveTab(tab.id);
//                   }}
//                   className="ml-0.5 hover:text-red-500 opacity-70 hover:opacity-100 transition-opacity"
//                 >
//                   <i className="fas fa-times text-xs"></i>
//                 </button>
//               )}
//             </div>
//           ))}

//           {(hasHeldSales || tabs.length > 1) && tabs.length < 5 && (
//   <button
//     onClick={handleAddTab}
//     className={`px-1.5 py-1 rounded-md text-xs ${
//       darkMode
//         ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
//         : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//     }`}
//     title="New Tab"
//   >
//     <i className="fas fa-plus"></i>
//   </button>
// )}
//         </div>
//       </div>

//       {/* Header Section - Compact */}
//       <div className="flex justify-between items-center mb-2 pb-1 border-b dark:border-gray-700">
//         <h2 className="text-md font-bold text-green-600 dark:text-green-400">
//           Cart {isHeld && <span className="text-yellow-500 text-xs">(Held)</span>}
//         </h2>
//         <div className="flex gap-1">
//           {/* Hold/Resume buttons */}
//           {isFirstTab && (
//             <>
//               {/* Show Resume button if current tab is held OR there are held sales */}
//               {(isHeld || hasHeldSales) ? (
//                 <div className="flex gap-1">
//                   {/* Resume current sale button if current tab is held */}
//                   {isHeld && saleId && (
//                     <button
//                       onClick={handleResumeCurrentHeldSale}
//                       disabled={resumeLoading}
//                       className="w-6 h-6 rounded bg-green-500 text-white flex items-center justify-center transition-all hover:bg-green-600 text-xs disabled:opacity-50"
//                       title="Resume Current Sale"
//                     >
//                       <FiPlay className="w-3 h-3" />
//                     </button>
//                   )}

//                   {/* Resume modal button for other held sales */}
//                   {hasHeldSales && (
//                     <button
//                       onClick={openResumeModal}
//                       disabled={resumeLoading}
//                       className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center transition-all hover:bg-blue-600 text-xs disabled:opacity-50"
//                       title="Resume Held Sale"
//                     >
//                       <i className="fas fa-list"></i>
//                     </button>
//                   )}
//                 </div>
//               ) : (
//                 /* Hold button when no held sales and cart has items */
//                 <button
//                   onClick={handleHoldSale}
//                   disabled={holdLoading || items.length === 0}
//                   className={`w-6 h-6 rounded flex items-center justify-center transition-all text-xs ${
//                     items.length === 0
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-yellow-500 hover:bg-yellow-600 text-white"
//                   } disabled:opacity-50 disabled:cursor-not-allowed`}
//                   title={items.length === 0 ? "Cart is empty" : "Hold Sale"}
//                 >
//                   <FiPause className="w-3 h-3" />
//                 </button>
//               )}
//             </>
//           )}

//           <button
//             onClick={() => {
//               if (items.length > 0) {
//                 showConfirm({
//                   title: "Clear Cart",
//                   message: "Clear all items from cart?",
//                   confirmText: "Clear",
//                   onConfirm: handleClearCart,
//                 });
//               }
//             }}
//             disabled={items.length === 0}
//             className={`w-6 h-6 rounded flex items-center justify-center transition-all text-xs ${
//               items.length === 0
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-red-500 hover:bg-red-600 text-white"
//             } disabled:opacity-50`}
//             title={items.length === 0 ? "Cart is empty" : "Clear Cart"}
//           >
//             <i className="fas fa-trash text-xs"></i>
//           </button>
//         </div>
//       </div>

//       {/* FIXED: Held Sales Modal - Now properly shows when showHeldSalesModal is true */}
//       {showHeldSalesModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
//           <div
//             className={`p-4 rounded-lg max-w-md w-full mx-4 max-h-80 overflow-hidden flex flex-col ${
//               darkMode ? "bg-gray-800" : "bg-white"
//             }`}
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-bold">Resume Held Sale</h3>
//               <button
//                 onClick={() => setShowHeldSalesModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <i className="fas fa-times"></i>
//               </button>
//             </div>

//             {heldSales.length === 0 ? (
//               <p className="text-center py-4 text-gray-500">
//                 No held sales found
//               </p>
//             ) : (
//               <div className="space-y-2 flex-grow overflow-y-auto">
//                 {heldSales.map((sale) => (
//                   <div
//                     key={sale.saleId}
//                     className={`p-3 rounded border ${
//                       darkMode
//                         ? "border-gray-600 bg-gray-700"
//                         : "border-gray-300 bg-gray-50"
//                     }`}
//                   >
//                     <div className="flex justify-between items-start mb-2">
//                       <div className="flex-grow">
//                         <p className="font-semibold">{sale.tabName}</p>
//                         <p className="text-sm text-gray-500">
//                           Sale ID: {sale.saleId}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           {sale.items.length} items • Held on{" "}
//                           {new Date(sale.heldAt).toLocaleDateString()}
//                         </p>
//                       </div>
//                       <button
//                         onClick={() => handleResumeSale(sale.saleId)}
//                         disabled={resumeLoading}
//                         className={`px-3 py-1 text-white rounded text-sm transition-colors ml-2 ${
//                           resumeLoading 
//                             ? "bg-gray-400 cursor-not-allowed" 
//                             : "bg-green-500 hover:bg-green-600"
//                         }`}
//                       >
//                         {resumeLoading ? "Loading..." : "Resume"}
//                       </button>
//                     </div>
//                     <div className="text-xs text-gray-500 truncate">
//                       Items: {sale.items.map((item) => item.name).join(", ")}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Loading overlay for resume */}
//             {resumeLoading && (
//               <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
//                 <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
//                   <i className="fas fa-spinner fa-spin text-green-500 text-xl mr-2"></i>
//                   <span className="text-gray-700 dark:text-gray-300">
//                     Resuming sale...
//                   </span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Cart Items Section - Compact */}
//       <div className="flex-grow overflow-y-auto mb-2">
//         {isHeld && items.length === 0 ? (
//           <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//             <FiPackage className="w-12 h-12 mx-auto mb-2 opacity-50" />
//             <p className="text-sm font-medium">Sale is on hold</p>
//             <p className="text-xs mt-1">Resume to continue this sale</p>
//             <button
//               onClick={handleResumeCurrentHeldSale}
//               disabled={resumeLoading}
//               className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-sm hover:shadow transition-all disabled:opacity-50"
//             >
//               {resumeLoading ? (
//                 <>
//                   <i className="fas fa-spinner fa-spin mr-2"></i>
//                   Resuming...
//                 </>
//               ) : (
//                 <>
//                   <FiPlay className="w-4 h-4 inline mr-2" />
//                   Resume Sale
//                 </>
//               )}
//             </button>

//             {/* Also show the resume modal button in the held state */}
//             {hasHeldSales && (
//               <button
//                 onClick={openResumeModal}
//                 className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-sm hover:shadow transition-all"
//               >
//                 <i className="fas fa-list mr-2"></i>
//                 View All Held Sales
//               </button>
//             )}
//           </div>
//         ) : items.length === 0 ? (
//           <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//             <i className="fas fa-shopping-cart text-3xl mb-2 opacity-50"></i>
//             <p className="text-sm font-medium">Your cart is empty</p>
//             <p className="text-xs mt-1">Add products to see them here</p>

//             {/* Show resume options in empty cart if there are held sales */}
//             {hasHeldSales && (
//               <div className="mt-3">
//                 <button
//                   onClick={openResumeModal}
//                   className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-sm hover:shadow transition-all"
//                 >
//                   <i className="fas fa-play mr-2"></i>
//                   Resume Held Sale
//                 </button>
//               </div>
//             )}
//           </div>
//         ) : (
//           <div className="space-y-1.5">
//             {[...items].reverse().map((item) => {
//               const swipeTranslation = getSwipeTranslation(item.id);
//               const discountAmount = getProductDiscount(item);
//               const discountedPrice = getDiscountedPrice(item);
//               const itemTotal = getItemTotal(item);
//               const itemDiscountTotal = getItemDiscountAmount(item);
//               const discountPercentage = getItemDiscountPercentage(item);
//               const hasDiscount = discountAmount > 0;

//               return (
//                 <div
//                   key={item.id}
//                   className="relative overflow-hidden"
//                   onTouchStart={(e) => handleTouchStart(e, item.id)}
//                   onTouchMove={(e) => handleTouchMove(e, item.id)}
//                   onTouchEnd={(e) => handleTouchEnd(e, item.id)}
//                 >
//                   {/* Swipe to delete background */}
//                   <div
//                     className="absolute inset-y-0 right-0 w-16 bg-red-500 flex items-center justify-center text-white"
//                     style={{
//                       transform: `translateX(${swipeTranslation + 64}px)`,
//                     }}
//                   >
//                     <i className="fas fa-trash text-sm"></i>
//                   </div>

//                   {/* Cart Item - Compact */}
//                   <div
//                     className={`p-1.5 rounded-md relative transition-transform duration-200 ${
//                       darkMode ? "bg-gray-700/30" : "bg-gray-100"
//                     }`}
//                     style={{ transform: `translateX(${swipeTranslation}px)` }}
//                   >
//                     {/* Product Name at Top */}
//                     <div className="flex justify-between items-start mb-1">
//                       <p className="text-sm font-medium dark:text-white truncate max-w-[70%]">
//                         {item.name}
//                       </p>
//                       <p className="text-sm font-medium dark:text-white">
//                         Rs. {formatCurrency(itemTotal)}
//                       </p>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center">
//                         <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
//                           {item.image ? (
//                             <img
//                               src={item.image}
//                               alt={item.name}
//                               className="w-8 h-8 object-cover"
//                             />
//                           ) : (
//                             <i className="fas fa-box text-gray-500 dark:text-gray-400 text-xs"></i>
//                           )}
//                         </div>

//                         <div className="ml-2">
//                           {/* Original Price with strikethrough - only show if there's a discount */}
//                           <div className="flex items-center gap-1">
//                             {hasDiscount && (
//                               <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
//                                 Rs. {formatCurrency(item.price)}
//                               </span>
//                             )}
//                             <span className="text-xs font-medium text-green-600 dark:text-green-400">
//                               Rs. {formatCurrency(discountedPrice)}
//                             </span>
//                           </div>

//                           {/* Discount Amount Display - only show if there's a discount */}
//                           {hasDiscount && (
//                             <div className="flex items-center gap-1 mt-0.5">
//                               <span className="text-xs text-red-500 dark:text-red-400 font-medium">
//                                 -Rs. {formatCurrency(discountAmount)}
//                                 {discountPercentage > 0 &&
//                                   ` (${discountPercentage}%)`}
//                               </span>
//                             </div>
//                           )}

//                           {/* Stock Information */}
//                           <div className="flex items-center gap-1 mt-0.5">
//                             <span
//                               className={`text-xs font-medium ${
//                                 item.stock < 5
//                                   ? "text-yellow-500 dark:text-yellow-400"
//                                   : "text-blue-500 dark:text-blue-400"
//                               }`}
//                             >
//                               Stock: {item.stock}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex items-center">
//                         <button
//                           onClick={() =>
//                             decrementQuantity(item.id, item.quantity)
//                           }
//                           className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target"
//                           disabled={loading || isHeld}
//                         >
//                           <i className="fas fa-minus"></i>
//                         </button>

//                         {activeInput === item.id ? (
//                           <input
//                             ref={(el) =>
//                               (quantityInputRefs.current[item.id] = el)
//                             }
//                             type="tel"
//                             inputMode="numeric"
//                             pattern="[0-9]*"
//                             value={quantityInputValues[item.id] || item.quantity}
//                             onChange={(e) => handleQuantityInput(e, item.id)}
//                             onBlur={() => handleQuantityBlur(item.id)}
//                             onKeyDown={(e) => handleQuantityKeyPress(e, item.id)}
//                             className="w-10 py-0.5 text-center text-xs border rounded mx-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-target"
//                             disabled={loading || isHeld}
//                           />
//                         ) : (
//                           <div
//                             onTouchStart={(e) =>
//                               handleInputActivation(e, item.id)
//                             }
//                             onClick={() => !isHeld && setActiveInput(item.id)}
//                             className="w-8 py-0.5 text-center text-xs border rounded mx-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-target flex items-center justify-center"
//                             style={{ minHeight: "24px" }}
//                           >
//                             {item.quantity}
//                           </div>
//                         )}

//                         <button
//                           onClick={() =>
//                             incrementQuantity(item.id, item.quantity)
//                           }
//                           className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target"
//                           disabled={loading || item.quantity >= item.stock || isHeld}
//                         >
//                           <i className="fas fa-plus"></i>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Summary Section - Compact */}
//       <div
//         className={`p-2 rounded-md mb-2 text-xs ${
//           darkMode ? "bg-gray-700/30" : "bg-gray-100"
//         }`}
//       >
//         {/* Summary Rows */}
//         <div className="space-y-1">
//           <div className="flex justify-between items-center">
//             <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
//               Subtotal (After Discounts):
//             </span>
//             <span className="font-semibold">
//               Rs. {formatCurrency(subtotal)}
//             </span>
//           </div>

//           {/* Product Discounts Summary */}
//           {totalProductDiscount > 0 && (
//             <div className="flex justify-between items-center">
//               <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
//                 Product Discounts:
//               </span>
//               <span className="font-semibold text-red-500">
//                 Rs. ({formatCurrency(totalProductDiscount)})
//               </span>
//             </div>
//           )}

//           {discount > 0 && (
//             <div className="flex justify-between items-center">
//               <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
//                 Additional Cart Discount:
//               </span>
//               <span className="font-semibold text-red-500">
//                 -Rs. {formatCurrency(discount)}
//               </span>
//             </div>
//           )}
//         </div>

//         {/* Total Row */}
//         <div className="flex justify-between items-center mt-2 pt-1 border-t dark:border-gray-700">
//           <span className="font-bold text-green-600 dark:text-green-400">
//             Total:
//           </span>
//           <span className="font-bold text-green-600 dark:text-green-400">
//             Rs. {formatCurrency(total)}
//           </span>
//         </div>

//         {/* Action Buttons - Compact */}
//         <div className="grid grid-cols-2 gap-2 mt-2">
//           <button
//             onClick={handlePayment}
//             disabled={isPaymentDisabled}
//             className={`col-span-1 py-1.5 text-white font-semibold rounded text-xs transition-all flex items-center justify-center gap-1 touch-target ${
//               isPaymentDisabled
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-gradient-to-r from-green-500 to-green-600 hover:shadow"
//             }`}
//           >
//             <i className="fas fa-credit-card"></i>
//             <span>{isHeld ? "Sale Held - Resume First" : "Payment"}</span>
//           </button>
//            <button
//             onClick={handleApplyDiscount}
//             disabled={isHeld || items.length === 0}
//             className={`py-1.5 font-semibold rounded text-xs transition-all flex items-center justify-center gap-1 ${
//               isHeld || items.length === 0
//                 ? "bg-gray-400 text-gray-200 cursor-not-allowed"
//                 : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow"
//             }`}
//           >
//             <i className="fas fa-percent"></i>
//             <span>Discount</span>
//           </button>
//         </div>
//       </div>

//       {/* Tab Stats - Compact */}
//       <div
//         className={`text-xs text-center pt-1 border-t dark:border-gray-700 ${
//           darkMode ? "text-gray-400" : "text-gray-500"
//         }`}
//       >
//         {items.length} item{items.length !== 1 ? "s" : ""} • Tab{" "}
//         {tabs.findIndex((t) => t.id === activeTabId) + 1} of {tabs.length}
//         {activeTab.saleId && ` • Sale ID: ${activeTab.saleId}`}
//         {isHeld && ` • Status: Held`}
//       </div>

//       {/* Custom CSS for touch optimization */}
//       <style jsx>{`
//         .hide-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//         .hide-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .touch-target {
//           min-height: 28px;
//           min-width: 28px;
//           touch-action: manipulation;
//         }
//         input.touch-target {
//           font-size: 16px; /* Prevents zoom on iOS */
//         }
//         @keyframes fade-in-down {
//           0% {
//             opacity: 0;
//             transform: translate3d(-50%, -20px, 0);
//           }
//           100% {
//             opacity: 1;
//             transform: translate3d(-50%, 0, 0);
//           }
//         }
//         .animate-fade-in-down {
//           animation: fade-in-down 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CartSection;











import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  clearCart,
  applyDiscount,
  addTab,
  removeTab,
  switchTab,
  renameTab,
  updateQuantityWithSync,
  removeFromCartWithSync,
  holdSale,
  resumeSale,
  getHeldSales,
  fetchHeldSales,
  addToCartWithSync,
} from "../../actions/POS/cartActions";
import { fetchProducts, searchProducts } from "../../actions/POS/productAction";
import { openModal } from "../../actions/modalActions";
import {
  FiCheckCircle,
  FiX,
  FiPackage,
  FiTruck,
  FiAlertTriangle,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import useLedDisplay from "../../hooks/useLedDisplay";
import BatchSelectionModal from "../modals/BatchSelectionModal";

const formatCurrency = (value) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const CartSection = ({ cartFocusMode = false, initialTab = "NEW_CART", onTabChange }) => {
  const dispatch = useDispatch();
  const { tabs, activeTabId, loading, syncLoading, resumeLoading, holdLoading } =
    useSelector((state) => state.cart);
  const { darkMode } = useSelector((state) => state.ui);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [quantityInputValues, setQuantityInputValues] = useState({});
  const [isRenaming, setIsRenaming] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [swipeData, setSwipeData] = useState({});
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [activeInput, setActiveInput] = useState(null);
  const renameInputRef = useRef(null);
  const quantityInputRefs = useRef({});

  const [mainTab, setMainTabState] = useState(initialTab);
  const setMainTab = (tab) => {
    setMainTabState(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [heldSales, setHeldSales] = useState([]);

  const { clearDisplay } = useLedDisplay();

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "OK",
    cancelText: "Cancel",
  });

  // Cart Focus Mode: scan/search state
  const {
    allProducts,
    searchQuery,
  } = useSelector((state) => state.products);
  const [cfBarcodeInput, setCfBarcodeInput] = useState("");
  const [cfSearchFocused, setCfSearchFocused] = useState(false);
  const [cfShowBatchModal, setCfShowBatchModal] = useState(false);
  const [cfSelectedProductBatches, setCfSelectedProductBatches] = useState([]);
  const [cfSelectedProduct, setCfSelectedProduct] = useState(null);
  const cfBarcodeRef = useRef(null);

  // Pre-load products when in cart focus mode
  useEffect(() => {
    if (cartFocusMode) {
      dispatch(fetchProducts());
      setTimeout(() => { cfBarcodeRef.current?.focus(); }, 200);
    }
  }, [cartFocusMode, dispatch]);

  // Keep barcode input focused in cart focus mode
  useEffect(() => {
    if (!cartFocusMode) return;
    const handleFocusLoss = () => {
      if (
        cfBarcodeRef.current &&
        document.activeElement !== cfBarcodeRef.current &&
        document.activeElement.tagName !== 'INPUT' &&
        !cfSearchFocused
      ) {
        setTimeout(() => { cfBarcodeRef.current?.focus(); }, 100);
      }
    };
    document.addEventListener('click', handleFocusLoss);
    document.addEventListener('keydown', handleFocusLoss);
    return () => {
      document.removeEventListener('click', handleFocusLoss);
      document.removeEventListener('keydown', handleFocusLoss);
    };
  }, [cartFocusMode, cfSearchFocused]);

  const handleCfBarcodeScan = (e) => {
    if (e.key === "Enter" && cfBarcodeInput.trim()) {
      const product = allProducts.find((p) => p.barcode === cfBarcodeInput.trim());
      if (product) {
        if (product.hasMultipleBatches && product.allBatches && product.allBatches.length > 1) {
          setCfSelectedProductBatches(product.allBatches);
          setCfSelectedProduct(product);
          setCfShowBatchModal(true);
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
      setCfBarcodeInput("");
      setTimeout(() => { cfBarcodeRef.current?.focus(); }, 50);
    }
  };

  const handleCfSearch = () => {
    dispatch(searchProducts(searchQuery));
    setTimeout(() => { cfBarcodeRef.current?.focus(); }, 100);
  };

  const handleCfBatchSelect = (selectedBatch) => {
    if (selectedBatch.stock <= 0) {
      alert(`"${selectedBatch.name}" is out of stock!`);
      return;
    }
    dispatch(addToCartWithSync(selectedBatch));
    setCfShowBatchModal(false);
  };

  const handleCfProductFromSearch = (product) => {
    if (product.hasMultipleBatches && product.allBatches && product.allBatches.length > 1) {
      setCfSelectedProductBatches(product.allBatches);
      setCfSelectedProduct(product);
      setCfShowBatchModal(true);
      return;
    }
    const productToAdd = {
      ...product,
      batchId: product.batchId || product.allBatches?.[0]?.batchId || '0'
    };
    if (productToAdd.stock > 0) {
      dispatch(addToCartWithSync(productToAdd));
    } else {
      alert("Product is out of stock");
    }
    dispatch(searchProducts(""));
    setTimeout(() => { cfBarcodeRef.current?.focus(); }, 100);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || tabs[0];
  const { items, discount, discountType, isHeld = false, saleId } = activeTab;

  const isPaymentDisabled = loading || items.length === 0 || isHeld;

  const isFirstTab = tabs.length > 0 && activeTabId === tabs[0].id;

  useEffect(() => {
    loadHeldSales();
  }, [tabs]);

  // useEffect(() => {
  //   console.log('CartSection State:', {
  //     items,
  //     tabs,
  //     activeTabId,
  //     isHeld,
  //     saleId,
  //     heldSales,
  //     showHeldSalesModal
  //   });
  // }, [items, tabs, activeTabId, isHeld, saleId, heldSales, showHeldSalesModal]);

  const getProductDiscount = (item) => {
    if (item.discountType === "Percentage") {
      const discount = (item.price * item.discountValue) / 100;
      return Math.round(discount * 100) / 100;
    } else if (item.discountType === "Value") {
      return Math.round(item.discountValue * 100) / 100;
    }
    return 0;
  };

  const getDiscountedPrice = (item) => {
    const discountAmount = getProductDiscount(item);
    const discountedPrice = item.price - discountAmount;
    return Math.round(discountedPrice * 100) / 100;
  };

  const getItemTotal = (item) => {
    const discountedPrice = getDiscountedPrice(item);
    const total = discountedPrice * item.quantity;
    return Math.round(total * 100) / 100;
  };

  const getItemDiscountAmount = (item) => {
    const discountAmount = getProductDiscount(item);
    const totalDiscount = discountAmount * item.quantity;
    return Math.round(totalDiscount * 100) / 100;
  };

  const getItemDiscountPercentage = (item) => {
    if (item.discountType === "Percentage") {
      return item.discountValue;
    } else if (item.discountType === "Value" && item.price > 0) {
      const percentage = (item.discountValue / item.price) * 100;
      return Math.round(percentage * 10) / 10;
    }
    return 0;
  };


  const subtotal = items.reduce((sum, item) => {
    const itemTotal = getItemTotal(item);
    const total = sum + itemTotal;
    return Math.round(total * 100) / 100;
  }, 0);

  const totalProductDiscount = items.reduce((sum, item) => {
    const itemDiscount = getItemDiscountAmount(item);
    const total = sum + itemDiscount;
    return Math.round(total * 100) / 100;
  }, 0);

  const totalDiscount =
    Math.round((totalProductDiscount + discount) * 100) / 100;

  const total = Math.round((subtotal - discount) * 100) / 100;

  useEffect(() => {
    window.alert = function (message) {

      return;
    };
  }, []);

  const showConfirm = (config) => {
    setConfirmConfig(config);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    if (confirmConfig.onConfirm) {
      confirmConfig.onConfirm();
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    if (confirmConfig.onCancel) {
      confirmConfig.onCancel();
    }
  };

  const showAlertMessage = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  // Clear LED display when cart becomes empty
  useEffect(() => {
    if (items.length === 0) {
      clearDisplay();
    }
  }, [items.length, clearDisplay]);

  const loadHeldSales = async () => {
    // First show immediate feedback from local storage
    const localSales = getHeldSales();
    setHeldSales(localSales);
    
    // Then fetch actual state from API
    try {
      const apiSales = await dispatch(fetchHeldSales());
      if (apiSales && Array.isArray(apiSales)) {
        setHeldSales(apiSales);
      }
    } catch (error) {
      console.error("Failed to load held sales from API", error);
    }
  };

  const handleHoldSale = () => {
    if (!isAuthenticated) {
      dispatch(openModal("LOGIN"));
      return;
    }

    if (items.length === 0) {
      showAlertMessage("Cannot hold an empty cart", "error");
      return;
    }

    showConfirm({
      title: "Hold Sale",
      message: "Hold this sale? You can resume it later.",
      confirmText: "Hold",
      onConfirm: () => {
        dispatch(holdSale())
          .then((result) => {
            if (result && result.success) {
              loadHeldSales();
              showAlertMessage(
                "Sale held successfully! You can resume it later.",
                "success"
              );
            }
          })
          .catch((error) => {

            showAlertMessage(error.message || "Failed to hold sale. Please try again.", "error");
          });
      },
    });
  };

  // FIXED: performResumeSale function
  const performResumeSale = (saleId) => {


    dispatch(resumeSale(saleId))
      .then((result) => {

        if (result && result.success) {
          setMainTab("NEW_CART");
          loadHeldSales();
          showAlertMessage("Sale resumed successfully!", "success");
        }
      })
      .catch((error) => {

        showAlertMessage(error.message || "Failed to resume sale. Please try again.", "error");
      });
  };


  const handleResumeSale = (saleId) => {


    if (!isAuthenticated) {
      dispatch(openModal("LOGIN"));
      return;
    }


    if (items.length > 0 && !isHeld) {
      showConfirm({
        title: "Resume Sale",
        message: "Current cart items will be cleared. Continue?",
        confirmText: "Continue",
        onConfirm: () => {
          performResumeSale(saleId);
        },
      });
    } else {
      performResumeSale(saleId);
    }
  };

  // FIXED: handleResumeCurrentHeldSale function
  const handleResumeCurrentHeldSale = () => {

    if (isHeld && saleId) {
      handleResumeSale(saleId);
    } else {
      showAlertMessage("No held sale found to resume", "error");
    }
  };

  const handleDeleteHeldSale = (heldSale) => {
    showConfirm({
      title: "Discard Held Sale",
      message: "Are you sure you want to discard this held sale? This action cannot be undone.",
      confirmText: "Discard",
      onConfirm: async () => {
        try {
          // If we have a backend session ID, release it
          if (heldSale.holdSessionId) {
            const { holdService } = await import('../../services/POS/holdService');
            await holdService.releaseHold(heldSale.holdSessionId);
          }
          
          // Remove from local storage
          const { cartService } = await import('../../services/POS/cartService');
          cartService.removeFromHeldSales(heldSale.saleId);
          
          showAlertMessage("Held sale discarded successfully!", "success");
          loadHeldSales();
        } catch (error) {
          showAlertMessage("Failed to discard held sale.", "error");
          console.error(error);
        }
      }
    });
  };

  const openResumeModal = () => {
    loadHeldSales();
    setMainTab("HOLD_BILLS");
  };

  const closeResumeModal = () => {
    setMainTab("NEW_CART");
  };

  const hasHeldSales = heldSales.length > 0;

  const handleAddTab = () => {
    if (tabs.length < 5) {
      dispatch(addTab());
      showAlertMessage("New tab created successfully!", "success");
    } else {
      showAlertMessage("Maximum number of tabs reached (5)", "warning");
    }
  };

  const handleRemoveTab = (tabId) => {
    if (tabs.length > 1) {
      showConfirm({
        title: "Remove Tab",
        message: "Are you sure you want to remove this tab?",
        confirmText: "Remove",
        onConfirm: () => {
          dispatch(removeTab(tabId));
          localStorage.removeItem("saleId");
          showAlertMessage("Tab removed successfully!", "success");
        },
      });
    }
  };

  const handleSwitchTab = (tabId) => {
    dispatch(switchTab(tabId));
  };

  const startRenaming = (tabId, currentName) => {
    setIsRenaming(tabId);
    setRenameValue(currentName);
  };

  const finishRenaming = () => {
    if (isRenaming && renameValue.trim()) {
      dispatch(renameTab(isRenaming, renameValue.trim()));
      showAlertMessage("Tab renamed successfully!", "success");
    }
    setIsRenaming(null);
    setRenameValue("");
  };

  const cancelRenaming = () => {
    setIsRenaming(null);
    setRenameValue("");
  };

  const handleRenameKeyPress = (e) => {
    if (e.key === "Enter") {
      finishRenaming();
    } else if (e.key === "Escape") {
      cancelRenaming();
    }
  };

  useEffect(() => {
    const initialValues = {};
    items.forEach((item) => {
      initialValues[item.id] = item.quantity.toString();
    });
    setQuantityInputValues(initialValues);
  }, [items]);

  const handleQuantityChange = (itemId, newQuantity) => {
    const item = items.find((item) => item.id === itemId);
    if (!item) return;

    const quantity = Math.max(1, parseInt(newQuantity) || 1);

    if (quantity > item.stock) {
      showAlertMessage(
        `Cannot set quantity to ${quantity}. Only ${item.stock} items available in stock for "${item.name}".`,
        "error"
      );

      setQuantityInputValues((prev) => ({
        ...prev,
        [itemId]: item.quantity.toString(),
      }));
      return;
    }

    dispatch(updateQuantityWithSync(itemId, quantity));
    setActiveInput(null);
  };

  const handleQuantityInput = (e, itemId) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setQuantityInputValues((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleQuantityBlur = (itemId) => {
    const currentValue = quantityInputValues[itemId];
    const currentItem = items.find((item) => item.id === itemId);

    if (!currentItem) return;

    if (!currentValue || currentValue === "" || parseInt(currentValue) < 1) {
      setQuantityInputValues((prev) => ({
        ...prev,
        [itemId]: currentItem.quantity.toString(),
      }));
    } else {
      const newQuantity = parseInt(currentValue);
      const currentQuantity = currentItem.quantity;

      if (newQuantity > currentItem.stock) {
        showAlertMessage(
          `Cannot set quantity to ${newQuantity}. Only ${currentItem.stock} items available in stock for "${currentItem.name}".`,
          "error"
        );
        setQuantityInputValues((prev) => ({
          ...prev,
          [itemId]: currentQuantity.toString(),
        }));
        return;
      }

      if (newQuantity !== currentQuantity) {
        dispatch(updateQuantityWithSync(itemId, newQuantity));
      }
    }
    setActiveInput(null);
  };

  const handleQuantityKeyPress = (e, itemId) => {
    if (e.key === "Enter") {
      e.target.blur();
      setActiveInput(null);
    } else if (e.key === "Escape") {
      const originalQuantity =
        items.find((item) => item.id === itemId)?.quantity || 1;
      setQuantityInputValues((prev) => ({
        ...prev,
        [itemId]: originalQuantity.toString(),
      }));
      setActiveInput(null);
    }
  };

  const incrementQuantity = (itemId, currentQuantity) => {
    const item = items.find((item) => item.id === itemId);
    if (!item) return;

    if (currentQuantity >= item.stock) {
      showAlertMessage(
        `Cannot add more "${item.name}". Only ${item.stock} items available in stock.`,
        "error"
      );
      return;
    }

    dispatch(updateQuantityWithSync(itemId, currentQuantity + 1));
  };

  const decrementQuantity = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      dispatch(updateQuantityWithSync(itemId, currentQuantity - 1));
    } else {
      showConfirm({
        title: "Remove Item",
        message: "Remove this item from cart?",
        confirmText: "Remove",
        onConfirm: () => {
          dispatch(removeFromCartWithSync(itemId));
          showAlertMessage("Item removed from cart", "success");
        },
      });
    }
  };

  const handleQuantityButtonTouch = (e, itemId, action) => {
    e.preventDefault();
    e.stopPropagation();

    const item = items.find((item) => item.id === itemId);
    if (!item) return;

    if (action === "increment") {
      if (item.quantity >= item.stock) {
        showAlertMessage(
          `Cannot add more "${item.name}". Only ${item.stock} items available in stock.`,
          "error"
        );
        return;
      }
      incrementQuantity(itemId, item.quantity);
    } else if (action === "decrement") {
      decrementQuantity(itemId, item.quantity);
    }

    const button = e.currentTarget;
    button.classList.add("opacity-70");
    setTimeout(() => {
      button.classList.remove("opacity-70");
    }, 150);
  };

  const handleInputActivation = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveInput(itemId);
  };

  const handleTouchStart = (e, itemId) => {
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeData({
      ...swipeData,
      [itemId]: {
        startX: e.targetTouches[0].clientX,
        currentX: e.targetTouches[0].clientX,
        isSwiping: false,
      },
    });
  };

  const handleTouchMove = (e, itemId) => {
    if (!swipeData[itemId]) return;

    const touchX = e.targetTouches[0].clientX;
    const deltaX = touchX - swipeData[itemId].startX;

    if (Math.abs(deltaX) > 10) {
      setSwipeData({
        ...swipeData,
        [itemId]: {
          ...swipeData[itemId],
          currentX: touchX,
          isSwiping: true,
        },
      });
    }
  };

  const handleTouchEnd = (e, itemId) => {
    setTouchEnd(e.changedTouches[0].clientX);

    if (!swipeData[itemId]) return;

    const deltaX = swipeData[itemId].currentX - swipeData[itemId].startX;

    if (deltaX < -60 || touchStart - touchEnd > 100) {
      showConfirm({
        title: "Remove Item",
        message: "Remove this item from cart?",
        confirmText: "Remove",
        onConfirm: () => {
          dispatch(removeFromCartWithSync(itemId));
          showAlertMessage("Item removed from cart", "success");
        },
        onCancel: () => {
          setSwipeData({
            ...swipeData,
            [itemId]: null,
          });
        },
      });
    } else {
      setSwipeData({
        ...swipeData,
        [itemId]: null,
      });
    }
  };

  const getSwipeTranslation = (itemId) => {
    if (!swipeData[itemId] || !swipeData[itemId].isSwiping) return 0;

    const deltaX = swipeData[itemId].currentX - swipeData[itemId].startX;

    if (deltaX > 0) return 0;
    if (deltaX < -80) return -80;
    return deltaX * 0.7;
  };

  const getSwipeOpacity = (itemId) => {
    if (!swipeData[itemId] || !swipeData[itemId].isSwiping) return 1;

    const deltaX = Math.abs(
      swipeData[itemId].currentX - swipeData[itemId].startX
    );
    return Math.max(0.7, 1 - deltaX / 200);
  };

  // Handle clear cart with LED clearing
  const handleClearCart = () => {
    dispatch(clearCart());
    clearDisplay(); // Clear LED display
    showAlertMessage("Cart cleared successfully!", "success");
  };

  const getAlertBgColor = () => {
    switch (alertType) {
      case "success":
        return "bg-green-100 border-green-300 dark:bg-green-900/70 dark:border-green-700";
      case "error":
        return "bg-red-100 border-red-300 dark:bg-red-900/70 dark:border-red-700";
      case "warning":
        return "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/70 dark:border-yellow-700";
      case "info":
        return "bg-blue-100 border-blue-300 dark:bg-blue-900/70 dark:border-blue-700";
      default:
        return "bg-gray-100 border-gray-300 dark:bg-gray-900/70 dark:border-gray-700";
    }
  };

  const getAlertTextColor = () => {
    switch (alertType) {
      case "success":
        return "text-green-800 dark:text-green-200";
      case "error":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-yellow-800 dark:text-yellow-200";
      case "info":
        return "text-blue-800 dark:text-blue-200";
      default:
        return "text-gray-800 dark:text-gray-200";
    }
  };

  const getAlertIcon = () => {
    switch (alertType) {
      case "success":
        return (
          <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        );
      case "error":
        return <FiX className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case "warning":
        return (
          <FiPackage className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        );
      case "info":
        return <FiTruck className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <FiTruck className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (activeInput && quantityInputRefs.current[activeInput]) {
      const input = quantityInputRefs.current[activeInput];
      input.focus();
      input.select();
    }
  }, [activeInput]);

  const handleApplyDiscount = () => {
    dispatch(openModal("DISCOUNT"));
  };

  const handleProductDiscount = (itemId) => {
    dispatch(openModal("PRODUCT_DISCOUNT", { itemId }));
  };

  const handlePayment = () => {
    if (!isAuthenticated) {
      dispatch(openModal("LOGIN"));
      return;
    }

    if (items.length === 0) {
      showAlertMessage("Cannot process payment with empty cart", "error");
      return;
    }

    if (isHeld) {
      showAlertMessage(
        "Cannot process payment on a held sale. Please resume the sale first.",
        "error"
      );
      return;
    }

    dispatch(
      openModal("PAYMENT", {
        items,
        subtotal,
        discount: discount,
        totalProductDiscount,
        total,
        tabId: activeTabId,
        onPaymentComplete: () => {
          clearDisplay();
        }
      })
    );
  };

  return (
    <div
      className={`flex flex-col p-2 rounded-xl h-full ${darkMode ? "bg-gray-800" : "bg-white"
        } transition-all duration-300 relative`}
    >
      {/* 2 Main Tabs - Professional POS Style */}
      <div className={`flex border-b shrink-0 mb-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <button
          onClick={() => setMainTab("NEW_CART")}
          className={`flex-1 py-2.5 text-xs font-bold tracking-wide uppercase transition-all border-b-2 ${
            mainTab === "NEW_CART"
              ? "border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
              : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
          }`}
        >
          <i className="fas fa-shopping-cart mr-1"></i> New Cart
          {items.length > 0 && (
            <span className="ml-1 bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5">{items.length}</span>
          )}
        </button>
        <button
          onClick={() => { setMainTab("HOLD_BILLS"); loadHeldSales(); }}
          className={`flex-1 py-2.5 text-xs font-bold tracking-wide uppercase transition-all border-b-2 ${
            mainTab === "HOLD_BILLS"
              ? "border-yellow-500 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
              : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
          }`}
        >
          <i className="fas fa-pause-circle mr-1"></i> Hold Bills
          {heldSales.length > 0 && (
            <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">{heldSales.length}</span>
          )}
        </button>
      </div>

      {mainTab === "HOLD_BILLS" ? (
        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {heldSales.length} Held Transaction{heldSales.length !== 1 ? 's' : ''}
            </span>
            <button onClick={loadHeldSales} className="text-xs text-blue-500 hover:text-blue-600">
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
          {heldSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <i className="fas fa-receipt text-2xl text-gray-400"></i>
              </div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No held bills</p>
              <p className="text-xs text-gray-400 mt-1">Hold a sale to see it here</p>
            </div>
          ) : (
            <div className="space-y-2 flex-grow overflow-y-auto pr-1">
              {heldSales.map((sale, idx) => {
                const total = sale.items.reduce((s, it) => s + ((it.discountedPrice || it.price || 0) * (it.quantity || 1)), 0);
                return (
                  <div key={sale.saleId} className={`rounded-lg border overflow-hidden ${
                    darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
                  } shadow-sm`}>
                    {/* Card Header */}
                    <div className={`flex items-center justify-between px-3 py-2 ${
                      darkMode ? 'bg-gray-600' : 'bg-gray-50'
                    } border-b ${darkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center font-bold">{idx + 1}</span>
                        <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {sale.saleId?.substring(0, 12)}...
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(sale.heldAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    {/* Card Body */}
                    <div className="px-3 py-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <i className="fas fa-box mr-1 text-gray-400"></i>{sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          Rs. {formatCurrency(total)}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {sale.items.map(it => it.name).join(', ')}
                      </p>
                    </div>
                    {/* Card Actions */}
                    <div className={`flex border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <button
                        onClick={() => handleDeleteHeldSale(sale)}
                        disabled={resumeLoading}
                        className={`flex-1 py-2 text-xs font-semibold transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${
                          resumeLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <i className="fas fa-trash mr-1"></i> Discard
                      </button>
                      <div className={`w-px ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                      <button
                        onClick={() => { handleResumeSale(sale.saleId); setMainTab("NEW_CART"); }}
                        disabled={resumeLoading}
                        className={`flex-1 py-2 text-xs font-semibold transition-colors text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 ${
                          resumeLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {resumeLoading
                          ? <><i className="fas fa-spinner fa-spin mr-1"></i>Loading...</>
                          : <><i className="fas fa-play mr-1"></i>Resume</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col flex-grow overflow-hidden relative">
          {items.length === 0 && tabs.length === 1 && !isHeld && !cartFocusMode ? (
            <div className={`flex flex-col p-3 rounded-xl h-full ${darkMode ? "bg-gray-800" : "bg-white"} justify-center items-center relative`}>
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <i className="fas fa-shopping-cart text-3xl mb-2 opacity-50"></i>
                <p className="text-md font-medium">Your cart is empty</p>
                <p className="text-xs mt-1">Add products to see them here</p>
                <div className="flex gap-2 mt-3 justify-center">
                  {hasHeldSales && (
                    <button onClick={openResumeModal} className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-sm hover:shadow transition-all">
                      <i className="fas fa-play mr-1"></i> Resume Sale
                    </button>
                  )}
                  {tabs.length < 5 && (
                    <button onClick={handleAddTab} className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-sm hover:shadow transition-all">
                      <i className="fas fa-plus mr-1"></i> New Tab
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
      {/* Cart Focus Mode: Batch Selection Modal */}
      {cartFocusMode && cfShowBatchModal && (
        <BatchSelectionModal
          batches={cfSelectedProductBatches}
          product={cfSelectedProduct}
          onSelect={handleCfBatchSelect}
          onClose={() => setCfShowBatchModal(false)}
        />
      )}

      {/* Cart Focus Mode: Scan & Search Bar */}
      {cartFocusMode && (
        <div className="mb-3 space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Barcode Input */}
            <div className="relative">
              <div
                className={`flex items-center rounded-md overflow-hidden shadow-sm transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700/50 border-green-500 shadow-md"
                    : "bg-gray-50 border-green-500 shadow-md"
                } border-2`}
              >
                <div className="pl-2 pr-1 text-green-500">
                  <i className="fas fa-barcode text-sm"></i>
                </div>
                <input
                  ref={cfBarcodeRef}
                  type="text"
                  value={cfBarcodeInput}
                  onChange={(e) => setCfBarcodeInput(e.target.value)}
                  onKeyPress={handleCfBarcodeScan}
                  placeholder="Scan or type barcode..."
                  className={`flex-grow px-2 py-2 bg-transparent focus:outline-none text-xs ${
                    darkMode ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"
                  }`}
                  autoFocus
                />
                <button
                  onClick={() => handleCfBarcodeScan({ key: "Enter" })}
                  className="px-3 py-1 ml-1 rounded-r-md bg-gradient-to-r from-green-500 to-green-600 text-white text-xs transition-all hover:from-green-600 hover:to-green-700 active:scale-95"
                >
                  <i className="fas fa-arrow-right text-sm"></i>
                </button>
              </div>
            </div>

            {/* Product Search */}
            <div className="relative">
              <div
                className={`flex items-center rounded-md overflow-hidden shadow-sm transition-all duration-200 ${
                  cfSearchFocused
                    ? darkMode
                      ? "bg-gray-700/50 border-green-500 shadow-md"
                      : "bg-gray-50 border-green-500 shadow-md"
                    : darkMode
                      ? "bg-gray-700/50 border-gray-600"
                      : "bg-gray-50 border-gray-300"
                } border-2`}
              >
                <div className={`pl-2 pr-1 transition-colors ${cfSearchFocused ? "text-blue-500" : "text-gray-400"}`}>
                  <i className="fas fa-search text-sm"></i>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => dispatch(searchProducts(e.target.value))}
                  onKeyPress={(e) => { if (e.key === "Enter") handleCfSearch(); }}
                  onFocus={() => setCfSearchFocused(true)}
                  onBlur={() => {
                    setCfSearchFocused(false);
                    setTimeout(() => { cfBarcodeRef.current?.focus(); }, 200);
                  }}
                  placeholder="Search by name, SKU, category..."
                  className={`flex-grow px-2 py-2 bg-transparent focus:outline-none text-xs ${
                    darkMode ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      dispatch(searchProducts(""));
                      setTimeout(() => { cfBarcodeRef.current?.focus(); }, 100);
                    }}
                    className="px-2 text-gray-400 hover:text-red-500 transition-colors text-xs"
                  >
                    <i className="fas fa-times text-sm"></i>
                  </button>
                )}
                <button
                  onClick={handleCfSearch}
                  className="px-3 py-2 ml-1 rounded-r-md bg-gradient-to-r from-green-500 to-green-600 text-white text-xs transition-all hover:from-green-600 hover:to-green-700 active:scale-95"
                >
                  Search
                </button>
              </div>

              {/* Search Results Dropdown */}
              {searchQuery && (
                <div
                  className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-50 max-h-64 overflow-y-auto ${
                    darkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
                  }`}
                >
                  {(() => {
                    const results = allProducts.filter(
                      (p) =>
                        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.barcode?.includes(searchQuery)
                    ).slice(0, 10);
                    return results.length === 0 ? (
                      <div className={`px-3 py-3 text-xs text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        No products found
                      </div>
                    ) : (
                      results.map((product) => (
                        <button
                          key={product.id || product.productId}
                          onClick={() => handleCfProductFromSearch(product)}
                          className={`w-full text-left px-3 py-2 text-xs flex justify-between items-center transition-colors ${
                            darkMode
                              ? "hover:bg-gray-700 text-gray-200 border-b border-gray-700"
                              : "hover:bg-gray-50 text-gray-800 border-b border-gray-100"
                          }`}
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {product.sku || product.barcode || ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-500">
                              Rs. {formatCurrency(product.price || product.sellingPrice || 0)}
                            </p>
                            <p className={`text-xs ${product.stock > 0 ? (darkMode ? "text-gray-400" : "text-gray-500") : "text-red-500"}`}>
                              {product.stock > 0 ? `Stock: ${product.stock}` : "Out of stock"}
                            </p>
                          </div>
                        </button>
                      ))
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Alert Popup */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-fade-in-down w-full max-w-md px-2 sm:px-0">
          <div
            className={`flex items-center justify-between p-3 sm:p-4 rounded-xl shadow-lg border ${getAlertBgColor()} ${getAlertTextColor()} mx-2`}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              {getAlertIcon()}
              <p className="font-medium text-sm sm:text-base">{alertMessage}</p>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="hover:opacity-70 transition-opacity"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999] p-2">
          <div
            className={`rounded-xl shadow-xl w-full max-w-md ${darkMode ? "bg-gray-800" : "bg-white"
              }`}
          >
            <div className="p-4">
              <div className="text-center">
                <div
                  className={`mx-auto flex items-center justify-center h-10 w-10 rounded-full ${darkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                    }`}
                >
                  <FiAlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
                  {confirmConfig.title}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {confirmConfig.message}
                </p>
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={handleCancel}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {confirmConfig.cancelText || "Cancel"}
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                >
                  {confirmConfig.confirmText || "OK"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(loading || syncLoading || holdLoading || resumeLoading) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl z-10">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <i className="fas fa-spinner fa-spin text-green-500 text-xl mr-2"></i>
            <span className="text-gray-700 dark:text-gray-300">
              {resumeLoading
                ? "Resuming sale..."
                : holdLoading
                  ? "Holding sale..."
                  : syncLoading
                    ? "Syncing with server..."
                    : "Updating cart..."}
            </span>
          </div>
        </div>
      )}

      {/* Modern Tab Navigation - Compact */}
      <div className="mb-0">
        <div className="flex items-center gap-1 mb-1 overflow-x-auto pb-1 hide-scrollbar">
          {tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`flex items-center rounded-md px-8 py-1 cursor-pointer transition-all flex-shrink-0 text-xs ${tab.id === activeTabId
                ? darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-blue-100 text-blue-800"
                : darkMode
                  ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } ${tab.isHeld ? "border border-yellow-400" : ""}`}
              onClick={() => handleSwitchTab(tab.id)}
            >
              <span className="truncate max-w-22">
                {tab.name || `Current Sale ${index + 1}`}
                {tab.isHeld && <span className="text-yellow-500 ml-1">●</span>}
              </span>

              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTab(tab.id);
                  }}
                  className="ml-0.5 hover:text-red-500 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              )}
            </div>
          ))}

          {/* {tabs.length < 5 && (
            <button
              onClick={handleAddTab}
              className={`px-1.5 py-1 rounded-md text-xs ${
                darkMode
                  ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="New Tab"
            >
              <i className="fas fa-plus"></i>
            </button>
          )} */}
        </div>
      </div>

      {/* Header Section - Compact */}
      <div className="flex justify-between items-center mb-2 pb-1 border-b dark:border-gray-700">
        <h2 className="text-md font-bold text-green-600 dark:text-green-400">
          Cart {isHeld && <span className="text-yellow-500 text-xs">(Held)</span>}
        </h2>
        <div className="flex gap-1">
          {/* Hold/Resume buttons */}
          {isFirstTab && (
            <>
              {/* Button to view held sales (always visible) */}
              <button
                onClick={openResumeModal}
                disabled={resumeLoading}
                className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center transition-all hover:bg-blue-600 text-xs disabled:opacity-50"
                title="View Held Sales"
              >
                <i className="fas fa-shopping-cart"></i>
              </button>
              
              {/* Hold Sale Button (visible if current sale is not held) */}
              {!isHeld && (
                <button
                  onClick={handleHoldSale}
                  disabled={holdLoading || items.length === 0}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-all text-xs ${items.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={items.length === 0 ? "Cart is empty" : "Hold Sale"}
                >
                  <FiPause className="w-3 h-3" />
                </button>
              )}

              {/* Resume current sale button if current tab is held */}
              {isHeld && saleId && (
                <button
                  onClick={handleResumeCurrentHeldSale}
                  disabled={resumeLoading}
                  className="w-6 h-6 rounded bg-green-500 text-white flex items-center justify-center transition-all hover:bg-green-600 text-xs disabled:opacity-50"
                  title="Resume Current Sale"
                >
                  <FiPlay className="w-3 h-3" />
                </button>
              )}
            </>
          )}

          <button
            onClick={() => {
              if (items.length > 0) {
                showConfirm({
                  title: "Clear Cart",
                  message: "Clear all items from cart?",
                  confirmText: "Clear",
                  onConfirm: handleClearCart,
                });
              }
            }}
            disabled={items.length === 0}
            className={`w-6 h-6 rounded flex items-center justify-center transition-all text-xs ${items.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
              } disabled:opacity-50`}
            title={items.length === 0 ? "Cart is empty" : "Clear Cart"}
          >
            <i className="fas fa-trash text-xs"></i>
          </button>
        </div>
      </div>



      {/* Cart Items Section - Compact */}
      <div className="flex-grow overflow-y-auto mb-2">
        {isHeld && items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiPackage className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Sale is on hold</p>
            <p className="text-xs mt-1">Resume to continue this sale</p>
            <button
              onClick={handleResumeCurrentHeldSale}
              disabled={resumeLoading}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-sm hover:shadow transition-all disabled:opacity-50"
            >
              {resumeLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Resuming...
                </>
              ) : (
                <>
                  <FiPlay className="w-4 h-4 inline mr-2" />
                  Resume Sale
                </>
              )}
            </button>

            {/* Also show the resume modal button in the held state */}
            {hasHeldSales && (
              <button
                onClick={openResumeModal}
                className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-sm hover:shadow transition-all"
              >
                <i className="fas fa-list mr-2"></i>
                View All Held Sales
              </button>
            )}
          </div>
        ) : items.length === 0 ? (
          cartFocusMode ? (
            /* Cart Focus Mode: Ready to scan state */
            <div className="flex flex-col items-center justify-center h-full py-8 text-gray-400 dark:text-gray-500">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <i className="fas fa-barcode text-3xl text-green-400"></i>
              </div>
              <p className={`text-base font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Ready to scan</p>
              <p className="text-xs text-center max-w-xs">
                Scan a barcode or search for a product above to add items to the cart
              </p>
              {hasHeldSales && (
                <button
                  onClick={openResumeModal}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm hover:shadow transition-all flex items-center gap-2"
                >
                  <i className="fas fa-play"></i> Resume Held Sale
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <i className="fas fa-shopping-cart text-3xl mb-2 opacity-50"></i>
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs mt-1">Add products to see them here</p>

              {/* Show resume options in empty cart if there are held sales */}
              {hasHeldSales && (
                <div className="mt-3">
                  <button
                    onClick={openResumeModal}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded text-sm hover:shadow transition-all"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Resume Held Sale
                  </button>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="space-y-1.5">
            {[...items].reverse().map((item) => {
              const swipeTranslation = getSwipeTranslation(item.id);
              const discountAmount = getProductDiscount(item);
              const discountedPrice = getDiscountedPrice(item);
              const itemTotal = getItemTotal(item);
              const itemDiscountTotal = getItemDiscountAmount(item);
              const discountPercentage = getItemDiscountPercentage(item);
              const hasDiscount = discountAmount > 0;

              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden"
                  onTouchStart={(e) => handleTouchStart(e, item.id)}
                  onTouchMove={(e) => handleTouchMove(e, item.id)}
                  onTouchEnd={(e) => handleTouchEnd(e, item.id)}
                >
                  {/* Swipe to delete background */}
                  <div
                    className="absolute inset-y-0 right-0 w-16 bg-red-500 flex items-center justify-center text-white"
                    style={{
                      transform: `translateX(${swipeTranslation + 64}px)`,
                    }}
                  >
                    <i className="fas fa-trash text-sm"></i>
                  </div>

                  {/* Cart Item - Compact */}
                  <div
                    className={`p-1.5 rounded-md relative transition-transform duration-200 ${darkMode ? "bg-gray-700/30" : "bg-gray-100"
                      }`}
                    style={{ transform: `translateX(${swipeTranslation}px)` }}
                  >
                    {/* Product Name at Top */}
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-medium dark:text-white truncate max-w-[70%]">
                        {item.name}
                      </p>
                      <p className="text-sm font-medium dark:text-white">
                        Rs. {formatCurrency(itemTotal)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 object-cover"
                            />
                          ) : (
                            <i className="fas fa-box text-gray-500 dark:text-gray-400 text-xs"></i>
                          )}
                        </div>

                        <div className="ml-2">
                          {/* Original Price with strikethrough - only show if there's a discount */}
                          <div className="flex items-center gap-1">
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                                Rs. {formatCurrency(item.price)}
                              </span>
                            )}
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                              Rs. {formatCurrency(discountedPrice)}
                            </span>
                          </div>

                          {/* Discount Amount Display - only show if there's a discount */}
                          {hasDiscount && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                                -Rs. {formatCurrency(discountAmount)}
                                {discountPercentage > 0 &&
                                  ` (${discountPercentage}%)`}
                              </span>
                            </div>
                          )}

                          {/* Stock Information */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className={`text-xs font-medium ${item.stock < 5
                                ? "text-yellow-500 dark:text-yellow-400"
                                : "text-blue-500 dark:text-blue-400"
                                }`}
                            >
                              Stock: {item.stock}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            decrementQuantity(item.id, item.quantity)
                          }
                          className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target"
                          disabled={loading || isHeld}
                        >
                          <i className="fas fa-minus"></i>
                        </button>

                        {activeInput === item.id ? (
                          <input
                            ref={(el) =>
                              (quantityInputRefs.current[item.id] = el)
                            }
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={quantityInputValues[item.id] || item.quantity}
                            onChange={(e) => handleQuantityInput(e, item.id)}
                            onBlur={() => handleQuantityBlur(item.id)}
                            onKeyDown={(e) => handleQuantityKeyPress(e, item.id)}
                            className="w-10 py-0.5 text-center text-xs border rounded mx-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-target"
                            disabled={loading || isHeld}
                          />
                        ) : (
                          <div
                            onTouchStart={(e) =>
                              handleInputActivation(e, item.id)
                            }
                            onClick={() => !isHeld && setActiveInput(item.id)}
                            className="w-8 py-0.5 text-center text-xs border rounded mx-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white touch-target flex items-center justify-center"
                            style={{ minHeight: "24px" }}
                          >
                            {item.quantity}
                          </div>
                        )}

                        <button
                          onClick={() =>
                            incrementQuantity(item.id, item.quantity)
                          }
                          className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target"
                          disabled={loading || item.quantity >= item.stock || isHeld}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Section - Compact */}
      <div
        className={`p-2 rounded-md mb-2 text-xs ${darkMode ? "bg-gray-700/30" : "bg-gray-100"
          }`}
      >
        {/* Summary Rows */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
              Subtotal (After Discounts):
            </span>
            <span className="font-semibold">
              Rs. {formatCurrency(subtotal)}
            </span>
          </div>

          {/* Product Discounts Summary */}
          {totalProductDiscount > 0 && (
            <div className="flex justify-between items-center">
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Product Discounts:
              </span>
              <span className="font-semibold text-red-500">
                 ({formatCurrency(totalProductDiscount)})
              </span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between items-center">
              <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                Additional Cart Discount:
              </span>
              <span className="font-semibold text-red-500">
                 ({formatCurrency(discount)})
              </span>
            </div>
          )}
        </div>

        {/* Total Row */}
        <div className="flex justify-between items-center mt-2 pt-1 border-t dark:border-gray-700">
          <span className="font-bold text-green-600 dark:text-green-400">
            Total:
          </span>
          <span className="font-bold text-green-600 dark:text-green-400">
            Rs. {formatCurrency(total)}
          </span>
        </div>

        {/* Action Buttons - Compact */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={handlePayment}
            disabled={isPaymentDisabled}
            className={`col-span-1 py-1.5 text-white font-semibold rounded text-xs transition-all flex items-center justify-center gap-1 touch-target ${isPaymentDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-600 hover:shadow"
              }`}
          >
            <i className="fas fa-credit-card"></i>
            <span>{isHeld ? "Sale Held - Resume First" : "Payment"}</span>
          </button>
          <button
            onClick={handleApplyDiscount}
            disabled={isHeld || items.length === 0}
            className={`py-1.5 font-semibold rounded text-xs transition-all flex items-center justify-center gap-1 ${isHeld || items.length === 0
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow"
              }`}
          >
            <i className="fas fa-percent"></i>
            <span>Discount</span>
          </button>
        </div>
      </div>

      {/* Tab Stats - Compact */}
      <div
        className={`text-xs text-center pt-1 border-t dark:border-gray-700 ${darkMode ? "text-gray-400" : "text-gray-500"
          }`}
      >
        {items.length} item{items.length !== 1 ? "s" : ""} • Tab{" "}
        {tabs.findIndex((t) => t.id === activeTabId) + 1} of {tabs.length}
        {activeTab.saleId && ` • Sale ID: ${activeTab.saleId}`}
        {isHeld && ` • Status: Held`}
      </div>

      {/* Custom CSS for touch optimization */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .touch-target {
          min-height: 28px;
          min-width: 28px;
          touch-action: manipulation;
        }
        input.touch-target {
          font-size: 16px; /* Prevents zoom on iOS */
        }
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translate3d(-50%, -20px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out;
        }
      `}</style>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartSection;

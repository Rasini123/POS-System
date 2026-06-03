// import React, { useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { applyDiscount } from '../../actions/POS/cartActions';
// import { closeModal } from '../../actions/modalActions';
// import Modal from '../common/Modal';
// const DiscountModal = () => {
//   const dispatch = useDispatch();
//   const { discountType } = useSelector(state => state.cart);
//   const { darkMode } = useSelector(state => state.ui);
//   const [discountValue, setDiscountValue] = useState('');
//   const [couponCode, setCouponCode] = useState('');
//   const [customerId, setCustomerId] = useState('');
//   const [showAdminLogin, setShowAdminLogin] = useState(false);
//   const [adminUser, setAdminUser] = useState('');
//   const [adminPass, setAdminPass] = useState('');
//   const [error, setError] = useState('');
//   const subtotal = useSelector(state =>
//     state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
//   );
//   const validateDiscount = () => {
//     if (discountType === 'percent') {
//       const percent = parseFloat(discountValue);
//       return !isNaN(percent) && percent >= 0 && percent <= 100;
//     } else {
//       const amount = parseFloat(discountValue);
//       return !isNaN(amount) && amount >= 0 && amount <= subtotal;
//     }
//   };
// const handleDiscountClick = () => {
//   const value = parseFloat(discountValue);
//   if (!validateDiscount()) {
//     setError('Invalid discount value');
//     return;
//   }
//   if ((discountType === 'percent' && value > 5) || (discountType === 'amount' && value > 5000)) {
//     setShowAdminLogin(true);
//   } else {
//     applyDiscountNow();
//   }
// };
// const applyDiscountNow = () => {
//   if (discountType === 'percent') {
//     const percent = parseFloat(discountValue);
//     dispatch(applyDiscount(subtotal * (percent / 100), 'percent'));
//   } else {
//     const amount = parseFloat(discountValue);
//     dispatch(applyDiscount(Math.min(amount, subtotal), 'amount'));
//   }
//   dispatch(closeModal());
// };
// const handleAdminConfirm = () => {
//   if (adminUser === 'admin' && adminPass === 'admin123') {
//     applyDiscountNow();
//   } else {
//     setError('Invalid admin credentials');
//   }
// };
//   return (
//     <Modal>
//       <div className={`p-5 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
//         {!showAdminLogin ? (
//           <>
//             <h2 className="text-lg font-bold mb-4 text-green-600">Apply Discount</h2>
//             {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
//             <div className="flex gap-2 mb-2">
//               <button
//                 onClick={() => dispatch(applyDiscount(0, 'percent'))}
//                 className={`flex-1 py-1 rounded-lg border text-sm ${
//                   discountType === 'percent'
//                     ? 'bg-green-500 text-white border-green-500'
//                     : darkMode
//                       ? 'bg-gray-600 text-white border-gray-500'
//                       : 'bg-white text-gray-800 border-gray-300'
//                 }`}
//               >
//                 %
//               </button>
//               <button
//                 onClick={() => dispatch(applyDiscount(0, 'amount'))}
//                 className={`flex-1 py-1 rounded-lg border text-sm ${
//                   discountType === 'amount'
//                     ? 'bg-green-500 text-white border-green-500'
//                     : darkMode
//                       ? 'bg-gray-600 text-white border-gray-500'
//                       : 'bg-white text-gray-800 border-gray-300'
//                 }`}
//               >
//                 Amount
//               </button>
//             </div>
//             <input
//               type="text"
//               value={discountValue}
//               onChange={(e) => setDiscountValue(e.target.value)}
//               placeholder={discountType === 'percent' ? 'Discount %' : 'Discount amount'}
//               className="w-full px-3 py-2 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
//             />
//             <input
//               type="text"
//               value={couponCode}
//               onChange={(e) => setCouponCode(e.target.value)}
//               placeholder="Coupon code"
//               className="w-full px-3 py-2 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
//             />
//             <input
//               type="text"
//               value={customerId}
//               onChange={(e) => setCustomerId(e.target.value)}
//               placeholder="Customer ID"
//               className="w-full px-3 py-2 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
//             />
//             <button
//               onClick={handleDiscountClick}
//               className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
//             >
//               Continue (Require Admin)
//             </button>
//           </>
//         ) : (
//           <>
//             <h2 className="text-lg font-bold mb-4 text-blue-600">Admin Authorization</h2>
//             {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
//             <input
//               type="text"
//               value={adminUser}
//               onChange={(e) => setAdminUser(e.target.value)}
//               placeholder="Admin Username"
//               className="w-full px-3 py-2 mb-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
//             />
//             <input
//               type="password"
//               value={adminPass}
//               onChange={(e) => setAdminPass(e.target.value)}
//               placeholder="Admin Password"
//               className="w-full px-3 py-2 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
//             />
//             <button
//               onClick={handleAdminConfirm}
//               className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
//             >
//               Confirm & Apply Discount
//             </button>
//           </>
//         )}
//       </div>
//     </Modal>
//   );
// };
// export default DiscountModal;




import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { applyDiscount } from '../../actions/POS/cartActions';
import { closeModal } from '../../actions/modalActions';
import Modal from '../common/Modal';
import { FiPercent, FiDollarSign, FiUser, FiTag, FiX, FiCheckCircle } from 'react-icons/fi';

const DiscountModal = () => {
  const dispatch = useDispatch();

  const user = useSelector(state => state.auth?.user);
  const cartState = useSelector(state => state.cart);
  const tabs = cartState?.tabs || [];
  const activeTabId = cartState?.activeTabId || 'tab-1';

  const activeTab = tabs.find(tab => tab.id === activeTabId) || { items: [], discount: 0, discountType: 'percent' };
  const items = activeTab.items || [];
  const currentDiscountType = activeTab.discountType || 'percent';

  const { darkMode } = useSelector(state => state.ui);

  const [discountValue, setDiscountValue] = useState('');
  const [discountType, setDiscountType] = useState(currentDiscountType);
  const [couponCode, setCouponCode] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.discountedPrice * item.quantity), 0);
  }, [items]);

  const calculateDiscountAmount = (value, type) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return 0;

    if (type === 'percent') {
      return subtotal * (numValue / 100);
    } else {
      return Math.min(numValue, subtotal);
    }
  };

  const validateDiscount = () => {
    if (discountValue.trim() === '') {
      setError('Please enter a discount value');
      return false;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid positive number');
      return false;
    }

    if (discountType === 'percent') {
      if (value > 100) {
        setError('Percentage cannot exceed 100%');
        return false;
      }
    } else {
      if (value > subtotal) {
        setError(`Discount amount cannot exceed subtotal (Rs. ${subtotal.toFixed(2)})`);
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleApplyDiscount = () => {
    if (!validateDiscount()) {
      return;
    }

    const value = parseFloat(discountValue);
    const isAdmin = user?.userType === 'A' || String(user?.userType).toLowerCase() === 'admin' || user?.RoleName === 'Admin';

    if (!isAdmin && ((discountType === 'percent' && value > 5) || (discountType === 'amount' && value > 5000))) {
      setShowAdminLogin(true);
    } else {
      applyDiscountNow();
    }
  };

  const applyDiscountNow = () => {
    const discountAmount = calculateDiscountAmount(discountValue, discountType);

    dispatch(applyDiscount(discountAmount, discountType, activeTabId));
    dispatch(closeModal());
  };

  const handleAdminConfirm = () => {
    if (adminUser === 'admin' && adminPass === 'admin123') {
      applyDiscountNow();
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    setDiscountValue('');
    setError('');
  };

  const discountAmount = useMemo(() =>
    calculateDiscountAmount(discountValue, discountType),
    [discountValue, discountType, subtotal]
  );

  const formatNumber = (num) => {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const quickDiscounts = discountType === 'percent'
    ? ['5', '10', '15', '20']
    : ['100', '500', '1000', '2000'];

  return (
    <Modal>
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} w-full max-w-md mx-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-green-600 flex items-center gap-2">
            <FiTag className="w-4 h-4" />
            Apply discount
          </h2>
          <button
            onClick={() => dispatch(closeModal())}
            className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <FiX className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center">
            <FiX className="w-3 h-3 mr-1 flex-shrink-0" />
            {error}
          </div>
        )}

        {!showAdminLogin ? (
          <>
            {/* Discount Type Selection */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => handleDiscountTypeChange('percent')}
                className={`p-2 rounded-lg border flex items-center justify-center text-sm ${discountType === 'percent'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <FiPercent className="w-4 h-4 mr-1" />
                Percentage
              </button>
              <button
                onClick={() => handleDiscountTypeChange('amount')}
                className={`p-2 rounded-lg border flex items-center justify-center text-sm ${discountType === 'amount'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
              >
                <FiDollarSign className="w-4 h-4 mr-1" />
                Amount
              </button>
            </div>

            {/* Discount Input */}
            <div className="mb-3">
              <label className="block text-xs font-medium mb-1 dark:text-gray-300">
                {discountType === 'percent' ? 'Discount Percentage' : 'Discount Amount'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value);
                    setError('');
                  }}
                  placeholder={discountType === 'percent' ? '0-100%' : `0-${formatNumber(subtotal)}`}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  step={discountType === 'percent' ? '0.1' : '0.01'}
                  min="0"
                  max={discountType === 'percent' ? '100' : subtotal}
                />
                <div className="absolute right-2 top-2 text-xs text-gray-500 dark:text-gray-400">
                  {discountType === 'percent' ? '%' : 'Rs.'}
                </div>
              </div>
            </div>

            {/* Quick Discount Buttons */}
            <div className="grid grid-cols-4 gap-1 mb-3">
              {quickDiscounts.map((value) => (
                <button
                  key={value}
                  onClick={() => setDiscountValue(value)}
                  className="py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {value}{discountType === 'percent' ? '%' : ''}
                </button>
              ))}
            </div>

            {/* Order Summary Compact */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
               

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Subtotal:</span>
                  <span className="font-medium">Rs. {formatNumber(subtotal)}</span>
                </div>

                {discountValue && (
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Discount:
                    </span>
                    <span className="font-medium text-red-500">
                      -Rs. {formatNumber(discountAmount)}
                    </span>
                  </div>
                  
                )}
                <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold dark:text-white">Order Summary</h3>
                <button
                  onClick={handleApplyDiscount}
                  className="py-1 px-7 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center"
                  disabled={!discountValue.trim()}
                >
                  <FiCheckCircle className="w-3 h-3 mr-1" />
                  Apply
                </button>
              </div>
              </div>
            </div>

            {/* Optional Fields */}
            {/* <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium mb-1 dark:text-gray-300 flex items-center">
                  <FiTag className="w-3 h-3 mr-1" />
                  Coupon Code (Optional)
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 dark:text-gray-300 flex items-center">
                  <FiUser className="w-3 h-3 mr-1" />
                  Customer ID (Optional)
                </label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter customer ID"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div> */}
          </>
        ) : (
          <>
            <div className="text-center mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400">Admin Authorization Required</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Administrator approval required for discounts over {discountType === 'percent' ? '5%' : 'Rs. 5,000'}.
              </p>
            </div>

            <div className="space-y-2 mb-3">
              <div>
                <label className="block text-xs font-medium mb-1 dark:text-gray-300">Admin Username</label>
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 dark:text-gray-300">Admin Password</label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowAdminLogin(false)}
                className="py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminConfirm}
                className="py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors"
              >
                Confirm & Apply
              </button>
            </div>
          </>
        )}

      </div>

    </Modal>
  );
};

export default DiscountModal;

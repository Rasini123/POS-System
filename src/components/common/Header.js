


// import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { toggleTheme } from '../../actions/uiActions';
// import { logout } from '../../actions/authActions';

// const Header = ({ activePage }) => {
//   const dispatch = useDispatch();
//   const { user, isAuthenticated } = useSelector(state => state.auth);
//   const { darkMode } = useSelector(state => state.ui);

//   const handleThemeToggle = () => {
//     dispatch(toggleTheme());
//   };

 

// const handleLogout = () => {
//   dispatch(logout());
//   // window.location.reload();
// };

//   const getPageInfo = (pageId) => {
//     const pageMap = {
//       'POS': { title: 'Point of Sale', icon: 'fas fa-cash-register', description: 'Process transactions and sales' },
//       'USER_ACCESS': { title: 'User Access Management', icon: 'fas fa-user-shield', description: 'Manage user permissions and access' },
//       'INVENTORY_CATEGORY': { title: 'Category Management', icon: 'fas fa-tags', description: 'Manage product categories' },
//       'INVENTORY_PRODUCT': { title: 'Product Management', icon: 'fas fa-box', description: 'Manage product inventory' },
//       'INVENTORY_WAREHOUSE': { title: 'Warehouse Management', icon: 'fas fa-warehouse', description: 'Manage warehouse operations' },
//       'INVENTORY_STORE_TRANSACTION_PURCHASE_ITEM': { title: 'Purchase Item (GRN)', icon: 'fas fa-truck-loading', description: 'Goods Received Note management' },
//       'INVENTORY_STORE_TRANSACTION_SALES_INVOICE': { title: 'Sales Invoice (MRQ)', icon: 'fas fa-file-invoice', description: 'Material Requisition management' },
//       'INVENTORY_STORE_TRANSACTION_PURCHASE_RETURN': { title: 'Purchase Return (PRN)', icon: 'fas fa-undo-alt', description: 'Purchase Return Note management' },
//       'INVENTORY_STORE_TRANSACTION_SALES_RETURN': { title: 'Sales Return (MRN)', icon: 'fas fa-reply', description: 'Material Return Note management' },
//       'INVENTORY_STORE_TRANSACTION_STOCK_ADJUSTMENT': { title: 'Stock Adjustment', icon: 'fas fa-balance-scale', description: 'Adjust stock levels' },
//       'INVENTORY_STORE_TRANSACTION_WRITE_OFF': { title: 'Write Off', icon: 'fas fa-times-circle', description: 'Write off damaged/expired items' },
//       'REPORTS_REORDER_LEVEL': { title: 'Re-order Level Report', icon: 'fas fa-chart-line', description: 'View items below reorder level' },
//       'REPORTS_DAILY_SUMMARY': { title: 'Daily Summary Report', icon: 'fas fa-calendar-day', description: 'Daily sales and transaction summary' },
//       'REPORTS_TOTAL_PURCHASING': { title: 'Total Purchasing Report', icon: 'fas fa-shopping-cart', description: 'Total purchasing analysis' }
//     };

//     return pageMap[pageId] || { title: 'DS POS System', icon: 'fas fa-microchip', description: 'Point of Sale System' };
//   };

//   const currentPageInfo = getPageInfo(activePage);

//   return (
//     <div className={`flex flex-col rounded-xl shadow-md ${
//       darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'
//     } border`}>
      
//       {/* Main Header Row */}
//       <div className="flex flex-col md:flex-row justify-between items-center p-2 md:p-3">
//         <div className="flex items-center gap-2 mb-2 md:mb-0">
//           <i className="fas fa-microchip text-xl md:text-2xl bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent"></i>
//           <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">DS POS</h1>
//         </div>
        
//         <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
//           {isAuthenticated && (
//             <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md ${
//               darkMode ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-green-100 text-green-700 border-green-200'
//             } border text-xs md:text-sm font-medium shadow-sm`}>
//               <i className="fas fa-user text-xs"></i>
//               <span>{user.username}</span>  
//             </div>
//           )}
          
//           <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md ${
//             darkMode ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-green-100 text-green-700 border-green-200'
//           } border text-xs md:text-sm font-medium shadow-sm`}>
//             <i className="fas fa-store text-xs"></i>
//             <span>Store #T42</span>
//           </div>
          
//           <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md ${
//             darkMode ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-green-100 text-green-700 border-green-200'
//           } border text-xs md:text-sm font-medium shadow-sm`}>
//             <i className="fas fa-clock text-xs"></i>
//             <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
//           </div>
          
//           <button 
//             onClick={handleThemeToggle}
//             className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-green-500 text-white text-xs md:text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5 ${
//               darkMode ? 'hover:bg-green-600' : 'hover:bg-green-600'
//             }`}
//           >
//             <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-xs`}></i> 
//             {darkMode ? 'Light' : 'Dark'}
//           </button>
          
//           {isAuthenticated && (
//             <button 
//               onClick={handleLogout}
//               className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-red-500 text-white text-xs md:text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5 hover:bg-red-600`}
//             >
//               <i className="fas fa-sign-out-alt text-xs"></i> 
//               Logout
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Active Page Information Row */}
//       {activePage && (
//         <div className={`px-2 md:px-3 pb-2 md:pb-3 border-t ${
//           darkMode ? 'border-gray-700' : 'border-gray-200'
//         }`}>
//           <div className={`flex items-center gap-3 p-2 md:p-3 rounded-lg mt-2 ${
//             darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
//           }`}>
//             <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg ${
//               darkMode ? 'bg-blue-600' : 'bg-blue-500'
//             } text-white flex-shrink-0`}>
//               <i className={`${currentPageInfo.icon} text-sm md:text-base`}></i>
//             </div>
            
//             <div className="flex-1 min-w-0">
//               <h2 className={`text-sm md:text-base font-semibold truncate ${
//                 darkMode ? 'text-white' : 'text-gray-800'
//               }`}>
//                 {currentPageInfo.title}
//               </h2>
//               <p className={`text-xs md:text-sm truncate ${
//                 darkMode ? 'text-gray-400' : 'text-gray-600'
//               }`}>
//                 {currentPageInfo.description}
//               </p>
//             </div>
            
//             <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
//               darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
//             }`}>
//               <i className="fas fa-dot-circle text-xs"></i>
//               <span>Active</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Header;


import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../actions/uiActions';
import { logout } from '../../actions/authActions';

const Header = ({ activePage }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { darkMode } = useSelector(state => state.ui);
  const { tabs, activeTabId } = useSelector(state => state.cart);
  
  // State for real-time clock
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const hasItemsInCart = () => {
    return tabs.some(tab => tab.items && tab.items.length > 0);
  };

  const handleLogout = () => {
    if (hasItemsInCart()) {
      alert('Cannot log out while there are items in the cart. Please complete or clear all sales before logging out.');
      return;
    }
    
    dispatch(logout());
  };

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  const getPageInfo = (pageId) => {
    const pageMap = {
      'POS': { title: 'Point of Sale', icon: 'fas fa-cash-register', description: 'Process transactions and sales' },
      'USER_ACCESS': { title: 'User Access Management', icon: 'fas fa-user-shield', description: 'Manage user permissions and access' },
      'INVENTORY_CATEGORY': { title: 'Category Management', icon: 'fas fa-tags', description: 'Manage product categories' },
      'INVENTORY_PRODUCT': { title: 'Product Management', icon: 'fas fa-box', description: 'Manage product inventory' },
      'INVENTORY_WAREHOUSE': { title: 'Warehouse Management', icon: 'fas fa-warehouse', description: 'Manage warehouse operations' },
      'INVENTORY_STORE_TRANSACTION_PURCHASE_ITEM': { title: 'Purchase Item (GRN)', icon: 'fas fa-truck-loading', description: 'Goods Received Note management' },
      'INVENTORY_STORE_TRANSACTION_SALES_INVOICE': { title: 'Sales Invoice (MRQ)', icon: 'fas fa-file-invoice', description: 'Material Requisition management' },
      'INVENTORY_STORE_TRANSACTION_PURCHASE_RETURN': { title: 'Purchase Return (PRN)', icon: 'fas fa-undo-alt', description: 'Purchase Return Note management' },
      'INVENTORY_STORE_TRANSACTION_SALES_RETURN': { title: 'Sales Return (MRN)', icon: 'fas fa-reply', description: 'Material Return Note management' },
      'INVENTORY_STORE_TRANSACTION_STOCK_ADJUSTMENT': { title: 'Stock Adjustment', icon: 'fas fa-balance-scale', description: 'Adjust stock levels' },
      'INVENTORY_STORE_TRANSACTION_WRITE_OFF': { title: 'Write Off', icon: 'fas fa-times-circle', description: 'Write off damaged/expired items' },
      'REPORTS_REORDER_LEVEL': { title: 'Re-order Level Report', icon: 'fas fa-chart-line', description: 'View items below reorder level' },
      'REPORTS_DAILY_SUMMARY': { title: 'Daily Summary Report', icon: 'fas fa-calendar-day', description: 'Daily sales and transaction summary' },
      'REPORTS_AUDIT': { title: 'Audit Report', icon: 'fas fa-user-secret', description: 'Audit logs and actions' },
      'REPORTS_TOTAL_PURCHASING': { title: 'Total Purchasing Report', icon: 'fas fa-shopping-cart', description: 'Total purchasing analysis' }
    };

    return pageMap[pageId] || { title: 'R.S. Bathik Gallery', icon: 'fas fa-store', description: 'Bathik Clothing — Point of Sale' };
  };

  // Get user role display information - FIXED TO SHOW FULL ROLE NAME
  const getUserRoleInfo = () => {
    if (!user || !user.userType) return null;

    const role = user.userType.toString().toLowerCase();
    
    // Map backend role values to display names
    let displayRole = user.userType; // Default to original value
    
    // If you want to customize the display names, you can map them here:
    const roleDisplayMap = {
      'a': 'Administrator',
      'admin': 'Administrator',
      'administrator': 'Administrator',
      'c': 'Cashier',
      'cashier': 'Cashier',
      'user': 'User',
      'manager': 'Manager',
      'supervisor': 'Supervisor'
    };

    // Use mapped display name or fallback to original role (capitalized)
    displayRole = roleDisplayMap[role] || 
                 user.userType.charAt(0).toUpperCase() + user.userType.slice(1).toLowerCase();

    if (role.includes('admin') || role.includes('a')) {
      return {
        text: displayRole, // Use the full display name
        icon: 'fas fa-crown',
        color: darkMode ? 'text-yellow-400' : 'text-yellow-600',
        bg: darkMode ? 'bg-yellow-900/20 border-yellow-800/50' : 'bg-yellow-100 border-yellow-200',
        badgeColor: 'bg-yellow-500'
      };
    } else if (role.includes('cashier') || role.includes('c')) {
      return {
        text: displayRole, // Use the full display name
        icon: 'fas fa-cash-register',
        color: darkMode ? 'text-blue-400' : 'text-blue-600',
        bg: darkMode ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-100 border-blue-200',
        badgeColor: 'bg-blue-500'
      };
    } else {
      return {
        text: displayRole, // Use the full display name
        icon: 'fas fa-user',
        color: darkMode ? 'text-green-400' : 'text-green-600',
        bg: darkMode ? 'bg-green-900/20 border-green-800/50' : 'bg-green-100 border-green-200',
        badgeColor: 'bg-green-500'
      };
    }
  };

  // Format time function
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  // Format date function
  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const currentPageInfo = getPageInfo(activePage);
  const cartHasItems = hasItemsInCart();
  const userRoleInfo = getUserRoleInfo();

  return (
    <div className={`flex flex-col rounded-xl shadow-md ${
      darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'
    } border`}>
      
      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-center p-2 md:p-3">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <i className="fas fa-store text-xl md:text-2xl bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent"></i>
          <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent">R.S. Bathik Gallery</h1>
        </div>
        
        <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
          {isAuthenticated && user && (
            <>
              {/* User Role Badge - Now shows full role name */}
              {userRoleInfo && (
                <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md border text-xs md:text-sm font-medium shadow-sm ${userRoleInfo.bg} ${userRoleInfo.color}`}>
                  <i className={`${userRoleInfo.icon} text-xs`}></i>
                  <span>{userRoleInfo.text}</span> {/* This now shows full role name */}
                </div>
              )}
              
              {/* Username Display */}
              <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md ${
                darkMode ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-green-100 text-green-700 border-green-200'
              } border text-xs md:text-sm font-medium shadow-sm`}>
                <i className="fas fa-user text-xs"></i>
                <span>{user.username}</span>  
              </div>
            </>
          )}
          
          {/* <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md ${
            darkMode ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-green-100 text-green-700 border-green-200'
          } border text-xs md:text-sm font-medium shadow-sm`}>
            <i className="fas fa-store text-xs"></i>
            <span>Store #T42</span>
          </div> */}
          
          {/* Separate Date Display */}
          <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md ${
            darkMode ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-green-100 text-green-700 border-green-200'
          } border text-xs md:text-sm font-medium shadow-sm`}>
            <i className="fas fa-calendar text-xs"></i>
            <span>{formatDate(currentTime)}</span>
          </div>
          
          {/* Separate Time Display */}
          <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-md ${
            darkMode ? 'bg-green-900/20 text-green-400 border-green-800/50' : 'bg-green-100 text-green-700 border-green-200'
          } border text-xs md:text-sm font-medium shadow-sm`}>
            <i className="fas fa-clock text-xs"></i>
            <span className="font-mono">{formatTime(currentTime)}</span>
          </div>
          
          <button 
            onClick={handleThemeToggle}
            className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg bg-green-500 text-white text-xs md:text-sm font-medium transition-all hover:shadow-md hover:-translate-y-0.5 ${
              darkMode ? 'hover:bg-green-600' : 'hover:bg-green-600'
            }`}
          >
            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-xs`}></i> 
            {darkMode ? 'Light' : 'Dark'}
          </button>
          
          {isAuthenticated && (
            <button 
              onClick={handleLogout}
              disabled={cartHasItems}
              className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium transition-all ${
                cartHasItems
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-red-500 text-white hover:shadow-md hover:-translate-y-0.5 hover:bg-red-600'
              }`}
              title={cartHasItems ? 'Cannot logout with items in cart' : 'Logout'}
            >
              <i className="fas fa-sign-out-alt text-xs"></i> 
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Active Page Information Row */}
      {activePage && (
        <div className={`px-2 md:px-3 pb-2 md:pb-3 border-t ${
          darkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`flex items-center gap-3 p-2 md:p-3 rounded-lg mt-2 ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg ${
              darkMode ? 'bg-blue-600' : 'bg-blue-500'
            } text-white flex-shrink-0`}>
              <i className={`${currentPageInfo.icon} text-sm md:text-base`}></i>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className={`text-sm md:text-base font-semibold truncate ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {currentPageInfo.title}
              </h2>
              <p className={`text-xs md:text-sm truncate ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {currentPageInfo.description}
              </p>
            </div>
            
            {/* Enhanced Status Badge with User Role - Now shows full role name */}
            <div className="flex items-center gap-2">
              {userRoleInfo && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${userRoleInfo.bg} ${userRoleInfo.color}`}>
                  <i className={`${userRoleInfo.icon} text-xs`}></i>
                  <span>{userRoleInfo.text}</span> {/* This now shows full role name */}
                </div>
              )}
              
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                <i className="fas fa-dot-circle text-xs"></i>
                <span>Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
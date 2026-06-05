import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '../../actions/modalActions';
const Sidebar = ({ setActivePage }) => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector(state => state.ui);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [collapsed, setCollapsed] = useState(true);
  const [expandedDropdowns, setExpandedDropdowns] = useState({});
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [showChildMenu, setShowChildMenu] = useState(false);
  const [currentSubMenu, setCurrentSubMenu] = useState(null);
  const [currentChildMenu, setCurrentChildMenu] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [childPopupPosition, setChildPopupPosition] = useState({ top: 0, left: 0 });
  const [userType, setUserType] = useState('A');
  const buttonRefs = useRef({});
  const sidebarRef = useRef(null);
  useEffect(() => {
    if (user && user.userType) {
      setUserType(user.userType);
      return;
    }
    
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserType(parsedUser.userType || 'A');
      } catch (error) {
        setUserType('A');
      }
    }
  }, [user, isAuthenticated]);
  const handleModalOpen = (modalType) => {
    if (!isAuthenticated && modalType !== 'LOGIN') {
      dispatch(openModal('LOGIN'));
      return;
    }
    dispatch(openModal(modalType));
  };
  const handleButtonClick = (button, event) => {
    if (['POS', 'USER_ACCESS', 'SUPPLIER', 'PURCHASE_ORDER', 'CUSTOMER','HISTORY','ADD_PRODUCT','PRINT_INVOICE','RETURNS','SETTINGS','HELP','INVOICE_RETURN', 'REPORTS'].includes(button.id)) {
      setActivePage(button.id);
      setShowSubMenu(false);
      setShowChildMenu(false);
      setCurrentSubMenu(null);
      setCurrentChildMenu(null);
    } else if (button.hasDropdown) {
      if (collapsed) { 
        const buttonRect = event.currentTarget.getBoundingClientRect();
        setPopupPosition({
          top: buttonRect.top,
          left: buttonRect.right + 10
        });
        setShowSubMenu(true);
        setCurrentSubMenu(button);
      } else { 
        setExpandedDropdowns(prev => ({
          ...prev,
          [button.id]: !prev[button.id]
        }));
      }
    } else {
      handleModalOpen(button.id);
      setShowSubMenu(false);
      setShowChildMenu(false);
      setCurrentSubMenu(null);
      setCurrentChildMenu(null);
    }
  };
  const handleSubItemClick = (parentId, subItem) => {
    if (subItem.type === 'modal') {
      handleModalOpen(subItem.id);
    } else {
      setActivePage(`${parentId}_${subItem.id}`);
    }
    setShowSubMenu(false);
    setShowChildMenu(false);
    setCurrentSubMenu(null);
    setCurrentChildMenu(null);
  };
  const handleChildItemClick = (parentId, childItem, event) => {
    if (childItem.hasSubDropdown) {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setChildPopupPosition({
        top: buttonRect.top,
        left: buttonRect.right + 10
      });
      setShowChildMenu(true);
      setCurrentChildMenu(childItem);
    } else {
      handleSubItemClick(parentId, childItem);
    }
  };
  const toggleDropdown = (buttonId) => {
    setExpandedDropdowns(prev => ({
      ...prev,
      [buttonId]: !prev[buttonId]
    }));
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSubMenu && !event.target.closest('.submenu-popup') && !event.target.closest('.sidebar-button')) {
        setShowSubMenu(false);
        setCurrentSubMenu(null);
      }
      if (showChildMenu && !event.target.closest('.childmenu-popup') && !event.target.closest('.submenu-item')) {
        setShowChildMenu(false);
        setCurrentChildMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSubMenu, showChildMenu]);
  const getSubItemColor = (parentId, level = 1) => {
    const colorMap = {
      'INVENTORY': {
        level1: 'bg-blue-500 hover:bg-blue-600',
        level2: 'bg-blue-400 hover:bg-blue-500'
      },
      'REPORTS': {
        level1: 'bg-purple-500 hover:bg-purple-600',
        level2: 'bg-purple-400 hover:bg-purple-500'
      },
      'default': {
        level1: 'bg-gray-500 hover:bg-gray-600',
        level2: 'bg-gray-400 hover:bg-gray-500'
      }
    };
    
    const colors = colorMap[parentId] || colorMap.default;
    return level === 1 ? colors.level1 : colors.level2;
  };
  const allSidebarButtons = [
    { id: 'POS', icon: 'fas fa-cash-register', label: 'POS Billing', color: 'bg-indigo-600 hover:bg-indigo-700' },
    { id: 'ADD_PRODUCT', icon: 'fas fa-tshirt', label: 'Products & Cat.', color: 'bg-teal-600 hover:bg-teal-700' },
    { id: 'HISTORY', icon: 'fas fa-history', label: 'Transactions', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'RETURNS', icon: 'fas fa-undo', label: 'Returns', color: 'bg-rose-600 hover:bg-rose-700' },
    { id: 'REPORTS', icon: 'fas fa-chart-pie', label: 'Reports', color: 'bg-purple-600 hover:bg-purple-700' },
    { id: 'USER_ACCESS', icon: 'fas fa-user-shield', label: 'User Access', color: 'bg-gray-800 hover:bg-gray-900' }
  ];
  const getFilteredSidebarButtons = () => {
    if (userType === 'A') { 
      return allSidebarButtons;
    } else if (userType === 'C') { 
      return allSidebarButtons.filter(button => 
        ['POS', 'HISTORY', 'RETURNS', 'REPORTS'].includes(button.id)
      );
    } else { 
      return allSidebarButtons;
    }
  };
  const sidebarButtons = getFilteredSidebarButtons();
  const renderSubItems = (parentButton, subItems, level = 1) => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {subItems.map((subItem) => (
          <div key={`${parentButton.id}_${subItem.id}`} className="relative">
            <button
              onClick={(e) => {
                if (subItem.hasSubDropdown) {
                  const buttonRect = e.currentTarget.getBoundingClientRect();
                  setChildPopupPosition({
                    top: buttonRect.top,
                    left: buttonRect.right + 10
                  });
                  setShowChildMenu(true);
                  setCurrentChildMenu(subItem);
                } else {
                  handleSubItemClick(parentButton.id, subItem);
                }
              }}
              className={`w-full aspect-square flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all submenu-item ${
                getSubItemColor(parentButton.id, level)
              } text-white shadow-sm hover:shadow-md`}
            >
              {subItem.icon && <i className={`${subItem.icon} mb-1 text-sm`}></i>}
              <span className="text-center text-xs leading-tight font-medium">{subItem.label}</span>
              {subItem.hasSubDropdown && (
                <i className="fas fa-chevron-right absolute top-1 right-1 text-xs"></i>
              )}
            </button>
          </div>
        ))}
      </div>
    );
  };
  const renderPopupSubMenu = () => {
    if (!showSubMenu || !currentSubMenu) return null;
    return (
      <div 
        className={`fixed submenu-popup p-3 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto custom-scrollbar backdrop-blur-sm ${
          darkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
        }`}
        style={{
          top: `${popupPosition.top}px`,
          left: `${popupPosition.left}px`,
          transform: 'translateY(-10%)',
          minWidth: '180px',
          maxWidth: '180px'
        }}
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300 dark:border-gray-700">
          <h3 className={`text-sm font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <i className={`${currentSubMenu.icon} mr-2`}></i>
            {currentSubMenu.label}
          </h3>
          <button
            onClick={() => {
              setShowSubMenu(false);
              setCurrentSubMenu(null);
            }}
            className={`p-1 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {currentSubMenu.subItems.map((subItem) => (
            <div key={`${currentSubMenu.id}_${subItem.id}`} className="relative">
              <button
                onClick={(e) => handleChildItemClick(currentSubMenu.id, subItem, e)}
                className={`w-full aspect-square flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all submenu-item ${
                  getSubItemColor(currentSubMenu.id, 1)
                } text-white shadow-sm hover:shadow-md`}
              >
                {subItem.icon && <i className={`${subItem.icon} mb-1 text-sm`}></i>}
                <span className="text-center text-xs leading-tight font-medium">{subItem.label}</span>
                {subItem.hasSubDropdown && (
                  <i className="fas fa-chevron-right absolute top-1 right-1 text-xs"></i>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderChildPopupMenu = () => {
    if (!showChildMenu || !currentChildMenu) return null;
    return (
      <div 
        className={`fixed childmenu-popup p-3 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto custom-scrollbar backdrop-blur-sm ${
          darkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
        }`}
        style={{
          top: `${childPopupPosition.top}px`,
          left: `${childPopupPosition.left}px`,
          transform: 'translateY(-10%)',
          minWidth: '180px',
          maxWidth: '180px'
        }}
      >
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-300 dark:border-gray-700">
          <h3 className={`text-sm font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <i className={`${currentChildMenu.icon} mr-2`}></i>
            {currentChildMenu.label}
          </h3>
          <button
            onClick={() => {
              setShowChildMenu(false);
              setCurrentChildMenu(null);
            }}
            className={`p-1 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {currentChildMenu.subItems.map((childItem) => (
            <button
              key={`${currentChildMenu.id}_${childItem.id}`}
              onClick={() => handleSubItemClick(currentChildMenu.id, childItem)}
              className={`w-full aspect-square flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all ${
                getSubItemColor('INVENTORY', 2)
              } text-white shadow-sm hover:shadow-md`}
            >
              {childItem.icon && <i className={`${childItem.icon} mb-1 text-sm`}></i>}
              <span className="text-center text-xs leading-tight font-medium">{childItem.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="relative flex h-full" ref={sidebarRef}>
      {/* Sidebar Container */}
      <div className={`flex flex-col gap-2 p-3 h-full transition-all duration-300 ${
        collapsed 
          ? 'w-20' 
          : 'w-64'
      } ${
        darkMode 
          ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
          : 'bg-gradient-to-b from-white to-gray-50 border-r border-gray-200'
      }`}>
        
        {/* Toggle Button */}
        <button
          onClick={() => {
            setCollapsed(!collapsed);
            setShowSubMenu(false);
            setShowChildMenu(false);
            setCurrentSubMenu(null);
            setCurrentChildMenu(null);
            setExpandedDropdowns({});
          }}
          className={`flex items-center justify-center p-3 rounded-xl sidebar-button transition-all duration-300 mb-2 ${
            darkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <i className={`fas fa-bars text-sm transition-transform duration-300 ${
            collapsed ? '' : 'rotate-90'
          }`}></i>
        </button>
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div className="flex flex-col gap-2">
            {sidebarButtons.map(button => (
              <div key={button.id} className="relative">
                {collapsed ? (
                  // Collapsed view - square icon button
                  <button
                    ref={el => buttonRefs.current[button.id] = el}
                    onClick={(e) => handleButtonClick(button, e)}
                    className={`flex items-center justify-center p-3 rounded-xl text-white transition-all duration-300 sidebar-button ${button.color} hover:shadow-lg w-full aspect-square relative`}
                    title={button.label}
                  >
                    <i className={`${button.icon} text-sm`}></i>
                    {button.hasDropdown && (
                      <i className="fas fa-chevron-down text-xs absolute bottom-1 right-1 opacity-80"></i>
                    )}
                  </button>
                ) : (
                  // Expanded view
                  <div className="relative">
                    <button
                      onClick={(e) => handleButtonClick(button, e)}
                      className={`flex items-center justify-between p-3 rounded-xl text-white transition-all duration-300 ${button.color} hover:shadow-lg w-full`}
                    >
                      <div className="flex items-center">
                        <i className={`${button.icon} mr-3 text-sm`}></i>
                        <span className="text-sm font-semibold whitespace-nowrap">{button.label}</span>
                      </div>
                      {button.hasDropdown && (
                        <i className={`fas fa-chevron-${expandedDropdowns[button.id] ? 'up' : 'down'} text-xs transition-transform duration-300`}></i>
                      )}
                    </button>
                    
                    {/* Dropdown items - only show in expanded view */}
                    {button.hasDropdown && expandedDropdowns[button.id] && (
                      <div className="mt-2 p-2 rounded-lg bg-black/10 backdrop-blur-sm">
                        {renderSubItems(button, button.subItems)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Popup submenu for collapsed sidebar */}
      {renderPopupSubMenu()}
      
      {/* Popup child menu for submenu items */}
      {renderChildPopupMenu()}
      {/* Custom Scrollbar Styles */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { 
            width: 4px; 
          }
          .custom-scrollbar::-webkit-scrollbar-track { 
            background: ${darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.5)'}; 
            border-radius: 10px; 
          }
          .custom-scrollbar::-webkit-scrollbar-thumb { 
            background: ${darkMode ? 'rgba(156, 163, 175, 0.6)' : 'rgba(156, 163, 175, 0.6)'}; 
            border-radius: 10px; 
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
            background: ${darkMode ? 'rgba(156, 163, 175, 0.8)' : 'rgba(107, 114, 128, 0.8)'}; 
          }
        `}
      </style>
    </div>
  );
};
export default Sidebar;

























// import React, { useState, useRef, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { openModal } from '../../actions/modalActions';
// const Sidebar = ({ setActivePage }) => {
//   const dispatch = useDispatch();
//   const { darkMode } = useSelector(state => state.ui);
//   const { isAuthenticated, user } = useSelector(state => state.auth);
//   const [collapsed, setCollapsed] = useState(true);
//   const [expandedDropdowns, setExpandedDropdowns] = useState({});
//   const [showSubMenu, setShowSubMenu] = useState(false);
//   const [showChildMenu, setShowChildMenu] = useState(false);
//   const [currentSubMenu, setCurrentSubMenu] = useState(null);
//   const [currentChildMenu, setCurrentChildMenu] = useState(null);
//   const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
//   const [childPopupPosition, setChildPopupPosition] = useState({ top: 0, left: 0 });
//   const [userType, setUserType] = useState('A'); 
//   const buttonRefs = useRef({});
   
//   useEffect(() => {
     
//     if (user && user.userType) {
//       setUserType(user.userType);
//       return;
//     }
    
     
//     const userData = localStorage.getItem('user');
//     if (userData) {
//       try {
//         const parsedUser = JSON.parse(userData);
//         setUserType(parsedUser.userType || 'A');
//       } catch (error) {
//         setUserType('A');
//       }
//     }
//   }, [user, isAuthenticated]); 
//   const handleModalOpen = (modalType) => {
//     if (!isAuthenticated && modalType !== 'LOGIN') {
//       dispatch(openModal('LOGIN'));
//       return;
//     }
//     dispatch(openModal(modalType));
//   };
//   const handleButtonClick = (button, event) => {
//     if (['POS', 'USER_ACCESS', 'SUPPLIER', 'CUSTOMER','HISTORY','ADD_PRODUCT','PRINT_INVOICE','RETURNS','SETTINGS','HELP'].includes(button.id)) {
//       setActivePage(button.id);
//       setShowSubMenu(false);
//       setShowChildMenu(false);
//       setCurrentSubMenu(null);
//       setCurrentChildMenu(null);
//     } else if (button.hasDropdown) {
//       if (collapsed) {
//         const buttonRect = event.currentTarget.getBoundingClientRect();
//         setPopupPosition({
//           top: buttonRect.top,
//           left: buttonRect.right + 10
//         });
//         setShowSubMenu(true);
//         setCurrentSubMenu(button);
//         setExpandedDropdowns(prev => ({
//           ...prev,
//           [button.id]: true
//         }));
//       } else {
//         setExpandedDropdowns(prev => ({
//           ...prev,
//           [button.id]: !prev[button.id]
//         }));
//       }
//     } else {
//       handleModalOpen(button.id);
//       setShowSubMenu(false);
//       setShowChildMenu(false);
//       setCurrentSubMenu(null);
//       setCurrentChildMenu(null);
//     }
//     if (!collapsed && !button.hasDropdown) setCollapsed(true);
//   };
//   const handleSubItemClick = (parentId, subItem) => {
//     if (subItem.type === 'modal') {
//       handleModalOpen(subItem.id);
//     } else {
//       setActivePage(`${parentId}_${subItem.id}`);
//     }
//     setShowSubMenu(false);
//     setShowChildMenu(false);
//     setCurrentSubMenu(null);
//     setCurrentChildMenu(null);
//     if (!collapsed) setCollapsed(true);
//   };
//   const handleChildItemClick = (parentId, childItem, event) => {
//     if (childItem.hasSubDropdown) {
//       const buttonRect = event.currentTarget.getBoundingClientRect();
//       setChildPopupPosition({
//         top: buttonRect.top,
//         left: buttonRect.right + 10
//       });
//       setShowChildMenu(true);
//       setCurrentChildMenu(childItem);
//     } else {
//       handleSubItemClick(parentId, childItem);
//     }
//   };
//   const toggleDropdown = (buttonId) => {
//     setExpandedDropdowns(prev => ({
//       ...prev,
//       [buttonId]: !prev[buttonId]
//     }));
//   };
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (showSubMenu && !event.target.closest('.submenu-popup') && !event.target.closest('.sidebar-button')) {
//         setShowSubMenu(false);
//         setCurrentSubMenu(null);
//       }
//       if (showChildMenu && !event.target.closest('.childmenu-popup') && !event.target.closest('.submenu-item')) {
//         setShowChildMenu(false);
//         setCurrentChildMenu(null);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showSubMenu, showChildMenu]); 
//   const getSubItemColor = (parentId, level = 1) => {
//     const colorMap = {
//       'INVENTORY': {
//         level1: 'bg-blue-500 hover:bg-blue-600',
//         level2: 'bg-blue-400 hover:bg-blue-500'
//       },
//       'REPORTS': {
//         level1: 'bg-purple-500 hover:bg-purple-600',
//         level2: 'bg-purple-400 hover:bg-purple-500'
//       },
//       'default': {
//         level1: 'bg-gray-500 hover:bg-gray-600',
//         level2: 'bg-gray-400 hover:bg-gray-500'
//       }
//     };
    
//     const colors = colorMap[parentId] || colorMap.default;
//     return level === 1 ? colors.level1 : colors.level2;
//   }; 
//   const allSidebarButtons = [
//     { id: 'POS', icon: 'fas fa-cash-register', label: 'POS', color: 'bg-green-500' },
//     //----------------------------------Inventory------------------------------
//     { 
//       id: 'INVENTORY', 
//       icon: 'fas fa-boxes', 
//       label: 'Inventory', 
//       color: 'bg-blue-500',
//       hasDropdown: true,
//       subItems: [ 
//         { id: 'DASHBOARD', label: 'Dashboad', type: 'page', icon: 'fas fa-tags' },
//         { id: 'CATEGORY', label: 'Category', type: 'page', icon: 'fas fa-tags' },
//         { id: 'WAREHOUSE', label: 'Warehouse', type: 'page', icon: 'fas fa-warehouse' },
//          { id: 'PRODUCT', 

//           label: 'Product', 
//           type: 'page', 
//           icon: 'fas fa-box', 
//           hasSubDropdown: true,
//                   subItems: [    
//                       { id: 'PRODUCT_DETAILS', label: 'Product Catalogue', type: 'page', icon: 'fas fa-info-circle' },
//                       { id: 'PRODUCT_BRAND', label: 'Product Brand', type: 'page', icon: 'fas fa-tags' },
//                       { id: 'PRODUCT_BATCHES', label: 'Product Batches', type: 'page', icon: 'fas fa-layer-group' },
//                       { id: 'UNIT', label: 'Unit', type: 'page', icon: 'fa-solid fa-ruler-vertical' }
//                   ]
//                 },
        
//         { id: 'BINCARD', label: 'BinCard', type: 'page', icon: 'fas fa-clipboard-list' },
//         {
//           id: 'STORE_TRANSACTION',
//           label: 'Store Transaction',
//           icon: 'fas fa-exchange-alt',
//           hasSubDropdown: true,
//           subItems: [
//             { id: 'PURCHASE_ITEM', label: 'Purchase Item (GRN)', type: 'page', icon: 'fas fa-shopping-cart' },
//             // { id: 'SALES_INVOICE', label: 'Sales Invoice (MRQ)', type: 'page', icon: 'fas fa-file-invoice-dollar' },
//             { id: 'PURCHASE_RETURN', label: 'Purchase Return (PRN)', type: 'page', icon: 'fas fa-undo' },
//             { id: 'SALES_RETURN', label: 'Sales Return (MRN)', type: 'page', icon: 'fas fa-undo-alt' },
//             { id: 'STOCK_ADJUSTMENT', label: 'Stock Adjustment', type: 'page', icon: 'fas fa-sliders-h' },
//             // { id: 'WRITE_OFF', label: 'Write Off', type: 'page', icon: 'fas fa-times-circle' },
            
//           ]
//         },
        
//         { id: 'BARCODE', label: 'Barcode', type: 'page', icon: 'fas fa-barcode' },
//         // { id: 'BAR_CODE', label: 'Bar Code Genaration', type: 'page', icon: 'fas fa-barcode' },
//       ]  
//     },
//     { id: 'SUPPLIER', icon: 'fas fa-truck', label: 'Supplier', color: 'bg-amber-500' },
//     { id: 'CUSTOMER', icon: 'fas fa-users', label: 'Customer Management', color: 'bg-yellow-600' },
    
//     { 
//       id: 'REPORTS', 
//       icon: 'fas fa-chart-bar', 
//       label: 'Reports', 
//       color: 'bg-purple-500',
//       hasDropdown: true,
//       subItems: [
//         { id: 'REORDER_LEVEL', label: 'Re-order Level', type: 'page', icon: 'fas fa-chart-line' },
//         { id: 'DAILY_SUMMARY', label: 'Daily Summary', type: 'page', icon: 'fas fa-calendar-day' },
//         { id: 'TOTAL_PURCHASING', label: 'Total Purchasing', type: 'page', icon: 'fas fa-shopping-basket' }
//       ]
//     },
     
//     // { id: 'HISTORY', icon: 'fas fa-history', label: 'History', color: 'bg-orange-500' },
//     // { id: 'PRINT_INVOICE', icon: 'fas fa-receipt', label: 'Print Invoice', color: 'bg-pink-500' },
//     { id: 'RETURNS', icon: 'fas fa-undo', label: 'Returns', color: 'bg-red-500' },
//     // { id: 'COUPON', icon: 'fas fa-tags', label: 'Coupons', color: 'bg-teal-500' }, 
//     // { id: 'ADD_PRODUCT', icon: 'fas fa-plus', label: 'Add Products', color: 'bg-indigo-500' },
//     { id: 'USER_ACCESS', icon: 'fas fa-user-shield', label: 'User Access', color: 'bg-gray-900' },
//     { id: 'SETTINGS', icon: 'fas fa-cog', label: 'Settings', color: 'bg-gray-600' },
//     // { id: 'HELP', icon: 'fas fa-question-circle', label: 'Help', color: 'bg-indigo-500' },
//   ]; 
//   const getFilteredSidebarButtons = () => {
//     if (userType === 'A') { 
//       return allSidebarButtons;
//     } else if (userType === 'C') { 
//       return allSidebarButtons.filter(button => 
//         ['POS', 'CUSTOMER', 'REPORTS', 'HELP', 'HISTORY', 'RETURNS', 'COUPON', 'ADD_PRODUCT'].includes(button.id)
//       );
//     } else { 
//       return allSidebarButtons;
//     }
//   };
//   const sidebarButtons = getFilteredSidebarButtons();
//   const renderSubItems = (parentButton, subItems, level = 1) => {
//     return (
//       <div className="grid grid-cols-2 gap-1.5 mt-1.5">
//         {subItems.map((subItem) => (
//           <div key={`${parentButton.id}_${subItem.id}`} className="relative">
//             <button
//               onClick={(e) => {
//                 if (subItem.hasSubDropdown && collapsed) {
//                   const buttonRect = e.currentTarget.getBoundingClientRect();
//                   setChildPopupPosition({
//                     top: buttonRect.top,
//                     left: buttonRect.right + 10
//                   });
//                   setShowChildMenu(true);
//                   setCurrentChildMenu(subItem);
//                 } else if (subItem.hasSubDropdown) {
//                   toggleDropdown(`${parentButton.id}_${subItem.id}`);
//                 } else {
//                   handleSubItemClick(parentButton.id, subItem);
//                 }
//               }}
//               className={`w-full aspect-square flex flex-col items-center justify-center p-1.5 rounded-md text-xs transition-all submenu-item ${
//                 getSubItemColor(parentButton.id, 1)
//               } text-white`}
//             >
//               {subItem.icon && <i className={`${subItem.icon} mb-1 text-sm`}></i>}
//               <span className="text-center text-xs leading-tight">{subItem.label}</span>
//               {subItem.hasSubDropdown && (
//                 <i className="fas fa-caret-right absolute top-1 right-1 text-2xs"></i>
//               )}
//             </button>
            
//             {/* For expanded sidebar view */}
//             {!collapsed && subItem.hasSubDropdown && expandedDropdowns[`${parentButton.id}_${subItem.id}`] && subItem.subItems && (
//               <div className="absolute left-full top-0 ml-1.5 p-1.5 rounded-md shadow-lg z-10"
//                 style={{ 
//                   width: '144px',
//                   backgroundColor: darkMode ? '#374151' : '#F3F4F6'
//                 }}>
//                 <div className="grid grid-cols-2 gap-1.5">
//                   {subItem.subItems.map((nestedItem) => (
//                     <button
//                       key={`${parentButton.id}_${subItem.id}_${nestedItem.id}`}
//                       onClick={() => handleSubItemClick(`${parentButton.id}_${subItem.id}`, nestedItem)}
//                       className={`w-full aspect-square flex flex-col items-center justify-center p-1 rounded-md text-xs transition-all ${getSubItemColor(parentButton.id, 2)} text-white`}
//                     >
//                       {nestedItem.icon && <i className={`${nestedItem.icon} mb-0.5 text-xs`}></i>}
//                       <span className="text-center text-2xs leading-tight">{nestedItem.label}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };
//   const renderPopupSubMenu = () => {
//     if (!showSubMenu || !currentSubMenu) return null;
//     return (
//       <div 
//         className={`fixed submenu-popup p-2 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto custom-scrollbar ${
//           darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
//         }`}
//         style={{
//           top: `${popupPosition.top}px`,
//           left: `${popupPosition.left}px`,
//           transform: 'translateY(-10%)',
//           width: '160px',
//           maxWidth: '160px'
//         }}
//       >
//         <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-300 dark:border-gray-700">
//           <h3 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
//             <i className={`${currentSubMenu.icon} mr-1`}></i>
//             {currentSubMenu.label}
//           </h3>
//           <button
//             onClick={() => {
//               setShowSubMenu(false);
//               setCurrentSubMenu(null);
//             }}
//             className={`p-0.5 rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
//           >
//             <i className="fas fa-times text-xs"></i>
//           </button>
//         </div>
        
//         <div className="grid grid-cols-2 gap-1.5">
//           {currentSubMenu.subItems.map((subItem) => (
//             <div key={`${currentSubMenu.id}_${subItem.id}`} className="relative">
//               <button
//                 onClick={(e) => handleChildItemClick(currentSubMenu.id, subItem, e)}
//                 className={`w-full aspect-square flex flex-col items-center justify-center p-1 rounded-md text-xs transition-all submenu-item ${
//                   getSubItemColor(currentSubMenu.id, 1)
//                 } text-white`}
//               >
//                 {subItem.icon && <i className={`${subItem.icon} mb-0.5 text-xs`}></i>}
//                 <span className="text-center text-2xs leading-tight">{subItem.label}</span>
//                 {subItem.hasSubDropdown && (
//                   <i className="fas fa-caret-right absolute top-0.5 right-0.5 text-2xs"></i>
//                 )}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };
//   const renderChildPopupMenu = () => {
//     if (!showChildMenu || !currentChildMenu) return null;
//     return (
//       <div 
//         className={`fixed childmenu-popup p-2 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto custom-scrollbar ${
//           darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
//         }`}
//         style={{
//           top: `${childPopupPosition.top}px`,
//           left: `${childPopupPosition.left}px`,
//           transform: 'translateY(-10%)',
//           width: '160px',
//           maxWidth: '160px'
//         }}
//       >
//         <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-300 dark:border-gray-700">
//           <h3 className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
//             <i className={`${currentChildMenu.icon} mr-1`}></i>
//             {currentChildMenu.label}
//           </h3>
//           <button
//             onClick={() => {
//               setShowChildMenu(false);
//               setCurrentChildMenu(null);
//             }}
//             className={`p-0.5 rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
//           >
//             <i className="fas fa-times text-xs"></i>
//           </button>
//         </div>
        
//         <div className="grid grid-cols-2 gap-1.5">
//           {currentChildMenu.subItems.map((childItem) => (
//             <button
//               key={`${currentChildMenu.id}_${childItem.id}`}
//               onClick={() => handleSubItemClick(currentChildMenu.id, childItem)}
//               className={`w-full aspect-square flex flex-col items-center justify-center p-1 rounded-md text-xs transition-all ${
//                 getSubItemColor('INVENTORY', 2)  
//               } text-white`}
//             >
//               {childItem.icon && <i className={`${childItem.icon} mb-0.5 text-xs`}></i>}
//               <span className="text-center text-2xs leading-tight">{childItem.label}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     );
//   };
//   return (
//     <div className="relative flex h-full">
//       {/* Sidebar Container */}
//       <div className={`flex flex-col gap-1.5 p-1.5 h-full transition-all ${
//         collapsed 
//           ? 'w-14' 
//           : 'w-52'
//       } ${
//         darkMode ? 'bg-gray-800' : 'bg-white'
//       }`}>
        
//         {/* Toggle Button */}
//         <button
//           onClick={() => {
//             setCollapsed(!collapsed);
//             setShowSubMenu(false);
//             setShowChildMenu(false);
//             setCurrentSubMenu(null);
//             setCurrentChildMenu(null);
//           }}
//           className={`flex items-center justify-center p-1.5 rounded-md sidebar-button ${
//             darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//           } mb-1 transition-all`}
//         >
//           <i className={`fas fa-bars text-xs ${collapsed ? '' : 'rotate-90'} transition-transform`}></i>
//         </button>
//         {/* Sidebar Content */}
//         <div className="grid grid-cols-1 gap-1.5 overflow-y-auto custom-scrollbar pr-0.5">
//           {sidebarButtons.map(button => (
//             <div key={button.id} className="relative">
//               {collapsed ? (
//                 // Collapsed view - square icon button
//                 <button
//                   ref={el => buttonRefs.current[button.id] = el}
//                   onClick={(e) => handleButtonClick(button, e)}
//                   className={`flex items-center justify-center p-1.5 rounded-md text-white transition-all hover:shadow-sm sidebar-button ${button.color} hover:opacity-90 w-full aspect-square`}
//                   title={button.label}
//                 >
//                   <i className={`${button.icon} text-xs`}></i>
//                   {button.hasDropdown && (
//                     <i className="fas fa-caret-right text-2xs absolute top-0.5 right-0.5"></i>
//                   )}
//                 </button>
//               ) : (
                 
//                 <div>
//                   <button
//                     onClick={() => handleButtonClick(button)}
//                     className={`flex items-center justify-between p-1.5 rounded-md text-white transition-all hover:shadow-sm ${button.color} hover:opacity-90 w-full`}
//                   >
//                     <div className="flex items-center">
//                       <i className={`${button.icon} mr-1.5 text-xs`}></i>
//                       <span className="text-xs font-medium whitespace-nowrap">{button.label}</span>
//                     </div>
//                     {button.hasDropdown && (
//                       <i className={`fas fa-chevron-${expandedDropdowns[button.id] ? 'up' : 'down'} text-2xs`}></i>
//                     )}
//                   </button>
                  
//                   {/* Dropdown items - only show in expanded view */}
//                   {button.hasDropdown && expandedDropdowns[button.id] && (
//                     <div className="mt-1.5">
//                       {renderSubItems(button, button.subItems)}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//       {/* Popup submenu for collapsed sidebar */}
//       {renderPopupSubMenu()}
      
//       {/* Popup child menu for submenu items */}
//       {renderChildPopupMenu()}
//       {/* Custom Scrollbar */}
//       <style>
//         {`
//           .custom-scrollbar::-webkit-scrollbar { width: 3px; }
//           .custom-scrollbar::-webkit-scrollbar-track { background: ${darkMode ? '#374151' : '#F3F4F6'}; border-radius: 1px; }
//           .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? '#6B7280' : '#9CA3AF'}; border-radius: 1px; }
//           .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${darkMode ? '#9CA3AF' : '#6B7280'}; }
//         `}
//       </style>
//     </div>
//   );
// };
// export default Sidebar;

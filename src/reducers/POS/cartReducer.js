// import {
//   ADD_TO_CART,
//   REMOVE_FROM_CART,
//   UPDATE_QUANTITY,
//   CLEAR_CART,
//   APPLY_DISCOUNT,
//   ADD_TAB,
//   REMOVE_TAB,
//   SWITCH_TAB,
//   RENAME_TAB,
//   SET_SALE_ID,
//   CLEAR_SALE_ID,
//   ADD_TO_CART_REQUEST,
//   ADD_TO_CART_SUCCESS,
//   ADD_TO_CART_FAILURE,
//   UPDATE_CART_QUANTITY_REQUEST,
//   UPDATE_CART_QUANTITY_SUCCESS,
//   UPDATE_CART_QUANTITY_FAILURE,
//   REMOVE_FROM_CART_REQUEST,
//   REMOVE_FROM_CART_SUCCESS,
//   REMOVE_FROM_CART_FAILURE,
//   SYNC_CART_WITH_SERVER_REQUEST,
//   SYNC_CART_WITH_SERVER_SUCCESS,
//   SYNC_CART_WITH_SERVER_FAILURE,
//    RESUME_SALE_REQUEST,
//   RESUME_SALE_SUCCESS,
//   RESUME_SALE_FAILURE,
  
// } from '../../constants/POS/cartConstants';

// const initialState = {
//   tabs: [
//     {
//       id: 1,
//       name: 'Tab 1',
//       items: [],
//       discount: 0,
//       discountType: 'percentage',
//       saleId: null
//     }
//   ],
//   activeTabId: 1,
//   loading: false,
//   error: null,
//   syncLoading: false,
//   syncError: null,
//   holdLoading: false,
//   holdError: null,
//   resumeLoading: false,   
//   resumeError: null,   
// };

// export const cartReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case RESUME_SALE_REQUEST:
//       return {
//         ...state,
//         resumeLoading: true,
//         resumeError: null
//       };

//     case RESUME_SALE_SUCCESS:
//       return {
//         ...state,
//         resumeLoading: false,
//         resumeError: null
//       };

//     case RESUME_SALE_FAILURE:
//       return {
//         ...state,
//         resumeLoading: false,
//         resumeError: action.payload
//       };
//      case HOLD_SALE_REQUEST:
//       return {
//         ...state,
//         holdLoading: true,
//         holdError: null
//       };

//     case HOLD_SALE_SUCCESS:
//       return {
//         ...state,
//         holdLoading: false,
//         holdError: null
//       };

//     case HOLD_SALE_FAILURE:
//       return {
//         ...state,
//         holdLoading: false,
//         holdError: action.payload
//       };

//     case SET_HOLD_STATUS:
//       return {
//         ...state,
//         tabs: state.tabs.map(tab =>
//           tab.id === state.activeTabId
//             ? { ...tab, isOnHold: action.payload }
//             : tab
//         )
//       };



//     case ADD_TO_CART_REQUEST:
//     case UPDATE_CART_QUANTITY_REQUEST:
//     case REMOVE_FROM_CART_REQUEST:
//       return {
//         ...state,
//         loading: true,
//         error: null
//       };

//     case SYNC_CART_WITH_SERVER_REQUEST:
//       return {
//         ...state,
//         syncLoading: true,
//         syncError: null
//       };

//     case ADD_TO_CART_SUCCESS:
//     case UPDATE_CART_QUANTITY_SUCCESS:
//     case REMOVE_FROM_CART_SUCCESS:
//       return {
//         ...state,
//         loading: false,
//         error: null
//       };

//     case SYNC_CART_WITH_SERVER_SUCCESS:
//       return {
//         ...state,
//         syncLoading: false,
//         syncError: null
//       };

//     case ADD_TO_CART_FAILURE:
//     case UPDATE_CART_QUANTITY_FAILURE:
//     case REMOVE_FROM_CART_FAILURE:
//       return {
//         ...state,
//         loading: false,
//         error: action.payload
//       };

//     case SYNC_CART_WITH_SERVER_FAILURE:
//       return {
//         ...state,
//         syncLoading: false,
//         syncError: action.payload
//       };

//     case ADD_TO_CART:
//       const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
//       const existingItem = activeTab.items.find(item => item.id === action.payload.id);

//       if (existingItem) {
//         // Item exists, increment quantity
//         const updatedItems = activeTab.items.map(item =>
//           item.id === action.payload.id
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );

//         const updatedTabs = state.tabs.map(tab =>
//           tab.id === state.activeTabId
//             ? { ...tab, items: updatedItems }
//             : tab
//         );

//         return {
//           ...state,
//           tabs: updatedTabs
//         };
//       } else {
//         // New item, add to cart
//         const newItem = {
//           ...action.payload,
//           quantity: 1
//         };

//         const updatedTabs = state.tabs.map(tab =>
//           tab.id === state.activeTabId
//             ? { ...tab, items: [...tab.items, newItem] }
//             : tab
//         );

//         return {
//           ...state,
//           tabs: updatedTabs
//         };
//       }

//     case REMOVE_FROM_CART:
//       const tabAfterRemove = state.tabs.find(tab => tab.id === state.activeTabId);
//       const filteredItems = tabAfterRemove.items.filter(item => item.id !== action.payload);

//       const updatedTabsAfterRemove = state.tabs.map(tab =>
//         tab.id === state.activeTabId
//           ? { ...tab, items: filteredItems }
//           : tab
//       );

//       return {
//         ...state,
//         tabs: updatedTabsAfterRemove
//       };

//     case UPDATE_QUANTITY:
//       const { id, quantity } = action.payload;
//       const tabForUpdate = state.tabs.find(tab => tab.id === state.activeTabId);

//       const updatedItems = tabForUpdate.items.map(item =>
//         item.id === id
//           ? { ...item, quantity: Math.max(0, quantity) }
//           : item
//       ).filter(item => item.quantity > 0); // Remove items with quantity 0

//       const updatedTabsAfterQuantity = state.tabs.map(tab =>
//         tab.id === state.activeTabId
//           ? { ...tab, items: updatedItems }
//           : tab
//       );

//       return {
//         ...state,
//         tabs: updatedTabsAfterQuantity
//       };

//     case CLEAR_CART:
//       const clearedTabs = state.tabs.map(tab =>
//         tab.id === state.activeTabId
//           ? { ...tab, items: [], discount: 0, saleId: null }
//           : tab
//       );

//       return {
//         ...state,
//         tabs: clearedTabs
//       };

//     case APPLY_DISCOUNT:
//       const { amount, type } = action.payload;
//       const tabsWithDiscount = state.tabs.map(tab =>
//         tab.id === state.activeTabId
//           ? { ...tab, discount: amount, discountType: type }
//           : tab
//       );

//       return {
//         ...state,
//         tabs: tabsWithDiscount
//       };

//     case ADD_TAB:
//       const newTabId = Math.max(...state.tabs.map(tab => tab.id), 0) + 1;
//       const newTab = {
//         id: newTabId,
//         name: `Tab ${newTabId}`,
//         items: [],
//         discount: 0,
//         discountType: 'percentage',
//         saleId: null
//       };

//       return {
//         ...state,
//         tabs: [...state.tabs, newTab],
//         activeTabId: newTabId
//       };

//     case REMOVE_TAB:
//       if (state.tabs.length <= 1) return state;

//       const filteredTabs = state.tabs.filter(tab => tab.id !== action.payload);
//       const newActiveTabId = filteredTabs[0].id;

//       return {
//         ...state,
//         tabs: filteredTabs,
//         activeTabId: newActiveTabId
//       };

//     case SWITCH_TAB:
//       return {
//         ...state,
//         activeTabId: action.payload
//       };

//     case RENAME_TAB:
//       const { tabId, newName } = action.payload;
//       const renamedTabs = state.tabs.map(tab =>
//         tab.id === tabId
//           ? { ...tab, name: newName }
//           : tab
//       );

//       return {
//         ...state,
//         tabs: renamedTabs
//       };
// case SET_SALE_ID:
//   const tabsWithSaleId = state.tabs.map(tab =>
//     tab.id === state.activeTabId
//       ? { ...tab, saleId: action.payload }
//       : tab
//   );

//   return {
//     ...state,
//     tabs: tabsWithSaleId
//   };

// case CLEAR_SALE_ID:
//   const tabsWithoutSaleId = state.tabs.map(tab =>
//     tab.id === state.activeTabId
//       ? { ...tab, saleId: null }
//       : tab
//   );

//   return {
//     ...state,
//     tabs: tabsWithoutSaleId
//   };

//     default:
//       return state;
//   }
// };




 import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_QUANTITY,
  CLEAR_CART,
  APPLY_DISCOUNT,
  ADD_TAB,
  REMOVE_TAB,
  SWITCH_TAB,
  RENAME_TAB,
  SET_SALE_ID,
  CLEAR_SALE_ID,
  ADD_TO_CART_REQUEST,
  ADD_TO_CART_SUCCESS,
  ADD_TO_CART_FAILURE,
  UPDATE_CART_QUANTITY_REQUEST,
  UPDATE_CART_QUANTITY_SUCCESS,
  UPDATE_CART_QUANTITY_FAILURE,
  REMOVE_FROM_CART_REQUEST,
  REMOVE_FROM_CART_SUCCESS,
  REMOVE_FROM_CART_FAILURE,
  SYNC_CART_WITH_SERVER_REQUEST,
  SYNC_CART_WITH_SERVER_SUCCESS,
  SYNC_CART_WITH_SERVER_FAILURE,
  RESUME_SALE_REQUEST,
  RESUME_SALE_SUCCESS,
  RESUME_SALE_FAILURE,
  HOLD_SALE_REQUEST,
  HOLD_SALE_SUCCESS,
  HOLD_SALE_FAILURE,
  SET_HOLD_STATUS
} from '../../constants/POS/cartConstants';

const initialState = {
  tabs: [
    {
      id: 1,
      name: 'Tab 1',
      items: [],
      discount: 0,
      discountType: 'percentage',
      saleId: null,
      isHeld: false
    }
  ],
  activeTabId: 1,
  loading: false,
  error: null,
  syncLoading: false,
  syncError: null,
  holdLoading: false,
  holdError: null,
  resumeLoading: false,   
  resumeError: null,   
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {


    
    case RESUME_SALE_REQUEST:
      return {
        ...state,
        resumeLoading: true,
        resumeError: null
      };

    case RESUME_SALE_SUCCESS:
      return {
        ...state,
        resumeLoading: false,
        resumeError: null,
        tabs: state.tabs.map(tab =>
          tab.id === state.activeTabId
            ? { ...tab, isHeld: false }
            : tab
        )
      };

    case RESUME_SALE_FAILURE:
      return {
        ...state,
        resumeLoading: false,
        resumeError: action.payload
      };

    case HOLD_SALE_REQUEST:
      return {
        ...state,
        holdLoading: true,
        holdError: null
      };

    case HOLD_SALE_SUCCESS:
      return {
        ...state,
        holdLoading: false,
        holdError: null,
        tabs: state.tabs.map(tab =>
          tab.id === state.activeTabId
            ? { ...tab, isHeld: true, items: [] }
            : tab
        )
      };

    case HOLD_SALE_FAILURE:
      return {
        ...state,
        holdLoading: false,
        holdError: action.payload
      };

    case SET_HOLD_STATUS:
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === state.activeTabId
            ? { ...tab, isHeld: action.payload }
            : tab
        )
      };

    case ADD_TO_CART_REQUEST:
    case UPDATE_CART_QUANTITY_REQUEST:
    case REMOVE_FROM_CART_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case SYNC_CART_WITH_SERVER_REQUEST:
      return {
        ...state,
        syncLoading: true,
        syncError: null
      };

    case ADD_TO_CART_SUCCESS:
    case UPDATE_CART_QUANTITY_SUCCESS:
    case REMOVE_FROM_CART_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    case SYNC_CART_WITH_SERVER_SUCCESS:
      return {
        ...state,
        syncLoading: false,
        syncError: null
      };

    case ADD_TO_CART_FAILURE:
    case UPDATE_CART_QUANTITY_FAILURE:
    case REMOVE_FROM_CART_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SYNC_CART_WITH_SERVER_FAILURE:
      return {
        ...state,
        syncLoading: false,
        syncError: action.payload
      };

    case ADD_TO_CART:
      const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
      const existingItem = activeTab.items.find(item => item.id === action.payload.id);

      if (existingItem) {
        const updatedItems = activeTab.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );

        const updatedTabs = state.tabs.map(tab =>
          tab.id === state.activeTabId
            ? { ...tab, items: updatedItems }
            : tab
        );

        return {
          ...state,
          tabs: updatedTabs
        };
      } else {
        const newItem = {
          ...action.payload,
          quantity: 1
        };

        const updatedTabs = state.tabs.map(tab =>
          tab.id === state.activeTabId
            ? { ...tab, items: [...tab.items, newItem] }
            : tab
        );

        return {
          ...state,
          tabs: updatedTabs
        };
      }

    case REMOVE_FROM_CART:
      const tabAfterRemove = state.tabs.find(tab => tab.id === state.activeTabId);
      const filteredItems = tabAfterRemove.items.filter(item => item.id !== action.payload);

      const updatedTabsAfterRemove = state.tabs.map(tab =>
        tab.id === state.activeTabId
          ? { ...tab, items: filteredItems }
          : tab
      );

      return {
        ...state,
        tabs: updatedTabsAfterRemove
      };

    case UPDATE_QUANTITY:
      const { id, quantity } = action.payload;
      const tabForUpdate = state.tabs.find(tab => tab.id === state.activeTabId);

      const updatedItems = tabForUpdate.items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ).filter(item => item.quantity > 0);

      const updatedTabsAfterQuantity = state.tabs.map(tab =>
        tab.id === state.activeTabId
          ? { ...tab, items: updatedItems }
          : tab
      );

      return {
        ...state,
        tabs: updatedTabsAfterQuantity
      };

    case CLEAR_CART:
      const clearedTabs = state.tabs.map(tab =>
        tab.id === state.activeTabId
          ? { ...tab, items: [], discount: 0, saleId: null, isHeld: false }
          : tab
      );

      return {
        ...state,
        tabs: clearedTabs
      };

    case APPLY_DISCOUNT:
      const { amount, type } = action.payload;
      const tabsWithDiscount = state.tabs.map(tab =>
        tab.id === state.activeTabId
          ? { ...tab, discount: amount, discountType: type }
          : tab
      );

      return {
        ...state,
        tabs: tabsWithDiscount
      };

    case ADD_TAB:
      const newTabId = Math.max(...state.tabs.map(tab => tab.id), 0) + 1;
      const newTab = {
        id: newTabId,
        name: `Tab ${newTabId}`,
        items: [],
        discount: 0,
        discountType: 'percentage',
        saleId: null,
        isHeld: false
      };

      return {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: newTabId
      };

    case REMOVE_TAB:
      if (state.tabs.length <= 1) return state;

      const filteredTabs = state.tabs.filter(tab => tab.id !== action.payload);
      const newActiveTabId = filteredTabs[0].id;

      return {
        ...state,
        tabs: filteredTabs,
        activeTabId: newActiveTabId
      };

    case SWITCH_TAB:
      return {
        ...state,
        activeTabId: action.payload
      };

    case RENAME_TAB:
      const { tabId, newName } = action.payload;
      const renamedTabs = state.tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, name: newName }
          : tab
      );

      return {
        ...state,
        tabs: renamedTabs
      };

    case SET_SALE_ID:
      const tabsWithSaleId = state.tabs.map(tab =>
        tab.id === state.activeTabId
          ? { ...tab, saleId: action.payload }
          : tab
      );

      return {
        ...state,
        tabs: tabsWithSaleId
      };

    case CLEAR_SALE_ID:
      const tabsWithoutSaleId = state.tabs.map(tab =>
        tab.id === state.activeTabId
          ? { ...tab, saleId: null }
          : tab
      );

      return {
        ...state,
        tabs: tabsWithoutSaleId
      };

    default:
      return state;
  }
};

export default cartReducer;
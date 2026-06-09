 
// import { 
//   ADD_TO_CART_REQUEST,
//   ADD_TO_CART_SUCCESS,
//   ADD_TO_CART_FAILURE,
//   UPDATE_CART_QUANTITY_REQUEST,
//   UPDATE_CART_QUANTITY_SUCCESS,
//   UPDATE_CART_QUANTITY_FAILURE,
//   REMOVE_FROM_CART_REQUEST,
//   REMOVE_FROM_CART_SUCCESS,
//   REMOVE_FROM_CART_FAILURE,
//   SET_SALE_ID,
//   CLEAR_SALE_ID,
//   SYNC_CART_WITH_SERVER_REQUEST,
//   SYNC_CART_WITH_SERVER_SUCCESS,
//   SYNC_CART_WITH_SERVER_FAILURE,
//   ADD_TO_CART,
//   REMOVE_FROM_CART,
//   UPDATE_QUANTITY,
//   CLEAR_CART,
//   APPLY_DISCOUNT,
//   ADD_TAB,
//   REMOVE_TAB,
//   SWITCH_TAB,
//   RENAME_TAB,
//   SET_HOLD_STATUS,
//   HOLD_SALE_FAILURE,
//   HOLD_SALE_SUCCESS,
//   HOLD_SALE_REQUEST,
//   RESUME_SALE_SUCCESS,
//   RESUME_SALE_FAILURE,
//   RESUME_SALE_REQUEST
// } from '../../constants/POS/cartConstants';
// import { cartService } from '../../services/POS/cartService';

// // Helper function to show alerts
// const showAlertMessage = (message, type = 'success') => {
//   // This should be replaced with your actual alert system

// };

// const getWarehouseCode = (products, productId) => {
//   const product = products.find(p => p.id === productId);
//   return product ? product.WHCODE || '' : ''; 
// };

// export const addToCart = (product) => (dispatch, getState) => {
//   const { products } = getState();
//   const productData = products.allProducts.find(p => p.id === product.id);
  
//   if (productData && productData.stock > 0) {
//     dispatch({
//       type: ADD_TO_CART,
//       payload: product
//     });
    
//     dispatch(syncCartWithServer());
//   }
// };

// export const removeFromCart = (id) => (dispatch, getState) => {
//   dispatch({
//     type: REMOVE_FROM_CART,
//     payload: id
//   });
  
//   dispatch(syncCartWithServer());
// };

// export const updateQuantity = (id, quantity) => (dispatch, getState) => {
//   dispatch({
//     type: UPDATE_QUANTITY,
//     payload: { id, quantity }
//   });
  
//   dispatch(syncCartWithServer());
// };

// export const syncCartWithServer = () => async (dispatch, getState) => {
//   dispatch({ type: SYNC_CART_WITH_SERVER_REQUEST });
  
//   try {
//     const { cart, products } = getState();
//     const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
//     const { items, saleId } = activeTab;
    
//     const sessionId = cartService.getSessionId(products.allProducts);
    
//     const syncPromises = items.map(async (item) => { 

//       const cartData = {
//         sessionId,
//         warehouseCode: products.Whcode,
//         productCode: item.id,
//         saleId: saleId || null,
//         quantity: item.quantity
//       };
      
//       const response = await cartService.addToCart(cartData);
      
//       if (response.ResultSet && response.ResultSet.SALEID && !saleId) {
//         dispatch(setSaleId(response.ResultSet.SALEID));
//       }
      
//       return response;
//     });
    
//     await Promise.all(syncPromises);
    
//     dispatch({ type: SYNC_CART_WITH_SERVER_SUCCESS });
//   } catch (error) {
//     dispatch({
//       type: SYNC_CART_WITH_SERVER_FAILURE,
//       payload: error.message
//     });

//   }
// };

// export const addToCartWithSync = (product) => async (dispatch, getState) => {
//   dispatch({ type: ADD_TO_CART_REQUEST });
  
//   try {
//     const { products, cart } = getState();
//     const productData = products.allProducts.find(p => p.id === product.id);
    
//     if (productData && productData.stock > 0) {
//       dispatch({
//         type: ADD_TO_CART,
//         payload: product
//       });
      
//       const sessionId = cartService.getSessionId(products.allProducts); 
//       const cartData = {
//         sessionId,
//         warehouseCode: product.Whcode,
//         productCode: product.id,
//         quantity: 1
//       };
      
//       const response = await cartService.addToCart(cartData);
      
//       if (response.ResultSet && response.ResultSet.Sale_ID) {
//         const currentSaleId = cartService.getSaleId();
//         if (currentSaleId !== response.ResultSet.Sale_ID) {
//           dispatch(setSaleId(response.ResultSet.Sale_ID));
//         }
//       }
      
//       dispatch({ type: ADD_TO_CART_SUCCESS });
//     }
//   } catch (error) {
//     dispatch({
//       type: ADD_TO_CART_FAILURE,
//       payload: error.message
//     });

//   }
// };

// export const updateQuantityWithSync = (id, quantity) => async (dispatch, getState) => {
//   dispatch({ type: UPDATE_CART_QUANTITY_REQUEST });
  
//   try {
//     const { products, cart } = getState();
//     const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
//     const currentItem = activeTab.items.find(item => item.id === id);
    
//     if (!currentItem) {
//       throw new Error('Item not found in cart');
//     }
     
//     dispatch({
//       type: UPDATE_QUANTITY,
//       payload: { id, quantity }
//     });
    
//     const sessionId = cartService.getSessionId(products.allProducts); 
//     const saleId = activeTab.saleId || cartService.getSaleId();
    
//     if (!saleId) {
//       throw new Error('Sale ID not found for quantity update');
//     }
     
//     const removeData = {
//       sessionId,
//       productCode: id,
//       saleId: saleId
//     };
     
//     for (let i = 0; i < currentItem.quantity; i++) {
//       await cartService.removeFromCart(removeData);
//     }
     
//     if (quantity > 0) {
//       const cartData = {
//         sessionId,
//         warehouseCode: products.Whcode,
//         productCode: id,
//         saleId: saleId,
//         quantity: quantity
//       };
      
//       await cartService.addToCart(cartData);
//     }
    
//     dispatch({ type: UPDATE_CART_QUANTITY_SUCCESS });
//   } catch (error) {
//     dispatch({
//       type: UPDATE_CART_QUANTITY_FAILURE,
//       payload: error.message
//     });
 
     
//     const { cart } = getState();
//     const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
//     const originalItem = activeTab.items.find(item => item.id === id);
//     if (originalItem) {
//       dispatch({
//         type: UPDATE_QUANTITY,
//         payload: { id, quantity: originalItem.quantity }
//       });
//     }
//   }
// };

// export const removeFromCartWithSync = (id) => async (dispatch, getState) => {
//   dispatch({ type: REMOVE_FROM_CART_REQUEST });
  
//   try {
//     const { products, cart } = getState();
    
//     dispatch({
//       type: REMOVE_FROM_CART,
//       payload: id
//     });
    
//     const sessionId = cartService.getSessionId(products.allProducts);
//     const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
//     const saleId = activeTab.saleId || cartService.getSaleId();
    
//     if (!saleId) {
//       throw new Error('Sale ID not found for removal');
//     }
    
//     const removeData = {
//       sessionId,
//       productCode: id,
//       saleId: saleId
//     };
    
//     await cartService.removeFromCart(removeData);
    
//     dispatch({ type: REMOVE_FROM_CART_SUCCESS });
//   } catch (error) {
//     dispatch({
//       type: REMOVE_FROM_CART_FAILURE,
//       payload: error.message
//     });
 
    
//     dispatch({
//       type: ADD_TO_CART,
//       payload: getState().products.allProducts.find(p => p.id === id)
//     });
//   }
// };

// export const setSaleId = (saleId) => ({
//   type: SET_SALE_ID,
//   payload: saleId
// });

// export const clearSaleId = () => ({
//   type: CLEAR_SALE_ID
// });

// export const clearCart = () => (dispatch) => {
//   cartService.clearSaleId();
//   dispatch({ type: CLEAR_CART });
//   dispatch(clearSaleId());
// };

// export const applyDiscount = (amount, type) => ({
//   type: APPLY_DISCOUNT,
//   payload: { amount, type }
// });

// export const addTab = () => ({
//   type: ADD_TAB
// });

// export const removeTab = (tabId) => ({
//   type: REMOVE_TAB,
//   payload: tabId
// });

// export const switchTab = (tabId) => ({
//   type: SWITCH_TAB,
//   payload: tabId
// });

// export const renameTab = (tabId, newName) => ({
//   type: RENAME_TAB,
//   payload: { tabId, newName }
// });

// export const applyProductDiscount = (itemId, discountType) => ({
//   type: 'APPLY_PRODUCT_DISCOUNT',
//   payload: { itemId, discountType }
// });

// export const clearLocalStorageSaleId = () => {
//   cartService.clearSaleId();
//   return { type: CLEAR_SALE_ID };
// };

// // UPDATED: holdSale action
// export const holdSale = () => async (dispatch, getState) => {
//   dispatch({ type: HOLD_SALE_REQUEST });
  
//   try {
//     const { cart, products } = getState();
//     const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
//     const { items } = activeTab;
    
//     if (items.length === 0) {
//       throw new Error('Cannot hold an empty cart');
//     }
 
//     let saleId = activeTab.saleId || cartService.getSaleId();
     
//     if (!saleId) {
 
//       await dispatch(syncCartWithServer());
       
//       const updatedState = getState();
//       const updatedActiveTab = updatedState.cart.tabs.find(tab => tab.id === updatedState.cart.activeTabId);
//       saleId = updatedActiveTab.saleId || cartService.getSaleId();
      
//       if (!saleId) {
//         throw new Error('Failed to create sale ID. Please try again.');
//       }
//     }

//     const sessionId = cartService.getSessionId(products.allProducts);
    
 
     
//     await cartService.holdSale(sessionId, saleId);
     
//     const heldSaleId = saleId;
     
//     // Save to held sales BEFORE clearing cart
//     cartService.addToHeldSales(heldSaleId, items, activeTab.name);
     
//     // Clear the sale ID and cart
//     cartService.clearSaleId();
//     dispatch(clearSaleId());
//     dispatch(clearCart()); // This clears the cart from Redux state
    
//     dispatch({ 
//       type: HOLD_SALE_SUCCESS,
//       payload: heldSaleId
//     });
     
//     return { success: true, saleId: heldSaleId };
    
//   } catch (error) {
//     dispatch({
//       type: HOLD_SALE_FAILURE,
//       payload: error.message
//     });
 
//     throw error;
//   }
// };

// // UPDATED: resumeSale action with proper promise handling
// export const resumeSale = (saleId) => async (dispatch, getState) => {
//   dispatch({ type: RESUME_SALE_REQUEST });
  
//   try {
//     const { products, cart } = getState();
    
//     // Get session ID
//     const sessionId = cartService.getSessionId(products.allProducts);
    

    
//     // First, get the held items from the API
//     const holdListResponse = await cartService.getHoldList(sessionId, saleId);
    
//     if (!holdListResponse.ResultSet || holdListResponse.ResultSet.length === 0) {
//       throw new Error('No held items found for this sale');
//     }



//     // Then call the resume API

//     await cartService.resumeSale(sessionId, saleId);
    
//     // Clear current cart first
//     dispatch(clearCart());
    
//     // Set the sale ID
//     cartService.setSaleId(saleId);
//     dispatch(setSaleId(saleId));
    
//     // Convert API response to cart items and add to cart
//     const heldItems = holdListResponse.ResultSet;
    
//     // Create a map to combine quantities for same products
//     const productMap = new Map();
    
//     heldItems.forEach(item => {
//       const productCode = item.Cart_Procode;
//       const quantity = parseFloat(item.Cart_Qty);
//       const price = parseFloat(item.Cart_UnitPrice);
      
//       if (productMap.has(productCode)) {
//         const existing = productMap.get(productCode);
//         productMap.set(productCode, {
//           ...existing,
//           quantity: existing.quantity + quantity
//         });
//       } else {
//         // Find product details from your products list
//         const productDetails = products.allProducts.find(p => p.id === productCode);
        
//         if (productDetails) {
//           productMap.set(productCode, {
//             id: productCode,
//             name: productDetails.name,
//             price: price,
//             quantity: quantity,
//             stock: productDetails.stock,
//             image: productDetails.image,
//             discountType: null,
//             discountValue: 0
//           });
//         }
//       }
//     });
    
     
//     productMap.forEach(item => {
       
//       for (let i = 0; i < item.quantity; i++) {
//         dispatch({
//           type: ADD_TO_CART,
//           payload: {
//             ...item,
//             quantity: 1  
//           }
//         });
//       }
//     });
    
    
//     cartService.removeFromHeldSales(saleId);
    
     
//     const heldSales = cartService.getHeldSales();
//     const heldSale = heldSales.find(sale => sale.saleId === saleId);
//     if (heldSale) {
//       dispatch(renameTab(getState().cart.activeTabId, `Resumed: ${heldSale.tabName}`));
//     }
    
//     dispatch({ 
//       type: RESUME_SALE_SUCCESS,
//       payload: { saleId, items: Array.from(productMap.values()) }
//     });
    
//     return { success: true, saleId };  
    
//   } catch (error) {
//     dispatch({
//       type: RESUME_SALE_FAILURE,
//       payload: error.message
//     });

//     throw error;  
//   }
// };

// export const getHeldSales = () => {
//   return cartService.getHeldSales();
// };







 
import { 
  ADD_TO_CART_REQUEST,
  ADD_TO_CART_SUCCESS,
  ADD_TO_CART_FAILURE,
  UPDATE_CART_QUANTITY_REQUEST,
  UPDATE_CART_QUANTITY_SUCCESS,
  UPDATE_CART_QUANTITY_FAILURE,
  REMOVE_FROM_CART_REQUEST,
  REMOVE_FROM_CART_SUCCESS,
  REMOVE_FROM_CART_FAILURE,
  SET_SALE_ID,
  CLEAR_SALE_ID,
  SYNC_CART_WITH_SERVER_REQUEST,
  SYNC_CART_WITH_SERVER_SUCCESS,
  SYNC_CART_WITH_SERVER_FAILURE,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  UPDATE_QUANTITY,
  CLEAR_CART,
  APPLY_DISCOUNT,
  ADD_TAB,
  REMOVE_TAB,
  SWITCH_TAB,
  RENAME_TAB,
  SET_HOLD_STATUS,
  HOLD_SALE_FAILURE,
  HOLD_SALE_SUCCESS,
  HOLD_SALE_REQUEST,
  RESUME_SALE_SUCCESS,
  RESUME_SALE_FAILURE,
  RESUME_SALE_REQUEST
} from '../../constants/POS/cartConstants';
import { cartService } from '../../services/POS/cartService';

const showAlertMessage = (message, type = 'success') => {

};

export const addToCart = (product) => (dispatch, getState) => {
  const { products } = getState();
  const productData = products.allProducts.find(p => p.id === product.id);
  
  if (productData && productData.stock > 0) {
    dispatch({
      type: ADD_TO_CART,
      payload: product
    });
    
    dispatch(syncCartWithServer());
  }
};

export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: REMOVE_FROM_CART,
    payload: id
  });
  dispatch(syncCartWithServer());
};

export const updateQuantity = (id, quantity) => (dispatch, getState) => {
  dispatch({
    type: UPDATE_QUANTITY,
    payload: { id, quantity }
  });
  
  dispatch(syncCartWithServer());
};

export const syncCartWithServer = () => async (dispatch, getState) => {
  dispatch({ type: SYNC_CART_WITH_SERVER_REQUEST });
  
  try {
    const { cart, products } = getState();
    const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
    const { items, saleId } = activeTab;
    
    const sessionId = cartService.getSessionId(products.allProducts);

    const syncPromises = items.map(async (item) => { 
      const cartData = {
        sessionId,
        warehouseCode: item.Whcode || products.Whcode,
        productCode: item.productId || item.id,
        batchId: item.batchId,
        saleId: saleId || null,
        quantity: item.quantity
      };
      
      const response = await cartService.addToCart(cartData);
      
      if (response.ResultSet && response.ResultSet.SALEID && !saleId) {
        dispatch(setSaleId(response.ResultSet.SALEID));
      }
      
      return response;
    });
    
    await Promise.all(syncPromises);
    
    dispatch({ type: SYNC_CART_WITH_SERVER_SUCCESS });
  } catch (error) {
    dispatch({
      type: SYNC_CART_WITH_SERVER_FAILURE,
      payload: error.message
    });
 
  }
};

export const addToCartWithSync = (product) => async (dispatch, getState) => {
  dispatch({ type: ADD_TO_CART_REQUEST });
  try {
    const { products, cart } = getState();
     
    const productData = product;
    
    if (productData && productData.stock > 0) {
      dispatch({
        type: ADD_TO_CART,
        payload: productData
      });
      
      const sessionId = cartService.getSessionId(products.allProducts); 
      const cartData = {
        sessionId,
        warehouseCode: productData.Whcode,
        productCode: productData.productId || productData.id,
        batchId: productData.batchId,
        quantity: 1
      };
      
      const response = await cartService.addToCart(cartData);
      
      if (response.ResultSet && response.ResultSet.Sale_ID) {
        const currentSaleId = cartService.getSaleId();
        if (currentSaleId !== response.ResultSet.Sale_ID) {
          dispatch(setSaleId(response.ResultSet.Sale_ID));
        }
      }
      
      dispatch({ type: ADD_TO_CART_SUCCESS });
    }
  } catch (error) {
    dispatch({
      type: ADD_TO_CART_FAILURE,
      payload: error.message
    });

  }
};

export const updateQuantityWithSync = (id, quantity) => async (dispatch, getState) => {
  dispatch({ type: UPDATE_CART_QUANTITY_REQUEST });
  
  try {
    const { products, cart } = getState();
    const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
    const currentItem = activeTab.items.find(item => item.id === id);
    
    if (!currentItem) {
      throw new Error('Item not found in cart');
    }
     
    dispatch({
      type: UPDATE_QUANTITY,
      payload: { id, quantity }
    });

    // If this item came from a hold session, update it via the Hold API
    if (currentItem.holdId) {
      try {
        const { holdService } = await import('../../services/POS/holdService');
        await holdService.updateHoldItem({
          holdId: currentItem.holdId,
          qty: quantity,
          unitPrice: currentItem.discountedPrice || currentItem.price || 0
        });
      } catch (holdErr) {
        console.warn('UpdateHoldItem API failed (continuing):', holdErr);
      }
    } else {
      // Normal (non-hold) cart item: use the regular cart sync
      const sessionId = cartService.getSessionId(products.allProducts); 
      const saleId = activeTab.saleId || cartService.getSaleId();
      
      if (saleId) {
        const removeData = {
          sessionId,
          productCode: currentItem.productId || id,
          batchId: currentItem.batchId,
          saleId: saleId
        }; 
        for (let i = 0; i < currentItem.quantity; i++) {
          await cartService.removeFromCart(removeData);
        }
        if (quantity > 0) {
          const cartData = {
            sessionId,
            warehouseCode: currentItem.Whcode,
            productCode: currentItem.productId || id,
            batchId: currentItem.batchId,
            saleId: saleId,
            quantity: quantity
          };
          await cartService.addToCart(cartData);
        }
      }
    }
    
    dispatch({ type: UPDATE_CART_QUANTITY_SUCCESS });
  } catch (error) {
    dispatch({
      type: UPDATE_CART_QUANTITY_FAILURE,
      payload: error.message
    });

    const { cart } = getState();
    const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
    const originalItem = activeTab.items.find(item => item.id === id);
    if (originalItem) {
      dispatch({
        type: UPDATE_QUANTITY,
        payload: { id, quantity: originalItem.quantity }
      });
    }
  }
};

export const removeFromCartWithSync = (id) => async (dispatch, getState) => {
  dispatch({ type: REMOVE_FROM_CART_REQUEST });
  
  try {
    const { products, cart } = getState();
    const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
    const itemToRemove = activeTab.items.find(item => item.id === id);
    
    if (!itemToRemove) {
      throw new Error('Item not found in cart');
    }
    
    dispatch({
      type: REMOVE_FROM_CART,
      payload: id
    });

    // If this item came from a hold session, soft-delete it via Hold API
    if (itemToRemove.holdId) {
      try {
        const { holdService } = await import('../../services/POS/holdService');
        await holdService.softDeleteHoldItem(itemToRemove.holdId);
      } catch (holdErr) {
        console.warn('SoftDeleteHoldItem API failed (continuing):', holdErr);
      }
    } else {
      // Normal cart item: use regular remove
      const sessionId = cartService.getSessionId(products.allProducts);
      const saleId = activeTab.saleId || cartService.getSaleId();
      if (saleId) {
        const removeData = {
          sessionId,
          productCode: itemToRemove.productId || id,
          batchId: itemToRemove.batchId,
          saleId: saleId
        };
        await cartService.removeFromCart(removeData);
      }
    }
    
    dispatch({ type: REMOVE_FROM_CART_SUCCESS });
  } catch (error) {
    dispatch({
      type: REMOVE_FROM_CART_FAILURE,
      payload: error.message
    });

    const product = getState().products.allProducts.find(p => p.id === id);
    if (product) {
      dispatch({
        type: ADD_TO_CART,
        payload: product
      });
    }
  }
};


export const setSaleId = (saleId) => ({
  type: SET_SALE_ID,
  payload: saleId
});

export const clearSaleId = () => ({
  type: CLEAR_SALE_ID
});

export const clearCart = () => (dispatch) => {
  cartService.clearSaleId();
  dispatch({ type: CLEAR_CART });
  dispatch(clearSaleId());
};

export const applyDiscount = (amount, type) => ({
  type: APPLY_DISCOUNT,
  payload: { amount, type }
});

export const addTab = () => ({
  type: ADD_TAB
});

export const removeTab = (tabId) => ({
  type: REMOVE_TAB,
  payload: tabId
});

export const switchTab = (tabId) => ({
  type: SWITCH_TAB,
  payload: tabId
});

export const renameTab = (tabId, newName) => ({
  type: RENAME_TAB,
  payload: { tabId, newName }
});

export const applyProductDiscount = (itemId, discountType) => ({
  type: 'APPLY_PRODUCT_DISCOUNT',
  payload: { itemId, discountType }
});

export const clearLocalStorageSaleId = () => {
  cartService.clearSaleId();
  return { type: CLEAR_SALE_ID };
};

 
export const holdSale = () => async (dispatch, getState) => {
  dispatch({ type: HOLD_SALE_REQUEST });
  
  try {
    const { cart, products } = getState();
    const activeTab = cart.tabs.find(tab => tab.id === cart.activeTabId) || cart.tabs[0];
    const { items } = activeTab;
    
    if (items.length === 0) {
      throw new Error('Cannot hold an empty cart');
    }
 
    let saleId = activeTab.saleId || cartService.getSaleId();
     
    if (!saleId) {
      await dispatch(syncCartWithServer());
       
      const updatedState = getState();
      const updatedActiveTab = updatedState.cart.tabs.find(tab => tab.id === updatedState.cart.activeTabId);
      saleId = updatedActiveTab.saleId || cartService.getSaleId();
      
      if (!saleId) {
        throw new Error('Failed to create sale ID. Please try again.');
      }
    }

    const sessionId = cartService.getSessionId(products.allProducts);

    // Send items to Hold API (cartService forwards to holdService)
    const holdResult = await cartService.holdSale(sessionId, saleId, items);
     
    const heldSaleId = saleId;
    
    // Also persist to localStorage for offline/hybrid support
    const heldSale = cartService.addToHeldSales(heldSaleId, items, activeTab.name);
    
    // Store the API session ID on the held sale for later resume
    if (holdResult.sessionId) {
      const heldSales = cartService.getHeldSales();
      const idx = heldSales.findIndex(s => s.saleId === heldSaleId);
      if (idx !== -1) {
        heldSales[idx].holdSessionId = holdResult.sessionId;
        localStorage.setItem('heldSales', JSON.stringify(heldSales));
      }
    }
     
    cartService.clearSaleId();
    dispatch(clearSaleId());
    dispatch(clearCart());
    
    dispatch({ 
      type: HOLD_SALE_SUCCESS,
      payload: heldSaleId
    });
     
    return { success: true, saleId: heldSaleId };
    
  } catch (error) {
    dispatch({
      type: HOLD_SALE_FAILURE,
      payload: error.message
    });

    throw error;
  }
};

export const resumeSale = (saleId) => async (dispatch, getState) => {
  dispatch({ type: RESUME_SALE_REQUEST });
  
  try {
    const { products } = getState();
    
    // First, try to find the held sale from the API
    let heldSales = await dispatch(fetchHeldSales());
    let heldSale = heldSales && heldSales.find(sale => sale.saleId === saleId);
    
    // Fallback to local storage if not found in API
    if (!heldSale) {
      const localHeldSales = cartService.getHeldSales();
      heldSale = localHeldSales.find(sale => sale.saleId === saleId);
    }
    
    if (!heldSale || !heldSale.items || heldSale.items.length === 0) {
      throw new Error('No held items found for this sale');
    }

    // Release the hold on the API side
    if (heldSale.holdSessionId || heldSale.saleId) {
      try {
        const { holdService } = await import('../../services/POS/holdService');
        await holdService.releaseHold(heldSale.holdSessionId || heldSale.saleId);
      } catch (releaseErr) {
        console.warn("Failed to release hold via API (continuing with local resume):", releaseErr);
      }
    } else {
      const sessionId = cartService.getSessionId(products.allProducts);
      await cartService.resumeSale(sessionId, saleId);
    }
    
    dispatch(clearCart());
    
    cartService.setSaleId(saleId);
    dispatch(setSaleId(saleId));
    
    heldSale.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        dispatch({
          type: ADD_TO_CART,
          payload: {
            ...item,
            quantity: 1  
          }
        });
      }
    });
    
    dispatch(renameTab(getState().cart.activeTabId, `Resumed: ${heldSale.tabName}`));
    
    cartService.removeFromHeldSales(saleId);
    
    dispatch({ 
      type: RESUME_SALE_SUCCESS,
      payload: { saleId, items: heldSale.items }
    });
    
    return { success: true, saleId };  
    
  } catch (error) {
    dispatch({
      type: RESUME_SALE_FAILURE,
      payload: error.message
    });

    throw error;  
  }
};

export const fetchHeldSales = () => async (dispatch, getState) => {
  try {
    const { holdService } = await import('../../services/POS/holdService');
    const { products } = getState();
    
    // Fetch from backend API
    const activeHolds = await holdService.getAllActiveHolds();
    
    if (!activeHolds || !Array.isArray(activeHolds) || activeHolds.length === 0) {
      return cartService.getHeldSales(); // fallback to local storage
    }

    // Group items by SessionId
    const grouped = {};
    activeHolds.forEach(h => {
      const sid = h.SessionId || h.sessionId;
      if (!sid) return;
      if (!grouped[sid]) {
        grouped[sid] = {
          saleId: sid,
          items: [],
          tabName: `Held Sale (${sid.substring(0, 6)})`,
          heldAt: h.CreatedAt || h.createdAt || new Date().toISOString(),
          holdSessionId: sid
        };
      }
      
      const productCode = h.ProductId || h.productId;
      const productDetails = products.allProducts.find(p => p.id === productCode || p.productId === productCode);
      
      grouped[sid].items.push({
        id: productCode,
        productId: productCode,
        name: productDetails ? productDetails.name : `Product ${productCode}`,
        price: h.UnitPrice || h.unitPrice || (productDetails ? productDetails.price : 0),
        discountedPrice: h.UnitPrice || h.unitPrice || (productDetails ? productDetails.price : 0),
        quantity: Number(h.Qty || h.qty || 1),
        stock: productDetails ? productDetails.stock : 99,
        image: productDetails ? productDetails.image : null,
        discountType: null,
        discountValue: 0,
        holdId: h.HoldId || h.holdId
      });
    });
    
    const backendSales = Object.values(grouped);
    return backendSales;
  } catch (error) {
    console.error("Failed to fetch held sales from API", error);
    return cartService.getHeldSales();
  }
};

export const getHeldSales = () => {
  return cartService.getHeldSales();
};
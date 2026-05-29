import React, { createContext, useContext, useReducer } from 'react';
import cartReducer from '../reducers/POS/cartReducer';

const CartContext = createContext();

const initialState = {
  tabs: [
    {
      id: 'tab-1',
      name: 'Current Sale 1',
      items: [],
      discount: 0,
      discountType: 'percent',
      active: true
    }
  ],
  activeTabId: 'tab-1',
  nextTabNumber: 2
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
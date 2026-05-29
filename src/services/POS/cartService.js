import axios from "axios";
import { API_URL } from "../../config";

export const cartService = {
  getSessionId: () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.LogId; 
  },

  getSaleId: () => {
    return localStorage.getItem('saleId');
  },

  setSaleId: (saleId) => {
    localStorage.setItem('saleId', saleId);
  },

  clearSaleId: () => {
    localStorage.removeItem('saleId');
  },

  addToCart: async (cartData) => {
    // New backend doesn't have an AddCart API (uses Bills upon checkout). 
    // We simulate a successful backend response to keep the frontend working locally.
    const saleId = cartService.getSaleId() || `SALE-${Date.now()}`;
    if (!cartService.getSaleId()) {
      cartService.setSaleId(saleId);
    }
    return {
      StatusCode: 200,
      Result: "Success",
      ResultSet: { Sale_ID: saleId }
    };
  },

  removeFromCart: async (removeData) => {
    return { StatusCode: 200, Result: "Success" };
  },

  holdSale: async (sessionId, saleId) => {
    return { StatusCode: 200, Result: "Success" };
  },

  resumeSale: async (sessionId, saleId) => {
    return { StatusCode: 200, Result: "Success" };
  },
 
  getHoldList: async (sessionId, saleId) => {
    return { StatusCode: 200, Result: "Success", ResultSet: [] };
  },


  getHeldSales: () => {
    const heldSales = localStorage.getItem('heldSales');
    return heldSales ? JSON.parse(heldSales) : [];
  },

  addToHeldSales: (saleId, items, tabName = 'Held Sale') => {
    const heldSales = cartService.getHeldSales();
    const newHeldSale = {
      saleId,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        discountedPrice: item.discountedPrice,
        quantity: item.quantity,
        stock: item.stock,
        image: item.image,
        discountType: item.discountType,
        discountValue: item.discountValue
      })),
      tabName,
      heldAt: new Date().toISOString()
    };
    
    heldSales.push(newHeldSale);
    localStorage.setItem('heldSales', JSON.stringify(heldSales));
    return newHeldSale;
  },

  removeFromHeldSales: (saleId) => {
    const heldSales = cartService.getHeldSales();
    const updatedHeldSales = heldSales.filter(sale => sale.saleId !== saleId);
    localStorage.setItem('heldSales', JSON.stringify(updatedHeldSales));
    return updatedHeldSales;
  },
};
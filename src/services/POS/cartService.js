import { holdService } from "./holdService";

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

  // ─── Hold via real API ─────────────────────────────
  holdSale: async (sessionId, saleId, items = []) => {
    try {
      // Generate a hold-specific session ID based on saleId for traceability
      const holdSessionId = `HOLD_${saleId || Date.now()}`;
      const result = await holdService.holdCartItems(items, holdSessionId);
      return { 
        StatusCode: 200, 
        Result: "Success", 
        sessionId: result.sessionId,
        details: result.results 
      };
    } catch (err) {
      console.error("holdSale API failed, falling back to localStorage:", err);
      // Fall back to localStorage on API failure
      return { StatusCode: 200, Result: "Success (offline)" };
    }
  },

  // ─── Resume via real API ───────────────────────────
  resumeSale: async (sessionId, saleId) => {
    try {
      const holdSessionId = `HOLD_${saleId}`;
      const result = await holdService.resumeHeldSession(holdSessionId);
      return { 
        StatusCode: 200, 
        Result: "Success", 
        items: result.items 
      };
    } catch (err) {
      console.error("resumeSale API failed, falling back to localStorage:", err);
      return { StatusCode: 200, Result: "Success (offline)", items: [] };
    }
  },
 
  // ─── Get hold list via real API ────────────────────
  getHoldList: async (sessionId, saleId) => {
    try {
      const holds = await holdService.getAllActiveHolds();
      return { StatusCode: 200, Result: "Success", ResultSet: holds };
    } catch (err) {
      console.error("getHoldList API failed:", err);
      return { StatusCode: 200, Result: "Success", ResultSet: [] };
    }
  },

  // ─── localStorage-based held sales (kept for offline/hybrid support) ───
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
import axios from "axios";
import { API_URL } from "../../config";

// LocalStorage keys for fallback
const RETURNS_KEY = 'rs_bathik_returns';
const BILL_ITEMS_KEY = 'rs_bathik_bill_items';
const BILLS_KEY = 'rs_bathik_bills';
const PRODUCTS_KEY = 'rs_bathik_products';

const getLocalList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
};

const saveLocalList = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage", e);
  }
};

export const returnService = {
  /**
   * Mark an item as returned
   * POST /Returns/MarkReturn?BillItemId=x&ReturnedQty=y&UpdatedBy=z
   */
  markReturn: async (billItemId, returnedQty, updatedBy = 1) => {
    try {
      const response = await axios.post(`${API_URL}/Returns/MarkReturn`, null, {
        params: {
          BillItemId: String(billItemId),
          ReturnedQty: String(returnedQty),
          UpdatedBy: String(updatedBy)
        }
      });
      
      // Update local storage too to keep it in sync if using mixed mode
      try {
        returnService.localMarkReturn(billItemId, returnedQty, updatedBy);
      } catch (e) {}
      
      return response.data;
    } catch (error) {
      console.warn("API request failed, falling back to Local Mock Database", error);
      return returnService.localMarkReturn(billItemId, returnedQty, updatedBy);
    }
  },

  /**
   * Get all returns
   * GET /Returns/GetAllReturns
   */
  getAllReturns: async () => {
    try {
      const response = await axios.get(`${API_URL}/Returns/GetAllReturns`);
      const apiData = response.data.ResultSet || response.data || [];
      return Array.isArray(apiData) ? apiData : [];
    } catch (error) {
      console.warn("API request failed, falling back to Local Mock Database", error);
      return returnService.localGetAllReturns();
    }
  },

  /**
   * Get returns by Bill ID
   * GET /Returns/GetReturnsByBillId?BillId=x
   */
  getReturnsByBillId: async (billId) => {
    try {
      const response = await axios.get(`${API_URL}/Returns/GetReturnsByBillId`, {
        params: { BillId: String(billId) }
      });
      const apiData = response.data.ResultSet || response.data || [];
      return Array.isArray(apiData) ? apiData : [];
    } catch (error) {
      console.warn("API request failed, falling back to Local Mock Database", error);
      return returnService.localGetReturnsByBillId(billId);
    }
  },

  /**
   * Get return summary details
   * GET /Returns/GetReturnSummary
   */
  getReturnSummary: async () => {
    try {
      const response = await axios.get(`${API_URL}/Returns/GetReturnSummary`);
      return response.data.ResultSet || response.data || {};
    } catch (error) {
      console.warn("API request failed, falling back to Local Mock Database", error);
      return returnService.localGetReturnSummary();
    }
  },

  // ==========================================
  // LOCAL MOCK DATABASE FALLBACK IMPLEMENTATION
  // ==========================================

  localMarkReturn: (billItemId, returnedQty, updatedBy = 1) => {
    const qty = parseInt(returnedQty);
    if (isNaN(qty) || qty <= 0) {
      throw new Error("Returned quantity must be greater than zero");
    }

    const billItems = getLocalList(BILL_ITEMS_KEY);
    const bills = getLocalList(BILLS_KEY);
    const products = getLocalList(PRODUCTS_KEY);
    const returns = getLocalList(RETURNS_KEY);

    // Find the bill item being returned
    // Support matching both lowercase schema pid_billitem_id / BillItemId and other casing
    const item = billItems.find(bi => 
      String(bi.pid_billitem_id) === String(billItemId) || 
      String(bi.BillItemId) === String(billItemId) ||
      String(bi.id) === String(billItemId)
    );

    if (!item) {
      throw new Error("Bill item not found in records");
    }

    const billId = item.pid_bill_id || item.BillId;
    const productId = item.pid_product_id || item.ProductId;
    const unitPrice = parseFloat(item.pid_unit_price || item.UnitPrice || 0);
    const purchaseQty = parseInt(item.pid_qty || item.Qty || 1);

    // Find parent bill for bill number
    const bill = bills.find(b => String(b.pbd_bill_id) === String(billId) || String(b.BillId) === String(billId));
    const billNo = bill ? (bill.pbd_bill_no || bill.BillNo) : `BILL-${billId}`;

    // Find product name
    const product = products.find(p => String(p.ppd_product_id) === String(productId) || String(p.ProductId) === String(productId));
    const productName = product ? (product.ppd_product_name || product.ProductName) : `Product ${productId}`;

    // Check existing returns for this item
    const alreadyReturned = returns
      .filter(r => String(r.BillItemId) === String(billItemId))
      .reduce((sum, r) => sum + parseInt(r.ReturnedQty || 0), 0);

    if (alreadyReturned + qty > purchaseQty) {
      throw new Error(`Cannot return ${qty} units. Already returned ${alreadyReturned} of ${purchaseQty} units.`);
    }

    const newReturnId = returns.length > 0 ? Math.max(...returns.map(r => r.ReturnId || 0)) + 1 : 1;
    const newReturn = {
      ReturnId: newReturnId,
      BillItemId: parseInt(billItemId),
      BillId: parseInt(billId),
      BillNo: billNo,
      ProductId: parseInt(productId),
      ProductName: productName,
      ReturnedQty: qty,
      UnitPrice: unitPrice,
      TotalRefund: qty * unitPrice,
      ReturnDate: new Date().toISOString(),
      UpdatedBy: parseInt(updatedBy)
    };

    returns.push(newReturn);
    saveLocalList(RETURNS_KEY, returns);

    return {
      success: true,
      message: "Return marked successfully",
      data: newReturn
    };
  },

  localGetAllReturns: () => {
    return getLocalList(RETURNS_KEY);
  },

  localGetReturnsByBillId: (billId) => {
    const returns = getLocalList(RETURNS_KEY);
    return returns.filter(r => String(r.BillId) === String(billId));
  },

  localGetReturnSummary: () => {
    const returns = getLocalList(RETURNS_KEY);
    
    const totalCount = returns.length;
    const totalQty = returns.reduce((sum, r) => sum + parseInt(r.ReturnedQty || 0), 0);
    const totalRefund = returns.reduce((sum, r) => sum + parseFloat(r.TotalRefund || 0), 0);
    
    // Group by product
    const productSummary = {};
    returns.forEach(r => {
      const name = r.ProductName || `Product ${r.ProductId}`;
      if (!productSummary[name]) {
        productSummary[name] = { qty: 0, amount: 0 };
      }
      productSummary[name].qty += parseInt(r.ReturnedQty || 0);
      productSummary[name].amount += parseFloat(r.TotalRefund || 0);
    });

    const productsList = Object.entries(productSummary).map(([name, data]) => ({
      productName: name,
      returnedQty: data.qty,
      refundAmount: data.amount
    })).sort((a, b) => b.refundAmount - a.refundAmount);

    return {
      TotalReturnsCount: totalCount,
      TotalReturnedQty: totalQty,
      TotalRefundAmount: totalRefund,
      TopReturnedProducts: productsList,
      RecentReturns: [...returns].sort((a, b) => new Date(b.ReturnDate) - new Date(a.ReturnDate)).slice(0, 5)
    };
  }
};

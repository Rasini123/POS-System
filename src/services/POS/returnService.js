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
      const returns = Array.isArray(apiData) ? apiData : [];
      
      // Fetch bills to get refund amount for enrichment
      try {
        const billsResponse = await axios.get(`${API_URL}/Bills/GetAllBills`);
        const bills = Array.isArray(billsResponse.data) ? billsResponse.data : (billsResponse.data.ResultSet || []);
        const billMap = {};
        bills.forEach(bill => {
          const billId = bill.pbd_bill_id || bill.BillId;
          billMap[billId] = bill;
        });
        
        // Enrich returns with refund amount from bill
        return returns.map(ret => {
          const bill = billMap[ret.BillId || ret.pbd_bill_id];
          if (bill) {
            // Try multiple field names for the refund/return amount
            const refundAmount = parseFloat(
              bill.pbd_return_amount || 
              bill.return_amount || 
              bill.NetAmount || 
              bill.PaidAmount || 
              bill.TotalAmount || 
              ret.TotalRefund || 
              0
            );
            return {
              ...ret,
              TotalRefund: refundAmount
            };
          }
          return ret;
        });
      } catch (billError) {
        console.warn("Could not fetch bills for enrichment", billError);
        return returns;
      }
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
      const returns = Array.isArray(apiData) ? apiData : [];
      
      // Fetch the bill to get refund amount for enrichment
      try {
        const billResponse = await axios.get(`${API_URL}/Bills/GetBillById`, {
          params: { BillId: String(billId) }
        });
        const bill = billResponse.data || billResponse.data.ResultSet?.[0];
        
        if (bill) {
          // Try multiple field names for the refund/return amount
          const refundAmount = parseFloat(
            bill.pbd_return_amount || 
            bill.return_amount || 
            bill.NetAmount || 
            bill.PaidAmount || 
            bill.TotalAmount || 
            0
          );
          // Apply this amount to all returns or use it directly
          return returns.map(ret => ({
            ...ret,
            TotalRefund: refundAmount
          }));
        }
      } catch (billError) {
        console.warn("Could not fetch bill for enrichment", billError);
      }
      
      return returns;
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
      const summaryData = response.data.ResultSet || response.data || {};
      
      // Ensure proper type conversion for numeric fields
      return {
        TotalReturnsCount: parseInt(summaryData.TotalReturnsCount || 0),
        TotalReturnedQty: parseInt(summaryData.TotalReturnedQty || 0),
        TotalRefundAmount: parseFloat(summaryData.TotalRefundAmount || summaryData.NetAmount || summaryData.PaidAmount || 0),
        TopReturnedProducts: Array.isArray(summaryData.TopReturnedProducts) ? summaryData.TopReturnedProducts : [],
        RecentReturns: Array.isArray(summaryData.RecentReturns) ? summaryData.RecentReturns : []
      };
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
    const returns = getLocalList(RETURNS_KEY);
    const billItems = getLocalList(BILL_ITEMS_KEY);
    const bills = getLocalList(BILLS_KEY);
    
    // Enrich returns with unit price and refund amount
    return returns.map(ret => {
      let totalRefund = ret.TotalRefund || 0;
      let unitPrice = ret.UnitPrice || 0;
      
      // If TotalRefund is 0 or missing, fetch from bill item
      if (!totalRefund || totalRefund === 0) {
        const billItem = billItems.find(bi => 
          String(bi.pid_billitem_id) === String(ret.BillItemId) || 
          String(bi.BillItemId) === String(ret.BillItemId) ||
          String(bi.id) === String(ret.BillItemId)
        );
        
        if (billItem) {
          unitPrice = parseFloat(billItem.pid_unit_price || billItem.UnitPrice || 0);
          totalRefund = (ret.ReturnedQty || 1) * unitPrice;
        }
      }
      
      // Try to get refund amount from bill (multiple field names)
      if ((!totalRefund || totalRefund === 0) && ret.BillId) {
        const bill = bills.find(b => String(b.pbd_bill_id) === String(ret.BillId) || String(b.BillId) === String(ret.BillId));
        if (bill) {
          totalRefund = parseFloat(
            bill.pbd_return_amount || 
            bill.return_amount || 
            bill.NetAmount || 
            bill.PaidAmount || 
            bill.TotalAmount || 
            0
          );
        }
      }
      
      return {
        ...ret,
        UnitPrice: unitPrice,
        TotalRefund: totalRefund
      };
    });
  },

  localGetReturnsByBillId: (billId) => {
    const returns = getLocalList(RETURNS_KEY);
    const billItems = getLocalList(BILL_ITEMS_KEY);
    const bills = getLocalList(BILLS_KEY);
    
    // Enrich returns with unit price and refund amount
    return returns
      .filter(r => String(r.BillId) === String(billId))
      .map(ret => {
        let totalRefund = ret.TotalRefund || 0;
        let unitPrice = ret.UnitPrice || 0;
        
        // If TotalRefund is 0 or missing, fetch from bill item
        if (!totalRefund || totalRefund === 0) {
          const billItem = billItems.find(bi => 
            String(bi.pid_billitem_id) === String(ret.BillItemId) || 
            String(bi.BillItemId) === String(ret.BillItemId) ||
            String(bi.id) === String(ret.BillItemId)
          );
          
          if (billItem) {
            unitPrice = parseFloat(billItem.pid_unit_price || billItem.UnitPrice || 0);
            totalRefund = (ret.ReturnedQty || 1) * unitPrice;
          }
        }
        
        // Try to get refund amount from bill (multiple field names)
        if ((!totalRefund || totalRefund === 0) && ret.BillId) {
          const bill = bills.find(b => String(b.pbd_bill_id) === String(ret.BillId) || String(b.BillId) === String(ret.BillId));
          if (bill) {
            totalRefund = parseFloat(
              bill.pbd_return_amount || 
              bill.return_amount || 
              bill.NetAmount || 
              bill.PaidAmount || 
              bill.TotalAmount || 
              0
            );
          }
        }
        
        return {
          ...ret,
          UnitPrice: unitPrice,
          TotalRefund: totalRefund
        };
      });
  },

  localGetReturnSummary: () => {
    const returns = returnService.localGetAllReturns(); // Use the enriched method
    
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

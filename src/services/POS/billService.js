import axios from "axios";
import { API_URL } from "../../config";

export const billService = {
  getAllBills: async () => {
    const response = await axios.get(`${API_URL}/Bills/GetAllBills`);
    return response.data.ResultSet || [];
  },

  getAllBillItems: async () => {
    const response = await axios.get(`${API_URL}/BillItems/GetAllBillItems`);
    return response.data.ResultSet || response.data || [];
  },

  addBillItem: async (itemData) => {
    const formData = new FormData();
    formData.append("BillId", String(itemData.BillId || ""));
    formData.append("ProductId", String(itemData.ProductId || ""));
    formData.append("Qty", String(itemData.Qty || "1"));
    formData.append("UnitPrice", String(itemData.UnitPrice || "0"));
    formData.append("Total", String(itemData.Total || "0"));
    formData.append("CreatedBy", String(itemData.CreatedBy || "1"));

    const response = await axios.post(`${API_URL}/BillItems/AddBillItemsDetails`, formData);
    return response.data;
  },

  getBillById: async (billId) => {
    const response = await axios.get(`${API_URL}/Bills/GetBillsByBillId`, {
      params: { BillId: String(billId) }
    });
    return Array.isArray(response.data.ResultSet) 
      ? response.data.ResultSet[0] 
      : response.data.ResultSet || response.data.Result || response.data;
  },

  getBillItemById: async (billItemId) => {
    const response = await axios.get(`${API_URL}/BillItems/GetBillItemsByBillItemsId`, {
      params: { BillItemId: String(billItemId) }
    });
    return Array.isArray(response.data.ResultSet) 
      ? response.data.ResultSet[0] 
      : response.data.ResultSet || response.data.Result || response.data;
  },

  addBill: async (billData) => {
    const formData = new FormData();
    formData.append("BillNo", billData.BillNo || "");
    formData.append("BillDate", billData.BillDate || "");
    formData.append("UserId", String(billData.UserId || "1"));
    formData.append("TotalAmount", String(billData.TotalAmount || "0"));
    formData.append("DiscountAmount", String(billData.DiscountAmount || "0"));
    formData.append("NetAmount", String(billData.NetAmount || "0"));
    formData.append("PaymentType", billData.PaymentType || "CASH");
    formData.append("CreatedBy", String(billData.CreatedBy || "1"));
    
    const response = await axios.post(`${API_URL}/Bills/AddBillsDetails`, formData);
    return response.data;
  },

  updateBill: async (billData) => {
    const formData = new FormData();
    formData.append("BillId", String(billData.BillId));
    formData.append("BillNo", billData.BillNo || "");
    formData.append("BillDate", billData.BillDate || "");
    formData.append("UserId", String(billData.UserId || "1"));
    formData.append("TotalAmount", String(billData.TotalAmount || "0"));
    formData.append("DiscountAmount", String(billData.DiscountAmount || "0"));
    formData.append("NetAmount", String(billData.NetAmount || "0"));
    formData.append("PaymentType", billData.PaymentType || "CASH");
    formData.append("CreatedBy", String(billData.CreatedBy || "1"));
    
    const response = await axios.post(`${API_URL}/Bills/PutBillsDetails`, formData);
    return response.data;
  }
};

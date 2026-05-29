// import axios from "axios";
// import { API_URL } from "../../config";

// export const invoiceService = {
//   addInvoice: async () => {
//     const token = localStorage.getItem("token");
//     const saleId = localStorage.getItem("saleId"); 
//     const userData = JSON.parse(localStorage.getItem("user"));
//     const sessionId = userData?.LogId; 

//     try {
//       const url = `${API_URL}/ADDINV/ADDINV?P_SESSIONID=${sessionId}&P_SALEID=${saleId}`;


//       const response = await axios.post(
//         url,
//         {},
//         {
//           headers: {
//             "auth-key": token,  
//           },
//         }
//       );

//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   getInvoiceDetails: async () => {
//     const token = localStorage.getItem("token");
    
//     try {
//       const url = `${API_URL}/Invoice/GetInvoiceDetails`;


//       const response = await axios.get(url, {
//         headers: {
//           "auth-key": token,
//         },
//       });

//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   updateInvoiceDetails: async (formData) => {
//     const token = localStorage.getItem("token");
    
//     try {
//       const url = `${API_URL}/Invoice/UpdateInvoiceDetails`;


//       const response = await axios.post(url, formData, {
//         headers: {
//           "auth-key": token,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   getInvoiceImage: async () => {
//     const token = localStorage.getItem("token");
    
//     try {
//       const url = `${API_URL}/Invoice/INPhotoPrivew`; 

//       const response = await axios.get(url, {
//         headers: {
//           "auth-key": token,
//         },
//         responseType: 'blob', 
//       });

       
//       return new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsDataURL(response.data);
//       });
//     } catch (error) {

//       throw error.response?.data || error.message;
//     }
//   },

  
//   getInvoiceImageBlob: async () => {
//     const token = localStorage.getItem("token");
    
//     try {
//       const url = `${API_URL}/Invoice/INPhotoPrivew`;
//       const response = await axios.get(url, {
//         headers: {
//           "auth-key": token,
//         },
//         responseType: 'blob',
//       });

//       return URL.createObjectURL(response.data);
//     } catch (error) {

//       throw error.response?.data || error.message;
//     }
//   }
// };


import axios from "axios";
import { API_URL } from "../../config";

// export const invoiceService = {
//   addInvoice: async (invoiceData) => {
//     const token = localStorage.getItem("token");
//     const saleId = localStorage.getItem("saleId"); 
//     const userData = JSON.parse(localStorage.getItem("user"));
//     const sessionId = userData?.LogId;

//     // Extract parameters from invoiceData
//     const {
    
//       items = [],
//       subtotal = 0,
//       discount = 0,
//       tax = 0,
//       total = 0,
//       splitPayment = false,
//       method,
//       amount,
//       methods = [],
//       tabId
//     } = invoiceData;

//     try {
//       // Determine payment method, amount, and paid amount
//       let paymentMethod = 'C'; // Default to cash
//       let paidAmount = total;
//       let invoiceTotal = total; // P_INVTOTAL should be the final amount to pay

//       if (splitPayment) {
//         // For split payment, use 'S' as payment type
//         paymentMethod = 'S';
//         paidAmount = methods.reduce((sum, m) => sum + m.amount, 0);
//         invoiceTotal = total;
//       } else {
//         paymentMethod = getPaymentMethodCode(method);
//         paidAmount = amount || total;
//         invoiceTotal = total;
//       }

//       // Build URL with parameters
//       let url = `${API_URL}/ADDINV/ADDINV?P_SESSIONID=${sessionId}&P_SALEID=${saleId}`;
      
 
//       // Add other parameters - CORRECTED MAPPING:
//       url += `&P_DISTOTAL=${discount}`; // Cart discount amount
//       url += `&P_PAYTYPE=${paymentMethod}`; // Payment method code
//       url += `&P_INVTOTAL=${invoiceTotal}`; // Final amount to be paid (after discount)
//       url += `&P_PAIDAMOUNT=${paidAmount}`; // Amount actually paid

//       console.log('API URL:', url); // For debugging

//       const response = await axios.post(
//         url,
//         {},
//         {
//           headers: {
//             "auth-key": token,  
//           },
//         }
//       );

//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // ... keep other methods the same
//   getInvoiceDetails: async () => {
//     const token = localStorage.getItem("token");
    
//     try {
//       const url = `${API_URL}/Invoice/GetInvoiceDetails`;

//       const response = await axios.get(url, {
//         headers: {
//           "auth-key": token,
//         },
//       });

//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   updateInvoiceDetails: async (formData) => {
//     const token = localStorage.getItem("token");
    
//     try {
//       const url = `${API_URL}/Invoice/UpdateInvoiceDetails`;

//       const response = await axios.post(url, formData, {
//         headers: {
//           "auth-key": token,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   getInvoiceImage: async () => {
//     const token = localStorage.getItem("token");
    
//     try {
//       const url = `${API_URL}/Invoice/INPhotoPrivew`;

//       const response = await axios.get(url, {
//         headers: {
//           "auth-key": token,
//         },
//         responseType: 'blob', 
//       });

//       return new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsDataURL(response.data);
//       });
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

//   getInvoiceImageBlob: async () => {
//     const token = localStorage.getItem("token");
    
//     try {
//       const url = `${API_URL}/Invoice/INPhotoPrivew`;
//       const response = await axios.get(url, {
//         headers: {
//           "auth-key": token,
//         },
//         responseType: 'blob',
//       });

//       return URL.createObjectURL(response.data);
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   }
// };


export const invoiceService = {
  addInvoice: async (invoiceData) => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.LogId || userData?.UserID || "1";

    const {
      items = [],
      subtotal = 0,
      discount = 0,
      tax = 0,
      total = 0,
      splitPayment = false,
      method,
      amount, 
      methods = [],
      tabId,
      cashAmount 
    } = invoiceData;

    try {
      let paymentMethod = 'CASH'; 
      if (splitPayment) {
        paymentMethod = 'SPLIT';
      } else {
        const methodMap = {
          'cash': 'CASH',     
          'card': 'CARD',
          'lankaqr': 'LANKAQR',
          'gift': 'GIFT',
          'paypal': 'PAYPAL',  
          'mobile': 'MOBILE'    
        };
        paymentMethod = methodMap[method] || 'CASH';
      }

      // Generate a BillNo
      const billNo = `BILL-${Math.floor(Date.now() / 1000)}`;
      const currentDate = new Date().toISOString().split('T')[0];

      // 1. Create the Bill
      const billFormData = new FormData();
      billFormData.append("BillNo", billNo);
      billFormData.append("BillDate", currentDate);
      billFormData.append("UserId", userId);
      billFormData.append("TotalAmount", subtotal);
      billFormData.append("DiscountAmount", discount);
      billFormData.append("NetAmount", total);
      billFormData.append("PaymentType", paymentMethod);
      billFormData.append("CreatedBy", userId);

      const billResponse = await axios.post(`${API_URL}/Bills/AddBillsDetails`, billFormData);

      // We need the BillId to add items. Assuming the API returns it or we can fetch it, 
      // but if the API doesn't return BillId in ResultSet, we might have to fetch latest bill.
      // Let's assume it doesn't return it based on the example which has `ResultSet: null`.
      // The example response is: { "StatusCode": 200, "Result": "Bill added successfully!", "ResultSet": null }
      // Without BillId, we need to fetch Bills and find our BillNo
      const allBillsResponse = await axios.get(`${API_URL}/Bills/GetAllBills`);
      const createdBill = allBillsResponse.data.ResultSet?.find(b => b.BillNo === billNo);
      
      if (!createdBill) {
        throw new Error("Failed to retrieve created bill ID");
      }

      // 2. Add Bill Items
      for (const item of items) {
        const itemFormData = new FormData();
        itemFormData.append("BillId", createdBill.BillId);
        itemFormData.append("ProductId", item.id || item.productId || item.ProductId); // Adjust based on item structure
        itemFormData.append("Qty", item.quantity);
        itemFormData.append("UnitPrice", item.price);
        itemFormData.append("Total", item.price * item.quantity);
        itemFormData.append("CreatedBy", userId);

        await axios.post(`${API_URL}/BillItems/AddBillItemsDetails`, itemFormData);
      }

      return billResponse.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  getInvoiceDetails: async () => {
      const token = localStorage.getItem("token");
      try {
        const url = `${API_URL}/Invoice/GetInvoiceDetails`;
  
  
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  
    updateInvoiceDetails: async (formData) => {
      const token = localStorage.getItem("token");
      
      try {
        const url = `${API_URL}/Invoice/UpdateInvoiceDetails`;
  
  
        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  
    getInvoiceImage: async () => {
      const token = localStorage.getItem("token");
      
      try {
        const url = `${API_URL}/Invoice/INPhotoPrivew`; 
  
        const response = await axios.get(url, {
          responseType: 'blob', 
        });
  
         
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(response.data);
        });
      } catch (error) {
  
        throw error.response?.data || error.message;
      }
    },
  
    
    getInvoiceImageBlob: async () => {
      const token = localStorage.getItem("token");
      
      try {
        const url = `${API_URL}/Invoice/INPhotoPrivew`;
        const response = await axios.get(url, {
          responseType: 'blob',
        });
  
        return URL.createObjectURL(response.data);
      } catch (error) {
  
        throw error.response?.data || error.message;
      }
    }
};
 
const getPaymentMethodCode = (method) => {
  const methodMap = {
    'cash': 'C',     
    'card': 'D',
    'lankaqr': 'L',
    'gift': 'G',
    'paypal': 'P',  
    'mobile': 'M'    
  };
  
  return methodMap[method] || 'C';  
};



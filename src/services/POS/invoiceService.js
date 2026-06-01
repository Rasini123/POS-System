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

const getCreatedBillByNumber = async (billNo) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const allBillsResponse = await axios.get(`${API_URL}/Bills/GetAllBills`);
    const bills = allBillsResponse.data?.ResultSet || [];
    const createdBill = bills.find(b => String(b.BillNo) === String(billNo));

    if (createdBill) return createdBill;
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return null;
};

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
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData?.UserId || userData?.UserID || userData?.userId || userData?.LogId || "1";

    const {
      items = [],
      subtotal = 0,
      discount = 0,
      total = 0,
      splitPayment = false,
      method,
      amount, 
      methods = [],
      cashAmount
    } = invoiceData;

    try {
      const methodMap = {
        cash: 'CASH',
        card: 'CARD',
        lankaqr: 'LANKAQR',
        gift: 'GIFT',
        paypal: 'PAYPAL',
        mobile: 'MOBILE',
        split: 'SPLIT'
      };
      const paymentMethod = splitPayment ? 'SPLIT' : methodMap[method] || 'CASH';
      const paidAmount = Number(amount || cashAmount || total);
      const changeAmount = Math.max(0, paidAmount - Number(total || 0));
      const billNo = `BILL-${Date.now()}`;
      const currentDate = new Date().toISOString().split('T')[0];
      const totalAmount = Number(subtotal || 0);
      const discountAmount = Number(discount || 0);
      const netAmount = Number(total || 0);

      const billFormData = new FormData();
      billFormData.append("BillNo", billNo);
      billFormData.append("BillDate", currentDate);
      billFormData.append("UserId", userId);
      billFormData.append("TotalAmount", totalAmount.toFixed(2));
      billFormData.append("DiscountAmount", discountAmount.toFixed(2));
      billFormData.append("NetAmount", netAmount.toFixed(2));
      billFormData.append("PaymentType", paymentMethod);
      billFormData.append("CreatedBy", userId);

      const billResponse = await axios.post(`${API_URL}/Bills/AddBillsDetails`, billFormData);

      let createdBill = billResponse.data?.ResultSet;
      if (!createdBill?.BillId) {
        createdBill = await getCreatedBillByNumber(billNo);
      }
      
      if (!createdBill?.BillId) {
        throw new Error("Failed to retrieve created bill ID");
      }

      return {
        ...billResponse.data,
        ResultSet: {
          ...(billResponse.data?.ResultSet || {}),
          BillId: createdBill.BillId,
          BillNo: createdBill.BillNo || billNo,
          PaymentType: paymentMethod,
          PaidAmount: paidAmount.toFixed(2),
          ChangeAmount: changeAmount.toFixed(2),
          SplitMethods: splitPayment ? methods : []
        }
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getAllBills: async () => {
    try {
      const url = `${API_URL}/Bills/GetAllBills`;
      const response = await axios.get(url);
      // Prefer ResultSet if present, otherwise return raw data
      return response.data?.ResultSet || response.data || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getInvoiceDetails: async () => {
      try {
        const url = `${API_URL}/Invoice/GetInvoiceDetails`;
  
  
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        throw error.response?.data || error.message;
      }
    },
  
    updateInvoiceDetails: async (formData) => {
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


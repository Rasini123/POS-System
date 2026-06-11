// // actions/POS/invoiceActions.js
// import {
//   ADD_INVOICE_REQUEST,
//   ADD_INVOICE_SUCCESS,
//   ADD_INVOICE_FAILURE,
//   GET_INVOICE_DETAILS_REQUEST,
//   GET_INVOICE_DETAILS_SUCCESS,
//   GET_INVOICE_DETAILS_FAILURE,
//   UPDATE_INVOICE_DETAILS_REQUEST,
//   UPDATE_INVOICE_DETAILS_SUCCESS,
//   UPDATE_INVOICE_DETAILS_FAILURE,
// } from '../../constants/POS/invoiceConstants';
// import { invoiceService } from '../../services/POS/invoiceService';

// export const addInvoice = (whCode) => async (dispatch) => {
//   try {
//     dispatch({ type: ADD_INVOICE_REQUEST });

//     const data = await invoiceService.addInvoice(whCode);

//     dispatch({
//       type: ADD_INVOICE_SUCCESS,
//       payload: data,
//     });
//   } catch (error) {
//     dispatch({
//       type: ADD_INVOICE_FAILURE,
//       payload: error,
//     });
//   }
// };

// export const getInvoiceDetails = () => async (dispatch) => {
//   try {
//     dispatch({ type: GET_INVOICE_DETAILS_REQUEST });

//     const data = await invoiceService.getInvoiceDetails();

//     dispatch({
//       type: GET_INVOICE_DETAILS_SUCCESS,
//       payload: data,
//     });
//   } catch (error) {
//     dispatch({
//       type: GET_INVOICE_DETAILS_FAILURE,
//       payload: error,
//     });
//   }
// };

// export const updateInvoiceDetails = (invoiceData, logoFile) => async (dispatch) => {
//   try {
//     dispatch({ type: UPDATE_INVOICE_DETAILS_REQUEST });

//     const formData = new FormData();

//     // Append all invoice data fields
//     Object.keys(invoiceData).forEach(key => {
//       formData.append(key, invoiceData[key]);
//     });

//     // Append logo file if provided
//     if (logoFile) {
//       formData.append('logoFile', logoFile);
//     }

//     const data = await invoiceService.updateInvoiceDetails(formData);

//     dispatch({
//       type: UPDATE_INVOICE_DETAILS_SUCCESS,
//       payload: data,
//     });
//   } catch (error) {
//     dispatch({
//       type: UPDATE_INVOICE_DETAILS_FAILURE,
//       payload: error,
//     });
//   }
// };



import {
  ADD_INVOICE_REQUEST,
  ADD_INVOICE_SUCCESS,
  ADD_INVOICE_FAILURE,
  GET_INVOICE_DETAILS_REQUEST,
  GET_INVOICE_DETAILS_SUCCESS,
  GET_INVOICE_DETAILS_FAILURE,
  UPDATE_INVOICE_DETAILS_REQUEST,
  UPDATE_INVOICE_DETAILS_SUCCESS,
  UPDATE_INVOICE_DETAILS_FAILURE,
  GET_INVOICE_IMAGE_REQUEST,
  GET_INVOICE_IMAGE_SUCCESS,
  GET_INVOICE_IMAGE_FAILURE,
} from '../../constants/POS/invoiceConstants';
import { invoiceService } from '../../services/POS/invoiceService';
import { API_URL } from '../../config';


export const addInvoice = (invoiceData) => async (dispatch) => {
  try {
    dispatch({ type: ADD_INVOICE_REQUEST });


    const response = await invoiceService.addInvoice(invoiceData);

    const invoiceNumber = response.ResultSet?.INVOICE_NO || response.ResultSet?.BillNo;
    if (invoiceNumber) {
      localStorage.setItem("invoiceNumber", invoiceNumber.toString());
    }

    dispatch({
      type: ADD_INVOICE_SUCCESS,
      payload: response,
    });

    return response;
  } catch (error) {
    dispatch({
      type: ADD_INVOICE_FAILURE,
      payload: error,
    });
    throw error;
  }
};



export const getInvoiceDetails = () => async (dispatch) => {
  try {
    dispatch({ type: GET_INVOICE_DETAILS_REQUEST });
    const data = await invoiceService.getInvoiceDetails();
    dispatch({
      type: GET_INVOICE_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: GET_INVOICE_DETAILS_FAILURE,
      payload: error,
    });
  }
};


export const updateInvoiceDetails = (invoiceData, logoFile) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_INVOICE_DETAILS_REQUEST });
    const formData = new FormData();
    formData.append('p_company_name', invoiceData.p_company_name || '');
    formData.append('p_phone_number', invoiceData.p_phone_number || '');
    formData.append('p_address', invoiceData.p_address || '');
    formData.append('p_email', invoiceData.p_email || '');
    formData.append('p_website', invoiceData.p_website || '');
    formData.append('p_tax_number', invoiceData.p_tax_number || '');
    formData.append('p_footer_text', invoiceData.p_footer_text || '');
    formData.append('p_terms_conditions', invoiceData.p_terms_conditions || '');
    if (logoFile) {
      formData.append('file', logoFile);
    }
    const data = await invoiceService.updateInvoiceDetails(formData);
    dispatch({
      type: UPDATE_INVOICE_DETAILS_SUCCESS,
      payload: data,
    });
    await dispatch(getInvoiceDetails());
    await dispatch(getInvoiceImage());
  } catch (error) {
    dispatch({
      type: UPDATE_INVOICE_DETAILS_FAILURE,
      payload: error,
    });
  }
};


export const getInvoiceImage = () => async (dispatch) => {
  try {
    dispatch({ type: GET_INVOICE_IMAGE_REQUEST });
    const imageData = await invoiceService.getInvoiceImage();
    dispatch({
      type: GET_INVOICE_IMAGE_SUCCESS,
      payload: imageData,
    });
  } catch (error) {
    dispatch({
      type: GET_INVOICE_IMAGE_FAILURE,
      payload: error,
    });
  }
};

export const getAuthenticatedImageUrl = () => {
  const token = localStorage.getItem("token");
  const url = `${API_URL}/Invoice/INPhotoPrivew?t=${Date.now()}`;
  return { url, token };
};

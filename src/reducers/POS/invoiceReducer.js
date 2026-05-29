// // reducers/POS/invoiceReducer.js
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

// const initialState = {
//   loading: false,
//   invoiceDetails: null,
//   error: null,
// };

// const invoiceReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case ADD_INVOICE_REQUEST:
//     case GET_INVOICE_DETAILS_REQUEST:
//     case UPDATE_INVOICE_DETAILS_REQUEST:
//       return {
//         ...state,
//         loading: true,
//         error: null,
//       };

//     case ADD_INVOICE_SUCCESS:
//       return {
//         ...state,
//         loading: false,
//         error: null,
//       };

//     case GET_INVOICE_DETAILS_SUCCESS:
//       return {
//         ...state,
//         loading: false,
//         invoiceDetails: action.payload,
//         error: null,
//       };

//     case UPDATE_INVOICE_DETAILS_SUCCESS:
//       return {
//         ...state,
//         loading: false,
//         error: null,
//       };

//     case ADD_INVOICE_FAILURE:
//     case GET_INVOICE_DETAILS_FAILURE:
//     case UPDATE_INVOICE_DETAILS_FAILURE:
//       return {
//         ...state,
//         loading: false,
//         error: action.payload,
//       };

//     default:
//       return state;
//   }
// };

// export default invoiceReducer;



// reducers/POS/invoiceReducer.js
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

const initialState = {
  loading: false,
  invoiceDetails: null,
  invoiceImage: null,
  error: null,
};

export const invoiceReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_INVOICE_REQUEST:
    case GET_INVOICE_DETAILS_REQUEST:
    case UPDATE_INVOICE_DETAILS_REQUEST:
    case GET_INVOICE_IMAGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ADD_INVOICE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case GET_INVOICE_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        invoiceDetails: action.payload,
        error: null,
      };

    case UPDATE_INVOICE_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case GET_INVOICE_IMAGE_SUCCESS:
      return {
        ...state,
        loading: false,
        invoiceImage: action.payload,
        error: null,
      };

    case ADD_INVOICE_FAILURE:
    case GET_INVOICE_DETAILS_FAILURE:
    case UPDATE_INVOICE_DETAILS_FAILURE:
    case GET_INVOICE_IMAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
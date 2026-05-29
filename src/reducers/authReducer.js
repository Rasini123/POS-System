
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  CLEAR_ERROR
} from '../constants/authConstants';
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
  initialized: false
};
export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case LOGIN_SUCCESS:
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        initialized: true
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
        initialized: true
      };
    case 'AUTH_CHECK_COMPLETED':
      return {
        ...state,
        initialized: true
      };
    case LOGOUT:
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        initialized: true
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};
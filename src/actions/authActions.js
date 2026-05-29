import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  CLEAR_ERROR
} from '../constants/authConstants';
import { authService } from '../services/authService';

export const login = (P_UNAME, P_PWORD) => async (dispatch) => {
  dispatch({ type: 'LOGIN_REQUEST' });

  try {
    const response = await authService.login(P_UNAME, P_PWORD);

    if (!response?.AuthKey) {
      dispatch({ type: 'LOGIN_FAILURE', payload: response?.message || 'Login failed' });
      return;
    }

    const user = { 
      username: P_UNAME,
      userId: response?.Result?.UserID,
      LogId: response?.Result?.LogId,
      userType: response?.Result?.UserType || 'User' // Ensure userType has a default value
    };

    localStorage.setItem('token', response.AuthKey);
    localStorage.setItem('user', JSON.stringify(user));

    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: {
        token: response.AuthKey,
        user
      }
    });
 
    window.location.reload();

  } catch (error) {
    dispatch({
      type: 'LOGIN_FAILURE',
      payload: error.message || 'Login failed'
    });
  }
};

export const logout = () => async (dispatch) => {
  try {
    await authService.logout();
  } catch (error) {
    
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("darkMode");
    localStorage.removeItem("heldSales");

    dispatch({ type: LOGOUT });
    window.location.reload();
  }
};

export const clearError = () => ({
  type: CLEAR_ERROR
});
 
export const checkAuthStatus = () => (dispatch) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    const userData = JSON.parse(user);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        token,
        user: userData
      }
    });
  }
};
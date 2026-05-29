import axios from 'axios';
import { API_URL } from '../config';

export const authService = {
  login: async (P_UNAME, P_PWORD) => {
    try {
      const response = await axios.post(`${API_URL}/User/LoginUser`, {
        UserName: P_UNAME,
        Password: P_PWORD
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = response.data;
      if (data.StatusCode === 200 && data.ResultSet) {
        return {
          AuthKey: data.ResultSet.AuthKey,
          Result: {
            UserID: data.ResultSet.UserId,
            LogId: Math.floor(Math.random() * 100000), // kept if needed by other components
            UserType: data.ResultSet.RoleName === 'Admin' ? 'A' : 'C'
          }
        };
      } else {
        throw new Error(data.Result || 'Invalid username or password');
      }
    } catch (error) {
      throw error.response?.data || { message: error.message };
    }
  },

  logout: async () => {
    return { message: 'Successfully logged out.' };
  },

  verifyToken: async (token) => {
    return { valid: true };
  }
};

export default authService;
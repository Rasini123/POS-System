import axios from 'axios';
import { API_URL } from '../config';

export const getUsersList = async () => {
  const res = await axios.get(`${API_URL}/User/GetAllUsers`);
  return res.data;
};

export const getUserTypes = async () => {
  // Hardcoded as no specific endpoint provided in the new backend
  return [
    { type: 'Admin', label: 'Admin' },
    { type: 'Cashier', label: 'Cashier' }
  ];
};

export const addUser = async (name, password, type) => {
  const res = await axios.post(`${API_URL}/User/AddUserDetails`, {
    UserName: name,
    Password: password,
    RoleName: type
  });
  return res.data;
};

export const updateUserStatus = async (id, userName, password, roleName, isActive) => {
  const res = await axios.post(
    `${API_URL}/User/PutUserDetails`,
    {
      UserId: id,
      UserName: userName,
      Password: password,
      RoleName: roleName,
      IsActive: isActive
    }
  );
  return res.data;
};













































import {
  USER_LIST_REQUEST, USER_LIST_SUCCESS, USER_LIST_FAIL,
  USER_TYPE_REQUEST, USER_TYPE_SUCCESS, USER_TYPE_FAIL,
  USER_ADD_REQUEST, USER_ADD_SUCCESS, USER_ADD_FAIL,
  USER_STATUS_UPDATE_REQUEST, USER_STATUS_UPDATE_SUCCESS, USER_STATUS_UPDATE_FAIL,
} from '../constants/userConstants';
import { getUsersList, getUserTypes, addUser, updateUserStatus } from '../services/userService';


export const fetchUsers = () => async (dispatch, getState) => {
  const { userList } = getState();
  if (userList.loading) return;

  try {
    dispatch({ type: USER_LIST_REQUEST });
    const data = await getUsersList();
    if (data.StatusCode === 200) {
      dispatch({ type: USER_LIST_SUCCESS, payload: data.ResultSet });
    } else {
      dispatch({ type: USER_LIST_FAIL, payload: 'Failed to fetch users' });
    }
  } catch (error) {
    dispatch({ type: USER_LIST_FAIL, payload: error.message });
  }
};


export const fetchUserTypes = () => async (dispatch, getState) => {
  const { userTypes } = getState();
  if (userTypes.loading) return;
  try {
    dispatch({ type: USER_TYPE_REQUEST });
    const types = await getUserTypes();
    dispatch({ type: USER_TYPE_SUCCESS, payload: types });
  } catch (error) {
    dispatch({ type: USER_TYPE_FAIL, payload: error.message });
  }
};


export const createUser = (name, password, type) => async (dispatch) => {
  try {
    dispatch({ type: USER_ADD_REQUEST });
    const data = await addUser(name, password, type);
    if (data.StatusCode === 200) {
      dispatch({ type: USER_ADD_SUCCESS, payload: data });
    } else {
      dispatch({ type: USER_ADD_FAIL, payload: 'Failed to add user' });
    }
  } catch (error) {
    dispatch({ type: USER_ADD_FAIL, payload: error.message });
  }
};

export const changeUserStatus = (id) => async (dispatch) => {
  try {
    dispatch({ type: USER_STATUS_UPDATE_REQUEST });
    const data = await updateUserStatus(id);
    if (data.StatusCode === 200) {
      dispatch({ type: USER_STATUS_UPDATE_SUCCESS, payload: id });
    } else {
      dispatch({ type: USER_STATUS_UPDATE_FAIL, payload: 'Failed to update status' });
    }
  } catch (error) {
    dispatch({ type: USER_STATUS_UPDATE_FAIL, payload: error.message });
  }
};
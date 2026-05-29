import {
  USER_LIST_REQUEST, USER_LIST_SUCCESS, USER_LIST_FAIL,
  USER_TYPE_REQUEST, USER_TYPE_SUCCESS, USER_TYPE_FAIL,
  USER_ADD_REQUEST, USER_ADD_SUCCESS, USER_ADD_FAIL,
   USER_STATUS_UPDATE_REQUEST,USER_STATUS_UPDATE_SUCCESS,USER_STATUS_UPDATE_FAIL,
} from '../constants/userConstants';

const initialState = { loading: false, users: [], error: null };
export const userListReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LIST_REQUEST: return { ...state, loading: true };
    case USER_LIST_SUCCESS: return { loading: false, users: action.payload, error: null };
    case USER_LIST_FAIL: return { loading: false, users: [], error: action.payload };
    default: return state;
  }
};

const typeInitialState = { loading: false, types: [], error: null };
export const userTypeReducer = (state = typeInitialState, action) => {
  switch (action.type) {
    case USER_TYPE_REQUEST: return { ...state, loading: true };
    case USER_TYPE_SUCCESS: return { loading: false, types: action.payload, error: null };
    case USER_TYPE_FAIL: return { loading: false, types: [], error: action.payload };
    default: return state;
  }
};

const addInitialState = { loading: false, success: false, error: null };
export const userAddReducer = (state = addInitialState, action) => {
  switch (action.type) {
    case USER_ADD_REQUEST: return { loading: true };
    case USER_ADD_SUCCESS: return { loading: false, success: true, error: null };
    case USER_ADD_FAIL: return { loading: false, success: false, error: action.payload };
    default: return state;
  }
};

export const useListReducer = (state = { loading: false, users: [], error: null }, action) => {
  switch (action.type) {
    // ... old cases
    case USER_STATUS_UPDATE_REQUEST:
      return { ...state, loading: true };
    case USER_STATUS_UPDATE_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.map(u =>
          u.User_Id === action.payload
            ? { ...u, User_Status: u.User_Status === 'A' ? 'I' : 'A' }
            : u
        ),
      };
    case USER_STATUS_UPDATE_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
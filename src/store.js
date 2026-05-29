import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { uiReducer } from './reducers';
import { authReducer } from './reducers/authReducer';
import { userListReducer, userTypeReducer, userAddReducer } from './reducers/userReducer';
import productReducer1 from './reducers/POS/productReducer.js';
import { invoiceReducer } from './reducers/POS/invoiceReducer.js';
import cartReducer from './reducers/POS/cartReducer.js';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer,
  userList: userListReducer,
  userTypes: userTypeReducer,
  userAdd: userAddReducer,
  products: productReducer1,
  invoice: invoiceReducer,
});

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

export default store;
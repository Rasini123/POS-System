import { API_URL } from '../config';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || API_URL;

const toQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const postWithParams = (endpoint, params = {}) => apiRequest(`${endpoint}${toQueryString(params)}`, {
  method: 'POST'
});

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {

    throw error;
  }
};


export const authAPI = {
  login: (credentials) => apiRequest('/User/LoginUser', {
    method: 'POST',
    body: credentials
  }),
  logout: () => apiRequest('/auth/logout', {
    method: 'POST'
  }),
  refreshToken: () => apiRequest('/auth/refresh', {
    method: 'POST'
  })
};


export const productsAPI = {
  getAll: () => apiRequest('/Products/GetAllProducts'),
  getById: (id) => apiRequest(`/Products/GetProductsByProductId?ProductId=${id}`),
  create: (product) => postWithParams('/Products/AddProductsDetails', product),
  update: (id, product) => postWithParams('/Products/PutProductsDetails', {
    ProductId: id,
    ...product
  })
};

export const returnsAPI = {
  markReturn: ({ BillItemId, ReturnedQty, UpdatedBy = 1 }) => postWithParams('/Returns/MarkReturn', {
    BillItemId,
    ReturnedQty,
    UpdatedBy
  }),
  getAll: () => apiRequest('/Returns/GetAllReturns'),
  getByBillId: (BillId) => apiRequest(`/Returns/GetReturnsByBillId${toQueryString({ BillId })}`),
  getSummary: () => apiRequest('/Returns/GetReturnSummary')
};

export const holdDetailsAPI = {
  addHoldItem: ({ SessionId, UserId, ProductId, Qty, UnitPrice, CreatedBy }) => postWithParams('/HoldDetails/AddHoldItem', {
    SessionId,
    UserId,
    ProductId,
    Qty,
    UnitPrice,
    CreatedBy
  }),
  updateHoldItem: ({ HoldId, Qty, UnitPrice, UpdatedBy }) => postWithParams('/HoldDetails/UpdateHoldItem', {
    HoldId,
    Qty,
    UnitPrice,
    UpdatedBy
  }),
  softDeleteHoldItem: ({ HoldId, UpdatedBy }) => postWithParams('/HoldDetails/SoftDeleteHoldItem', {
    HoldId,
    UpdatedBy
  }),
  releaseHold: ({ SessionId, UpdatedBy }) => postWithParams('/HoldDetails/ReleaseHold', {
    SessionId,
    UpdatedBy
  }),
  getAllActive: () => apiRequest('/HoldDetails/GetAllActiveHolds'),
  getById: (HoldId) => apiRequest(`/HoldDetails/GetHoldById${toQueryString({ HoldId })}`),
  getBySessionId: (SessionId) => apiRequest(`/HoldDetails/GetHoldsBySessionId${toQueryString({ SessionId })}`)
};

export const usersAPI = {
  register: (user) => apiRequest('/User/AddUserDetails', {
    method: 'POST',
    body: user
  }),
  login: (credentials) => apiRequest('/User/LoginUser', {
    method: 'POST',
    body: credentials
  }),
  update: (user) => apiRequest('/User/PutUserDetails', {
    method: 'POST',
    body: user
  }),
  getAll: () => apiRequest('/User/GetAllUsers')
};

export const categoriesAPI = {
  create: (category) => apiRequest('/Categories/AddCategoriesDetails', {
    method: 'POST',
    body: category
  }),
  update: (category) => apiRequest('/Categories/PutCategoriesDetails', {
    method: 'POST',
    body: category
  }),
  getAll: () => apiRequest('/Categories/GetAllCategories'),
  getById: (CategoryId) => apiRequest(`/Categories/GetCategoriesByCategoryId${toQueryString({ CategoryId })}`)
};

export const subCategoriesAPI = {
  create: (subcategory) => apiRequest('/SubCategories/AddSubCategoriesDetails', {
    method: 'POST',
    body: subcategory
  }),
  update: (subcategory) => apiRequest('/SubCategories/PutSubCategoriesDetails', {
    method: 'POST',
    body: subcategory
  }),
  getAll: () => apiRequest('/SubCategories/GetAllSubCategories'),
  getById: (SubCategoryId) => apiRequest(`/SubCategories/GetSubCategoriesBySubCategoryId${toQueryString({ SubCategoryId })}`)
};

export const billsAPI = {
  create: (bill) => apiRequest('/Bills/AddBillsDetails', {
    method: 'POST',
    body: bill
  }),
  update: (bill) => apiRequest('/Bills/PutBillsDetails', {
    method: 'POST',
    body: bill
  }),
  getAll: () => apiRequest('/Bills/GetAllBills'),
  getById: (BillId) => apiRequest(`/Bills/GetBillsByBillId${toQueryString({ BillId })}`)
};

export const billItemsAPI = {
  create: (billItem) => apiRequest('/BillItems/AddBillItemsDetails', {
    method: 'POST',
    body: billItem
  }),
  update: (billItem) => apiRequest('/BillItems/PutBillItemsDetails', {
    method: 'POST',
    body: billItem
  }),
  getAll: () => apiRequest('/BillItems/GetAllBillItems'),
  getById: (BillItemId) => apiRequest(`/BillItems/GetBillItemsByBillItemsId${toQueryString({ BillItemId })}`)
};


export const customersAPI = {
  getAll: () => apiRequest('/customers'),
  getById: (id) => apiRequest(`/customers/${id}`),
  create: (customer) => apiRequest('/customers', {
    method: 'POST',
    body: customer
  }),
  update: (id, customer) => apiRequest(`/customers/${id}`, {
    method: 'PUT',
    body: customer
  }),
  search: (query) => apiRequest(`/customers/search?q=${encodeURIComponent(query)}`)
};


export const transactionsAPI = {
  getAll: () => apiRequest('/transactions'),
  getById: (id) => apiRequest(`/transactions/${id}`),
  create: (transaction) => apiRequest('/transactions', {
    method: 'POST',
    body: transaction
  }),
  getReports: (startDate, endDate) => apiRequest(
    `/reports?start=${startDate}&end=${endDate}`
  )
};

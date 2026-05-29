
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ;

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
  login: (credentials) => apiRequest('/auth/login', {
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
  getAll: () => apiRequest('/products'),
  getById: (id) => apiRequest(`/products/${id}`),
  create: (product) => apiRequest('/products', {
    method: 'POST',
    body: product
  }),
  update: (id, product) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: product
  }),
  delete: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE'
  })
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
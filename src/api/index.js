import apiClient from './axios';

/**
 * AUTHENTICATION APIS
 */
export const registerUser = async (userData) => {
  // Expected fields: name, email, password, department (or department/hostel), phone
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  // Expected fields: email, password
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
};

/**
 * ITEMS / MARKETPLACE APIS
 */
export const fetchItems = async (params = {}) => {
  // Query params: search, category, condition, sort
  // Filter out empty params
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });

  const response = await apiClient.get('/api/items', { params: cleanParams });
  return response.data;
};

export const fetchItemById = async (id) => {
  const response = await apiClient.get(`/api/items/${id}`);
  return response.data;
};

export const createItem = async (itemData) => {
  // title, description, category, price, condition, imageUrl
  const response = await apiClient.post('/api/items', itemData);
  return response.data;
};

export const updateItem = async (id, itemData) => {
  const response = await apiClient.put(`/api/items/${id}`, itemData);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await apiClient.delete(`/api/items/${id}`);
  return response.data;
};

export const markItemAsSold = async (id) => {
  const response = await apiClient.patch(`/api/items/${id}/sold`);
  return response.data;
};

export const fetchMyItems = async () => {
  const response = await apiClient.get('/api/items/mine');
  return response.data;
};

/**
 * PURCHASE REQUESTS APIS
 */
export const sendPurchaseRequest = async ({ itemId, note = '', message = '' }) => {
  // Send itemId along with optional note/message
  const payload = {
    itemId,
    item: itemId, // accommodate variations in backend schema
    note: note || message,
    message: message || note,
  };
  const response = await apiClient.post('/api/requests', payload);
  return response.data;
};

export const fetchReceivedRequests = async () => {
  const response = await apiClient.get('/api/requests/received');
  return response.data;
};

export const fetchSentRequests = async () => {
  const response = await apiClient.get('/api/requests/sent');
  return response.data;
};

export const updateRequestStatus = async (requestId, status) => {
  // status: 'accepted' | 'rejected'
  const response = await apiClient.patch(`/api/requests/${requestId}`, { status });
  return response.data;
};

/**
 * USER PROFILE APIS
 */
export const fetchCurrentUser = async () => {
  const response = await apiClient.get('/api/users/me');
  return response.data;
};

export const updateCurrentUser = async (userData) => {
  const response = await apiClient.put('/api/users/me', userData);
  return response.data;
};

/**
 * FILE UPLOAD API
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await apiClient.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * ADMIN APIS
 */
export const fetchAdminUsers = async (params = {}) => {
  const response = await apiClient.get('/api/admin/users', { params });
  return response.data;
};

export const fetchAdminUserById = async (id) => {
  const response = await apiClient.get(`/api/admin/users/${id}`);
  return response.data;
};

export const fetchAdminLoginActivity = async (params = {}) => {
  const response = await apiClient.get('/api/admin/login-activity', { params });
  return response.data;
};

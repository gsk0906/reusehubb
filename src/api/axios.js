import axios from 'axios';

// Get base URL from environment variable, default to empty string so proxy or same-origin works seamlessly
const rawBaseUrl = import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : '';
// Strip trailing slash if present
const baseURL = rawBaseUrl.replace(/\/+$/, '');

// Create customized Axios instance
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('reusehub_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error messages & handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized on protected route, remove stale token
    if (error.response && error.response.status === 401) {
      // Don't auto-clear if attempting to login or register
      const isAuthEndpoint = error.config.url.includes('/api/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('reusehub_token');
        localStorage.removeItem('token');
        localStorage.removeItem('reusehub_user');
        // Dispatch custom event so context or components can react
        window.dispatchEvent(new Event('reusehub_unauthorized'));
      }
    }

    // Enhance error object with easy-to-read user friendly message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;

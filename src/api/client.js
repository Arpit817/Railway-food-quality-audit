import axios from 'axios';

/**
 * Centralized Axios HTTP Client
 * - baseURL from environment variable (VITE_API_BASE_URL) with localhost fallback
 * - Request / Response interceptors for logging and error transformation
 */
const api = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_BASE_URL) || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token simulation or request timestamp
    config.headers['X-Request-Timestamp'] = new Date().toISOString();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = {
      message: error.response?.data?.message || error.message || 'Network communication failed',
      status: error.response?.status || 500,
      original: error
    };
    return Promise.reject(errorPayload);
  }
);

export default api;

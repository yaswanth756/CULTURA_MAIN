import axios from 'axios';

export const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API;

export function buildApiUrl(path) {
  const normalizedBase = BACKEND_API_URL.replace(/\/$/, "");
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

// ✅ OPTIMIZED: Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/';
      } else if (status === 429) {
        // Rate limited
        console.warn('Rate limit exceeded. Please try again later.');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
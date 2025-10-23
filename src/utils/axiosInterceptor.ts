import axios from 'axios';
import { getAuthToken } from './authUtils';
import { API_BASE_URL } from '../lib/api';
import { toast } from 'sonner';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log('🔍 Debug - Retrieved token:', token ? `${token.substring(0, 20)}...` : 'null');

    if (token) {
      // Set Authorization header
      config.headers.set('Authorization', `Bearer ${token}`);
      console.log('✅ Debug - Authorization header set:', config.headers.get('Authorization'));
    } else {
      console.warn('❌ Debug - No auth token found');
    }

    console.log('🔍 Debug - Final request headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('Authentication failed - token may be expired');
      
      // Clear all localStorage data
      localStorage.clear();
      
      // Show user-friendly error message
      toast.error('Session Expired', {
        description: 'Your session has expired. Please login again.',
        duration: 3000,
      });
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/#/login';
      }, 1000);
    } else if (error.response?.status === 403) {
      console.error('Access forbidden');
    } else if (error.response?.status >= 500) {
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

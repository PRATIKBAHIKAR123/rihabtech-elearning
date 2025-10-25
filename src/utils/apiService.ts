import apiClient from './axiosInterceptor';

// Generic API service class
class ApiService {
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
    endpoint: string, 
    data?: any,
    params?: any
  ): Promise<T> {
    try {
      const url = `${endpoint}`;
      console.log(`🚀 API Request: ${method} ${url}`, { data, params });
      
      const response = await apiClient({
        method,
        url,
        data,
        params,
      });
      
      console.log(`✅ API Success: ${method} ${url}`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`❌ API Error (${method} ${endpoint}):`, error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle specific error cases (401 is handled by axios interceptor)
      if (error.response?.status === 403) {
        console.error('Access forbidden');
        throw new Error('Access forbidden. You do not have permission to perform this action.');
      } else if (error.response?.status >= 500) {
        console.error('Server error');
        throw new Error('Server error. Please try again later.');
      } else if (error.response?.status === 400 || error.response?.status === 422) {
        // Handle validation errors (400 Bad Request or 422 Unprocessable Entity)
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
          // Show the first validation error to the user
          const firstError = error.response.data.errors[0];
          console.error('Validation Error:', firstError);
          throw new Error(firstError);
        } else if (error.response?.data?.message) {
          // Show the API error message
          console.error('API Error:', error.response.data.message);
          throw new Error(error.response.data.message);
        }
      }
      
      throw error;
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, params?: any): Promise<T> {
    return this.makeRequest<T>('GET', endpoint, undefined, params);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data);
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, data);
  }
}

export const apiService = new ApiService();
export default apiService;

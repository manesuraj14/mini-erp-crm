import axios from 'axios';
import { User, UserRole, Customer, CustomerNote, Product, StockMovementLog, Challan } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Automatically attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      console.warn('Session expired or unauthorized');
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authApi = {
  login: async (email: string, password?: string): Promise<{ token: string; user: User }> => {
    const defaultPassword =
      email.startsWith('admin') ? 'Admin@123' :
      email.startsWith('sales') ? 'Sales@123' :
      email.startsWith('warehouse') ? 'Warehouse@123' :
      email.startsWith('accounts') ? 'Accounts@123' : 'Admin@123';

    const response = await apiClient.post('/auth/login', {
      email,
      password: password || defaultPassword,
    });
    return response.data;
  },
  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// Customer Services
export const customerApi = {
  getCustomers: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },
  getCustomerById: async (id: string) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data.customer;
  },
  createCustomer: async (customerData: Partial<Customer>) => {
    const response = await apiClient.post('/customers', customerData);
    return response.data.customer;
  },
  updateCustomer: async (id: string, customerData: Partial<Customer>) => {
    const response = await apiClient.put(`/customers/${id}`, customerData);
    return response.data.customer;
  },
  addNote: async (customerId: string, noteText: string) => {
    const response = await apiClient.post(`/customers/${customerId}/notes`, { noteText });
    return response.data.note;
  },
};

// Product Services
export const productApi = {
  getProducts: async (params?: { page?: number; limit?: number; search?: string; category?: string; lowStock?: boolean }) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },
  getProductById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.product;
  },
  createProduct: async (productData: Partial<Product>) => {
    const response = await apiClient.post('/products', productData);
    return response.data.product;
  },
  updateProduct: async (id: string, productData: Partial<Product>) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data.product;
  },
  adjustStock: async (id: string, adjustment: { quantity: number; movementType: 'IN' | 'OUT'; reason: string }) => {
    const response = await apiClient.post(`/products/${id}/stock-movement`, adjustment);
    return response.data;
  },
  getStockLogs: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/products/stock-logs', { params });
    return response.data;
  },
};

// Challan Services
export const challanApi = {
  getChallans: async (params?: { page?: number; limit?: number; search?: string; status?: string; customerId?: string }) => {
    const response = await apiClient.get('/challans', { params });
    return response.data;
  },
  getChallanById: async (id: string) => {
    const response = await apiClient.get(`/challans/${id}`);
    return response.data.challan;
  },
  createChallan: async (challanData: {
    customerId: string;
    items: { productId: string; quantity: number }[];
    status: 'DRAFT' | 'CONFIRMED';
  }) => {
    const response = await apiClient.post('/challans', challanData);
    return response.data.challan;
  },
  confirmChallan: async (id: string) => {
    const response = await apiClient.put(`/challans/${id}/confirm`);
    return response.data.challan;
  },
  cancelChallan: async (id: string) => {
    const response = await apiClient.put(`/challans/${id}/cancel`);
    return response.data.challan;
  },
};
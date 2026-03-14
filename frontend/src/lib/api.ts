import axios from 'axios';
import Cookies from 'js-cookie';
import type { AuthResponse, Product, Reservation, ReservationJobResponse, CheckoutResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: { name: string; price: number; total_inventory: number }): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const reservationsApi = {
  create: async (productId: string, quantity: number): Promise<ReservationJobResponse> => {
    const response = await api.post('/reservations', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  getAll: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations');
    return response.data;
  },

  getById: async (id: string): Promise<Reservation> => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  checkout: async (reservationId: string): Promise<CheckoutResponse> => {
    const response = await api.post(`/reservations/checkout/${reservationId}`);
    return response.data;
  },
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!Cookies.get('token');
};

export const getToken = (): string | undefined => {
  return Cookies.get('token');
};

export const setToken = (token: string): void => {
  Cookies.set('token', token, { expires: 1 });
};

export const removeToken = (): void => {
  Cookies.remove('token');
};
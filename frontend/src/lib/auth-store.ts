import { create } from 'zustand';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { authApi } from './api';

interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  pendingAction: (() => void) | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setShowAuthModal: (show: boolean) => void;
  setPendingAction: (action: (() => void) | null) => void;
  checkAuth: () => void;
}

function getAuthFromToken(): { isLoggedIn: boolean; isAdmin: boolean } {
  if (typeof window === 'undefined') {
    return { isLoggedIn: false, isAdmin: false };
  }
  
  const token = Cookies.get('token');
  if (!token) {
    return { isLoggedIn: false, isAdmin: false };
  }
  
  try {
    const decoded: any = jwtDecode(token);
    const isAdmin = decoded.is_admin === true || decoded.is_admin === 'true';
    return { isLoggedIn: true, isAdmin };
  } catch {
    return { isLoggedIn: false, isAdmin: false };
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  isAdmin: false,
  isLoading: false,
  showAuthModal: false,
  pendingAction: null,

  checkAuth: () => {
    const auth = getAuthFromToken();
    set({ isLoggedIn: auth.isLoggedIn, isAdmin: auth.isAdmin });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(email, password);
      Cookies.set('token', response.access_token, { expires: 1 });
      const isAdmin = email.includes('admin');
      set({ 
        isLoggedIn: true, 
        isAdmin,
        isLoading: false,
        showAuthModal: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(email, password);
      Cookies.set('token', response.access_token, { expires: 1 });
      set({ 
        isLoggedIn: true, 
        isAdmin: false,
        isLoading: false,
        showAuthModal: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    Cookies.remove('token');
    set({ isLoggedIn: false, isAdmin: false, pendingAction: null });
  },

  setShowAuthModal: (show: boolean) => set({ showAuthModal: show }),
  
  setPendingAction: (action: (() => void) | null) => set({ pendingAction: action }),
}));
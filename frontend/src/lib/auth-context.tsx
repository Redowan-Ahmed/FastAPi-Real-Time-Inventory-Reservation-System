'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useLayoutEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { removeToken, setToken as saveToken, authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  pendingAction: (() => void) | null;
  setPendingAction: (action: (() => void) | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<{ isLoggedIn: boolean; isAdmin: boolean }>(() => getAuthFromToken());
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const router = useRouter();

  useLayoutEffect(() => {
    setAuthState(getAuthFromToken());
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthState(getAuthFromToken());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      saveToken(response.access_token);
      setAuthState({ isLoggedIn: true, isAdmin: email.includes('admin') });
      setShowAuthModal(false);
      
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      } else {
        router.push('/products');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(email, password);
      saveToken(response.access_token);
      setAuthState({ isLoggedIn: true, isAdmin: false });
      setShowAuthModal(false);
      
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      } else {
        router.push('/products');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setAuthState({ isLoggedIn: false, isAdmin: false });
    router.push('/products');
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isLoading,
        login,
        register,
        logout,
        showAuthModal,
        setShowAuthModal,
        pendingAction,
        setPendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
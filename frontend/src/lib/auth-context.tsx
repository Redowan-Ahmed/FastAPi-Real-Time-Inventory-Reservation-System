'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAuthenticated, removeToken, setToken as saveToken, authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  pendingAction: (() => void) | null;
  setPendingAction: (action: (() => void) | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    saveToken(response.access_token);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    } else {
      router.push('/products');
    }
  };

  const register = async (email: string, password: string) => {
    const response = await authApi.register(email, password);
    saveToken(response.access_token);
    setIsLoggedIn(true);
    setShowAuthModal(false);
    
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    } else {
      router.push('/products');
    }
  };

  const logout = () => {
    removeToken();
    setIsLoggedIn(false);
    router.push('/products');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
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
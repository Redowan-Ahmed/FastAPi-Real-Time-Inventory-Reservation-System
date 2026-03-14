'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { checkAuth, pendingAction, setPendingAction, setShowAuthModal } = useAuthStore();

  useLayoutEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleStorage = () => checkAuth();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [checkAuth]);

  return children;
}

export function useAuth() {
  const router = useRouter();
  const { 
    isLoggedIn, 
    isAdmin, 
    isLoading, 
    showAuthModal,
    pendingAction,
    login, 
    register, 
    logout, 
    setShowAuthModal,
    setPendingAction
  } = useAuthStore();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    } else {
      router.push('/products');
    }
  };

  const handleRegister = async (email: string, password: string) => {
    await register(email, password);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    } else {
      router.push('/products');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/products');
  };

  return {
    isLoggedIn,
    isAdmin,
    isLoading,
    showAuthModal,
    pendingAction,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    setShowAuthModal,
    setPendingAction,
  };
}
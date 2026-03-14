'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';

export default function Providers({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();

  useLayoutEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleStorage = () => checkAuth();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [checkAuth]);

  return <>{children}</>;
}
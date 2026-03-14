'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

export default function LoginClient() {
  const router = useRouter();
  const { login, register, isLoading } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      router.push('/products');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
                autoComplete="email"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-2">Demo Accounts:</p>
            <p className="text-xs text-gray-400">Admin: admin@example.com / admin123</p>
            <p className="text-xs text-gray-400">User: user@example.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
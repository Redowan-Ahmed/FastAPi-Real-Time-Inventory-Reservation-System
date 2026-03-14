'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { isLoggedIn, isAdmin, logout, isLoading } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              ShopEase
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                href="/"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/products"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Products
              </Link>
              {isLoggedIn && (
                <Link
                  href="/my-reservations"
                  className="text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  My Reservations
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin/products"
                  className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/my-reservations"
                      className="btn-secondary text-sm"
                    >
                      My Reservations
                    </Link>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-600 hover:text-indigo-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="btn-primary text-sm">
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
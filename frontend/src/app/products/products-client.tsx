'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi, reservationsApi } from '@/lib/api';
import { Product } from '@/types';
import { useAuthStore } from '@/lib/auth-store';
import { AuthModal } from '@/components';

export default function ProductsClient() {
  const router = useRouter();
  const { isLoggedIn, showAuthModal, setShowAuthModal, setPendingAction } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserving, setReserving] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleReserve = async (productId: string, quantity: number) => {
    if (!isLoggedIn) {
      setPendingAction(() => () => handleReserve(productId, quantity));
      setShowAuthModal(true);
      return;
    }

    setReserving(productId);
    setError('');

    try {
      const result = await reservationsApi.create(productId, quantity);
      setShowAuthModal(false);
      router.push('/my-reservations');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reservation';
      setError(errorMessage);
    } finally {
      setReserving(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-64 p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600">{products.length} products available</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const isOutOfStock = product.available_inventory === 0;
            const isLowStock = product.available_inventory > 0 && product.available_inventory <= 3;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col"
              >
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h2>
                  <p className="text-2xl font-bold text-indigo-600 mb-4">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-gray-500">
                    Total: {product.total_inventory}
                  </span>
                  <span
                    className={`font-medium ${
                      isOutOfStock
                        ? 'text-red-600'
                        : isLowStock
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}
                  >
                    {isOutOfStock
                      ? 'Out of Stock'
                      : `${product.available_inventory} available`}
                  </span>
                </div>

                {!isOutOfStock && (
                  <button
                    onClick={() => handleReserve(product.id, 1)}
                    disabled={reserving === product.id}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reserving === product.id ? 'Reserving...' : 'Reserve Now'}
                  </button>
                )}

                {isOutOfStock && (
                  <div className="w-full text-center bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium">
                    Out of Stock
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
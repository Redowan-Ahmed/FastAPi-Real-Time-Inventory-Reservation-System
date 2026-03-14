'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi, reservationsApi } from '@/lib/api';
import { Product } from '@/types';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isLoggedIn, showAuthModal, setShowAuthModal, setPendingAction } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [productId, setProductId] = useState<string>('');

  useEffect(() => {
    params.then((p) => {
      setProductId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (!productId) return;
    
    const fetchProduct = async () => {
      try {
        const data = await productsApi.getById(productId);
        setProduct(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleReserve = async () => {
    if (!product || quantity <= 0) return;

    if (!isLoggedIn) {
      setPendingAction(() => () => handleReserve());
      setShowAuthModal(true);
      return;
    }

    setReserving(true);
    setError('');
    setSuccess('');

    try {
      const result = await reservationsApi.create(productId, quantity);
      setSuccess(`Reservation queued! Job ID: ${result.job_id}`);
      setTimeout(() => {
        router.push('/my-reservations');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create reservation');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-red-600">Product not found</div>
      </div>
    );
  }

  const isOutOfStock = product.available_inventory === 0;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-700 mb-6 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        <div className="card">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <div className="relative h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-8xl text-gray-300">{product.name.charAt(0)}</span>
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-4xl font-bold text-indigo-600 mb-6">
                ${product.price.toFixed(2)}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Inventory</p>
                  <p className="text-xl font-semibold">{product.total_inventory}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Available</p>
                  <p className={`text-xl font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                    {product.available_inventory}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                  {success}
                </div>
              )}

              {!isOutOfStock && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        min="1"
                        max={product.available_inventory}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="input w-24"
                      />
                      <button
                        onClick={handleReserve}
                        disabled={reserving || quantity > product.available_inventory}
                        className="btn-primary flex-1"
                      >
                        {reserving ? 'Reserving...' : `Reserve (${quantity})`}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Reservations expire in 5 minutes if not completed
                  </p>
                </div>
              )}

              {isOutOfStock && (
                <div className="bg-red-100 text-red-700 py-4 px-6 rounded-lg text-center font-medium">
                  This item is currently out of stock
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
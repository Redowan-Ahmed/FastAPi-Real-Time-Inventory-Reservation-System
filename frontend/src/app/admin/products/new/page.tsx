'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function NewProductPage() {
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [totalInventory, setTotalInventory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isLoggedIn || !isAdmin) {
    router.push('/products');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await productsApi.create({
        name,
        price: parseFloat(price),
        total_inventory: parseInt(totalInventory),
      });
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/admin/products"
        className="text-indigo-600 hover:text-indigo-700 mb-6 inline-block"
      >
        &larr; Back to Products
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>

      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Inventory
            </label>
            <input
              type="number"
              min="0"
              value={totalInventory}
              onChange={(e) => setTotalInventory(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <Link href="/admin/products" className="btn-secondary px-6">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { useAuth } from '@/lib/auth-context';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoggedIn, isAdmin } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [totalInventory, setTotalInventory] = useState('');
  const [availableInventory, setAvailableInventory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      router.push('/products');
      return;
    }

    const fetchProduct = async () => {
      try {
        const data = await productsApi.getById(params.id as string);
        setProduct(data);
        setName(data.name);
        setPrice(data.price.toString());
        setTotalInventory(data.total_inventory.toString());
        setAvailableInventory(data.available_inventory.toString());
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [isLoggedIn, isAdmin, router, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await productsApi.update(params.id as string, {
        name,
        price: parseFloat(price),
        total_inventory: parseInt(totalInventory),
        available_inventory: parseInt(availableInventory),
      });
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update product');
    } finally {
      setSaving(false);
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/admin/products"
        className="text-indigo-600 hover:text-indigo-700 mb-6 inline-block"
      >
        &larr; Back to Products
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product</h1>

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

          <div className="mb-4">
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Inventory
            </label>
            <input
              type="number"
              min="0"
              max={parseInt(totalInventory)}
              value={availableInventory}
              onChange={(e) => setAvailableInventory(e.target.value)}
              className="input"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
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
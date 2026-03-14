'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';
import { useAuth } from '@/lib/auth-context';

export default function AdminProductsPage() {
  const router = useRouter();
  const { isLoggedIn, isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      router.push('/products');
      return;
    }
    
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [isLoggedIn, isAdmin, router]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productsApi.delete(productId);
      setProducts(products.filter(p => p.id !== productId));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">{product.total_inventory}</div>
                </td>
                <td className="px-6 py-4">
                  <div className={`text-sm font-medium ${product.available_inventory > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.available_inventory}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
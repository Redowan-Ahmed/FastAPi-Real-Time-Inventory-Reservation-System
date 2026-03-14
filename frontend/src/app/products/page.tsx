import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductsClient from './products-client';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our collection of premium products. Real-time inventory available.',
};

function ProductsLoading() {
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsClient />
    </Suspense>
  );
}
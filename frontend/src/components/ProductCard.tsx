'use client';

import Image from 'next/image';
import { Product } from '@/types';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.available_inventory === 0;
  const isLowStock = product.available_inventory > 0 && product.available_inventory <= 3;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="relative h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
          <div className="text-6xl text-gray-300">
            {product.name.charAt(0)}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {product.name}
          </h3>
          <p className="text-2xl font-bold text-indigo-600 mb-3">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <div className="flex justify-between items-center text-sm">
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

        {isOutOfStock && (
          <div className="mt-3 text-center bg-red-100 text-red-700 py-2 rounded-lg text-sm font-medium">
            Out of Stock
          </div>
        )}
      </div>
    </Link>
  );
}
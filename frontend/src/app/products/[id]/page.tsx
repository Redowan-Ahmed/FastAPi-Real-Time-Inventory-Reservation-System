import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductDetailClient from './product-detail-client';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Product Details`,
    description: `View product details and reserve now.`,
  };
}

function ProductLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-6"></div>
        <div className="bg-white rounded-lg p-8">
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-1/4 mb-6"></div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductLoading />}>
      <ProductDetailClient params={params} />
    </Suspense>
  );
}
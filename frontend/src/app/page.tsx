import type { Metadata } from 'next';
import { Suspense } from 'react';
import HomeClient from './home-client';

export const metadata: Metadata = {
  title: 'RayShopEase - Premium Products at Amazing Prices',
  description: 'Discover amazing products and reserve them instantly. Our real-time inventory system ensures you never miss out on deals.',
  openGraph: {
    title: 'RayShopEase - Premium Products at Amazing Prices',
    description: 'Discover amazing products and reserve them instantly.',
  },
};

function HomeLoading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeClient />
    </Suspense>
  );
}
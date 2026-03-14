'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const productName = searchParams.get('product') || 'Your product';
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const total = parseFloat(searchParams.get('total') || '0');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/my-reservations');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thank You!
          </h1>
          <p className="text-gray-600 mb-6">
            Your checkout has been completed successfully.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Product</p>
            <p className="font-semibold text-gray-900">{productName}</p>
            <p className="text-sm text-gray-500 mt-2">
              Quantity: {quantity} | Total: ${total.toFixed(2)}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Redirecting to reservations in {countdown} seconds...
          </p>

          <div className="flex gap-4">
            <Link href="/my-reservations" className="btn-primary flex-1">
              My Reservations
            </Link>
            <Link href="/products" className="btn-secondary flex-1">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
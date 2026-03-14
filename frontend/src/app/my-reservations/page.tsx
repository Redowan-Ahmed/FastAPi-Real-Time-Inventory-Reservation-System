import type { Metadata } from 'next';
import { Suspense } from 'react';
import MyReservationsClient from './my-reservations-client';

export const metadata: Metadata = {
  title: 'My Reservations',
  description: 'View and manage your product reservations. Complete checkout before expiration.',
};

function ReservationsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg h-32 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyReservationsPage() {
  return (
    <Suspense fallback={<ReservationsLoading />}>
      <MyReservationsClient />
    </Suspense>
  );
}
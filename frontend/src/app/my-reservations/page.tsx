'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { reservationsApi } from '@/lib/api';
import { Reservation } from '@/types';
import { ReservationCard, AuthModal } from '@/components';
import { useAuth } from '@/lib/auth-context';

function getTimeRemaining(expiresAt: string): number {
  const expires = new Date(expiresAt + 'Z').getTime();
  const now = Date.now();
  return Math.max(0, expires - now);
}

export default function MyReservationsPage() {
  const router = useRouter();
  const { isLoggedIn, showAuthModal, setShowAuthModal } = useAuth();
  const [reservationsList, setReservationsList] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    try {
      const data = await reservationsApi.getAll();
      setReservationsList(data);

      const newCountdowns: Record<string, number> = {};
      data.forEach((r) => {
        if (r.status === 'reserved') {
          newCountdowns[r.id] = getTimeRemaining(r.expires_at);
        }
      });
      setCountdowns(newCountdowns);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const next: Record<string, number> = {};
        Object.keys(prev).forEach((key) => {
          const newValue = prev[key] - 1000;
          next[key] = newValue > 0 ? newValue : 0;
        });
        return next;
      });
    }, 1000);

    const refreshInterval = setInterval(fetchReservations, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
    };
  }, [isLoggedIn, fetchReservations]);

  const handleCheckout = async (reservation: Reservation) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    setCheckingOut(reservation.id);
    setError('');
    try {
      const result = await reservationsApi.checkout(reservation.id);
      const params = new URLSearchParams({
        product: reservation.product_name || 'Product',
        quantity: reservation.quantity.toString(),
        total: ((reservation.product_price || 0) * reservation.quantity).toString()
      });
      router.push(`/checkout/success?${params.toString()}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Checkout failed');
      setCheckingOut(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Reservations</h1>
        <p className="text-gray-600 mb-6">Please sign in to view your reservations.</p>
        <button onClick={() => setShowAuthModal(true)} className="btn-primary">
          Sign In
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-500">Loading reservations...</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reservations</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {reservationsList.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              timeRemaining={countdowns[reservation.id] || 0}
              onCheckout={() => handleCheckout(reservation)}
              checkoutLoading={checkingOut === reservation.id}
            />
          ))}
        </div>

        {reservationsList.length === 0 && (
          <div className="text-center text-gray-500 py-12 bg-white rounded-xl">
            <p className="text-lg mb-2">No reservations yet</p>
            <p className="text-sm">Go to Products to make a reservation.</p>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
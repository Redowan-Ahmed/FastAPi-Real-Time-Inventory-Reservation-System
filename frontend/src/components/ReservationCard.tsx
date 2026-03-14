'use client';

import { Reservation } from '@/types';

interface ReservationCardProps {
  reservation: Reservation;
  timeRemaining: number;
  onCheckout: () => void;
  checkoutLoading: boolean;
}

function formatTime(ms: number): string {
  if (ms <= 0) return 'Expired';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    reserved: 'badge-warning',
    completed: 'bg-green-100 text-green-800',
    expired: 'badge-error',
  };

  const labels: Record<string, string> = {
    reserved: 'Reserved',
    completed: 'Purchased',
    expired: 'Expired',
  };

  return (
    <span className={`badge ${styles[status] || 'badge-warning'}`}>
      {labels[status] || status}
    </span>
  );
}

export function ReservationCard({
  reservation,
  timeRemaining,
  onCheckout,
  checkoutLoading,
}: ReservationCardProps) {
  const canCheckout = reservation.status === 'reserved' && timeRemaining > 0;

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {reservation.product_name || `Product #${reservation.product_id.slice(0, 8)}`}
          </h3>
          <p className="text-gray-600">
            Quantity: {reservation.quantity} × ${reservation.product_price?.toFixed(2)}
          </p>
          <p className="text-gray-800 font-medium">
            Total: ${((reservation.product_price || 0) * reservation.quantity).toFixed(2)}
          </p>
        </div>
        {getStatusBadge(reservation.status)}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="text-sm">
          {reservation.status === 'reserved' && (
            <span
              className={
                timeRemaining <= 60000
                  ? 'text-red-600 font-medium'
                  : 'text-gray-500'
              }
            >
              Expires in: {formatTime(timeRemaining)}
            </span>
          )}
          {reservation.status === 'completed' && (
            <span className="text-green-600 font-medium">Successfully purchased!</span>
          )}
          {reservation.status === 'expired' && (
            <span className="text-red-600">Expired</span>
          )}
        </div>

        {canCheckout && (
          <button
            onClick={onCheckout}
            disabled={checkoutLoading}
            className="btn-primary text-sm"
          >
            {checkoutLoading ? 'Processing...' : 'Complete Checkout'}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Reserved: {new Date(reservation.created_at).toLocaleString()}
      </p>
    </div>
  );
}
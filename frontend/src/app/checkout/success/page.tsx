import type { Metadata } from 'next';
import CheckoutSuccessClient from './checkout-success-client';

export const metadata: Metadata = {
  title: 'Checkout Successful',
  description: 'Your checkout has been completed successfully.',
};

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessClient />;
}
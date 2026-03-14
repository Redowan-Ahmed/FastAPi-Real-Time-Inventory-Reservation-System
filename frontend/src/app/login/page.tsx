import type { Metadata } from 'next';
import LoginClient from './login-client';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your ShopEase account to reserve products and manage your orders.',
};

export default function LoginPage() {
  return <LoginClient />;
}
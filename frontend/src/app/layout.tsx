import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import Providers from './providers';

export const metadata: Metadata = {
  title: {
    default: 'RayShopEase - Real-Time Inventory Reservation',
    template: '%s | RayShopEase',
  },
  description: 'RayShopEase - Real-time inventory reservation system for flash sales. Reserve products instantly and complete checkout within 5 minutes.',
  keywords: ['inventory management', 'reservation system', 'flash sale', 'e-commerce', 'online shopping'],
  authors: [{ name: 'Redowan Ahmed' }],
  creator: 'RayShopEase',
  publisher: 'RayShopEase',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://RayshopEase.com',
    siteName: 'RayShopEase',
    title: 'RayShopEase - Real-Time Inventory Reservation',
    description: 'Real-time inventory reservation system for flash sales. Reserve products instantly.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RayShopEase',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RayShopEase - Real-Time Inventory Reservation',
    description: 'Real-time inventory reservation system for flash sales.',
    images: ['/og-image.png'],
  }
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
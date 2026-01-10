import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Arisan Digital',
    template: '%s | Arisan Digital',
  },
  description:
    'Platform arisan digital modern untuk Gen Z Indonesia. Kelola arisan dengan mudah, aman, dan transparan.',
  keywords: [
    'arisan',
    'arisan digital',
    'rotating savings',
    'keuangan',
    'Indonesia',
    'Gen Z',
    'tabungan',
  ],
  authors: [
    {
      name: 'Arisan Digital',
    },
  ],
  creator: 'Arisan Digital',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://arisandigital.com',
    title: 'Arisan Digital',
    description: 'Platform arisan digital modern untuk Gen Z Indonesia',
    siteName: 'Arisan Digital',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arisan Digital',
    description: 'Platform arisan digital modern untuk Gen Z Indonesia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10B981' },
    { media: '(prefers-color-scheme: dark)', color: '#10B981' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            duration: 4000,
            classNames: {
              toast: 'rounded-xl shadow-lg border-neutral-200',
              title: 'font-semibold',
              description: 'text-neutral-600',
              success: 'border-primary-500 bg-primary-50',
              error: 'border-error bg-error-light',
              warning: 'border-warning bg-warning-light',
              info: 'border-info bg-info-light',
            },
          }}
        />
      </body>
    </html>
  );
}

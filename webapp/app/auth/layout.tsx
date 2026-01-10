/**
 * Auth Layout
 *
 * Shared layout for authentication pages (login, verify, profile-setup).
 * Provides consistent background, metadata, and structure.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke Arisan Digital dengan nomor HP kamu',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

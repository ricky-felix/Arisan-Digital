'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [router]);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-primary-50/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center">
          {/* Logo/Brand */}
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 shadow-primary-lg sm:h-20 sm:w-20">
              <svg
                className="h-10 w-10 text-white sm:h-12 sm:w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            Arisan Jadi Lebih{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Gampang
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-6 max-w-2xl text-lg text-neutral-600 sm:text-xl lg:text-2xl">
            Gabung arisan bareng temen-temen, kelola uang lebih rapi, dan raih
            impian kamu tanpa ribet
          </p>

          {/* Value Props */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-4 text-sm sm:gap-6 sm:text-base">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                <svg
                  className="h-4 w-4 text-primary-600"
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
              <span className="font-medium text-neutral-700">100% Aman</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                <svg
                  className="h-4 w-4 text-primary-600"
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
              <span className="font-medium text-neutral-700">Transparan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                <svg
                  className="h-4 w-4 text-primary-600"
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
              <span className="font-medium text-neutral-700">
                Pencairan Cepat
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href="/auth/login"
              className="group relative inline-flex w-full min-h-button items-center justify-center overflow-hidden rounded-xl bg-primary-500 px-8 py-4 font-semibold text-white shadow-primary-lg transition-all duration-300 hover:scale-105 hover:bg-primary-600 hover:shadow-primary-lg active:scale-95 sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2">
                Mulai Sekarang
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex w-full min-h-button items-center justify-center rounded-xl border-2 border-neutral-300 bg-white px-8 py-4 font-semibold text-neutral-800 transition-all duration-200 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-700 active:scale-95 sm:w-auto"
            >
              Masuk
            </Link>
          </div>

          {/* Admin Login Link */}
          <div className="mt-6">
            <Link
              href="/auth/admin-login"
              className="text-sm text-neutral-400 hover:text-primary-500 transition-colors"
            >
              🔐 Admin Login (Development)
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="mt-4 text-sm text-neutral-500">
            Udah dipercaya sama ribuan Gen Z di seluruh Indonesia
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {/* Feature 1 */}
          <div className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 transition-colors group-hover:bg-primary-500">
              <svg
                className="h-6 w-6 text-primary-600 transition-colors group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-neutral-900">
              Kelola Bareng Temen
            </h3>
            <p className="text-neutral-600">
              Bikin arisan sama temen-temen kamu dengan mudah. Semua
              transaksi tercatat otomatis.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-amber-100 transition-colors group-hover:bg-accent-amber-500">
              <svg
                className="h-6 w-6 text-accent-amber-600 transition-colors group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-neutral-900">
              Keamanan Terjamin
            </h3>
            <p className="text-neutral-600">
              Uang kamu aman dengan enkripsi tingkat bank. Privasi dan
              keamanan adalah prioritas kami.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-purple-100 transition-colors group-hover:bg-accent-purple-500">
              <svg
                className="h-6 w-6 text-accent-purple-600 transition-colors group-hover:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-neutral-900">
              Proses Cepat
            </h3>
            <p className="text-neutral-600">
              Pencairan dana instant, notifikasi real-time, dan tracking
              arisan yang mudah dipahami.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

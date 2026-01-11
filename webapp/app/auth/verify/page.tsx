/**
 * OTP Verification Page
 *
 * 6-digit OTP verification with auto-submit and resend functionality.
 * Features countdown timer and error handling.
 */

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OTPInput } from '@/components/ui/otp-input';
import { formatPhone } from '@/lib/utils';
import { verifyOTP, signInWithPhone } from '@/lib/auth/actions';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get('phone') || '';

  const [otp, setOtp] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [canResend, setCanResend] = React.useState(false);
  const [countdown, setCountdown] = React.useState(60);

  // Countdown timer for resend
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
      return undefined;
    }
  }, [countdown]);

  // Redirect if no phone number
  React.useEffect(() => {
    if (!phoneNumber) {
      router.push('/auth/login');
    }
  }, [phoneNumber, router]);

  const handleVerify = async (otpValue: string) => {
    setError('');
    setIsLoading(true);

    try {
      const result = await verifyOTP(phoneNumber, otpValue);

      if (result.success) {
        toast.success('Berhasil masuk!', {
          description: 'Selamat datang di Arisan Digital 🎉',
        });

        // Check if user has completed their profile
        // Import createClient at the top
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Check if user has a full_name in users table
          const { data: profile } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', user.id)
            .single<{ full_name: string }>();

          // If new user or no full_name, redirect to profile setup
          if (!profile || !profile.full_name || profile.full_name.trim() === '') {
            router.push('/auth/profile-setup');
          } else {
            // Existing user with complete profile, go to dashboard
            router.push('/dashboard');
          }
        } else {
          // Fallback to dashboard if no user data
          router.push('/dashboard');
        }
      } else {
        setError(result.error || 'Kode OTP salah. Coba lagi ya!');
        setOtp(''); // Clear OTP on error
        toast.error('Verifikasi gagal', {
          description: result.error || 'Kode OTP salah. Coba lagi ya!',
        });
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Terjadi kesalahan. Coba lagi ya!');
      setOtp('');
      toast.error('Terjadi kesalahan', {
        description: 'Coba lagi dalam beberapa saat.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) {
      return;
    }

    setError('');
    setCanResend(false);
    setCountdown(60);

    try {
      const result = await signInWithPhone(phoneNumber);

      if (result.success) {
        toast.success('Kode OTP berhasil dikirim ulang!', {
          description: 'Cek SMS kamu ya!',
        });
      } else {
        toast.error('Gagal mengirim ulang kode', {
          description: result.error || 'Coba lagi dalam beberapa saat.',
        });
        setCanResend(true);
        setCountdown(0);
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
      toast.error('Terjadi kesalahan', {
        description: 'Coba lagi dalam beberapa saat.',
      });
      setCanResend(true);
      setCountdown(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali
        </Link>

        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verifikasi Nomor HP</h1>
          <p className="text-gray-600">Masukkan kode yang dikirim ke</p>
          <p className="text-emerald-600 font-semibold mt-1">
            {phoneNumber ? formatPhone(phoneNumber) : ''}
          </p>
        </div>

        {/* Verification Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Masukkan Kode Verifikasi</CardTitle>
            <CardDescription className="text-base text-center">
              Kode OTP telah dikirim ke nomor HP kamu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-4">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  onComplete={handleVerify}
                  length={6}
                  disabled={isLoading}
                  error={!!error}
                />

                {error && (
                  <p className="text-sm text-red-500 font-medium text-center">{error}</p>
                )}
              </div>

              {/* Info Text */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  Memverifikasi...
                </div>
              )}

              {/* Resend Button */}
              <div className="text-center pt-4">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                  >
                    Kirim Ulang Kode
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Kirim ulang kode dalam{' '}
                    <span className="font-semibold text-emerald-600">{countdown}s</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Tidak menerima kode?{' '}
            <a href="#" className="text-emerald-600 hover:underline">
              Hubungi dukungan
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Login Page
 *
 * Phone number authentication entry point.
 * Features casual Indonesian copy, phone formatting, and validation.
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneInput } from '@/components/ui/phone-input';
import { validateIndonesianPhone } from '@/lib/utils';
import { signInWithPhone } from '@/lib/auth/actions';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    if (!phoneNumber) {
      setError('Nomor HP wajib diisi ya!');
      return;
    }

    if (!validateIndonesianPhone(phoneNumber)) {
      setError('Nomor HP tidak valid. Pastikan formatnya benar!');
      return;
    }

    // Send OTP
    setIsLoading(true);
    try {
      const result = await signInWithPhone(phoneNumber);

      if (result.success) {
        toast.success('Kode OTP berhasil dikirim!', {
          description: 'Cek SMS kamu ya!',
        });

        // Navigate to verify page with phone number
        router.push(`/auth/verify?phone=${encodeURIComponent(phoneNumber)}`);
      } else {
        setError(result.error || 'Gagal mengirim kode OTP. Coba lagi ya!');
        toast.error('Gagal mengirim kode OTP', {
          description: result.error || 'Coba lagi dalam beberapa saat.',
        });
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Terjadi kesalahan. Coba lagi ya!');
      toast.error('Terjadi kesalahan', {
        description: 'Coba lagi dalam beberapa saat.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">💚</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Arisan Digital</h1>
          <p className="text-gray-600">Platform arisan modern untuk Gen Z</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Masuk ke Arisan Digital</CardTitle>
            <CardDescription className="text-base">
              Masukkan nomor HP kamu untuk melanjutkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Input */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Nomor HP
                </label>
                <PhoneInput
                  id="phone"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  error={!!error}
                  errorMessage={error}
                  disabled={isLoading}
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-500">
                  Contoh: 0812-3456-7890 atau 812-3456-7890
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="casual"
                size="lg"
                className="w-full"
                disabled={isLoading || !phoneNumber}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Mengirim Kode...
                  </>
                ) : (
                  <>Kirim Kode 🚀</>
                )}
              </Button>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Belum punya akun?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Dengan melanjutkan, kamu setuju dengan{' '}
            <a href="#" className="text-emerald-600 hover:underline">
              Syarat & Ketentuan
            </a>{' '}
            dan{' '}
            <a href="#" className="text-emerald-600 hover:underline">
              Kebijakan Privasi
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

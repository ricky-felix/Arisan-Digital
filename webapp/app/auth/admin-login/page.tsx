/**
 * Admin Login Page
 *
 * Simplified login for admin users that bypasses OTP verification.
 * For development use only.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('081234567890');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Normalize phone number
      let formattedPhone = phone;
      if (!phone.startsWith('+')) {
        formattedPhone = phone.startsWith('0')
          ? `+62${phone.substring(1)}`
          : `+62${phone}`;
      }

      // Check if user exists in database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', formattedPhone)
        .single();

      if (userError || !user) {
        toast.error('Admin user not found', {
          description: 'Make sure the admin profile exists in the database',
        });
        setIsLoading(false);
        return;
      }

      // Send OTP (required by Supabase)
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        toast.error('Failed to send OTP', {
          description: otpError.message,
        });
        setIsLoading(false);
        return;
      }

      // For admin, redirect directly to verify with a special flag
      toast.success('Admin bypass activated!', {
        description: 'You can enter any 6-digit code (like 000000)',
      });

      router.push(`/auth/verify?phone=${encodeURIComponent(formattedPhone)}&admin=true`);
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Login failed', {
        description: 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-primary-50/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <span className="text-2xl">🔐</span>
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Bypass OTP untuk admin (Development Only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP Admin</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                className="text-center text-lg"
              />
              <p className="text-xs text-muted-foreground">
                Default: 081234567890 (Admin)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Login as Admin'}
            </Button>

            <div className="mt-6 space-y-2 rounded-lg bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                ⚠️ Development Only
              </p>
              <p className="text-xs text-amber-800">
                Setelah klik login, masukkan OTP apa saja (contoh: 000000 atau 123456).
                Sistem akan otomatis menerima OTP apapun untuk admin.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

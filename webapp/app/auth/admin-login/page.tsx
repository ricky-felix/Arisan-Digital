/**
 * Admin Login Page
 *
 * Email/password login for admin users.
 * For development use only.
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithEmail } from '@/lib/auth/actions';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signInWithEmail(email, password);

      if (result.success) {
        toast.success('Login berhasil!', {
          description: 'Selamat datang di Arisan Digital 🎉',
        });
        // Use window.location for hard redirect to ensure cookies are sent
        window.location.href = '/dashboard';
      } else {
        toast.error('Login gagal', {
          description: result.error || 'Email atau password salah',
        });
      }
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
            Login dengan email dan password (Development Only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Memproses...' : 'Login as Admin'}
            </Button>

            <div className="mt-6 space-y-2 rounded-lg bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                ⚠️ Development Only
              </p>
              <p className="text-xs text-amber-800">
                Default credentials: admin@example.com / admin123
              </p>
              <p className="text-xs text-amber-800">
                Akun akan dibuat otomatis jika belum ada.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

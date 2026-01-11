/**
 * Join Group Page
 *
 * Page for joining an existing arisan group via invite code.
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // TODO: Will be used for navigation
import Link from 'next/link';
import { ArrowLeft, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function JoinGroupPage() {
  // const router = useRouter(); // TODO: Will be used for navigation after successful join
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteCode.trim()) {
      toast.error('Kode undangan kosong', {
        description: 'Masukkan kode undangan dari admin arisan',
      });
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement join group logic
      // 1. Validate invite code
      // 2. Check if group exists
      // 3. Add user to group_members

      toast.info('Fitur ini sedang dikembangkan', {
        description: 'Gabung arisan akan segera tersedia!',
      });

      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Gagal bergabung', {
        description: 'Coba lagi dalam beberapa saat',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/groups"
        className="inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Kembali
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          Gabung Arisan
        </h1>
        <p className="text-neutral-600">
          Masukkan kode undangan dari admin arisan
        </p>
      </div>

      {/* Join Form */}
      <Card>
        <CardHeader>
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <CardTitle className="text-center">Kode Undangan</CardTitle>
          <CardDescription className="text-center">
            Minta kode undangan dari admin atau anggota arisan yang ingin kamu ikuti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Kode Undangan</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Contoh: ARISAN-ABC123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="pl-10 text-center text-lg tracking-wider uppercase"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="casual"
              size="lg"
              className="w-full"
              disabled={isLoading || !inviteCode.trim()}
            >
              {isLoading ? 'Mencari...' : 'Gabung Arisan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="text-center space-y-2">
        <p className="text-sm text-neutral-500">
          Belum punya kode undangan?
        </p>
        <Link href="/dashboard/groups/create">
          <Button variant="outline" size="sm">
            Buat Arisan Baru
          </Button>
        </Link>
      </div>
    </div>
  );
}

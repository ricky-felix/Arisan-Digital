/**
 * Profile Setup Page
 *
 * Initial profile setup for new users after OTP verification.
 * Features name input and optional profile picture upload.
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState('');
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar', {
        description: 'Pilih file JPG, PNG, atau WebP.',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar', {
        description: 'Maksimal 5MB ya!',
      });
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    if (!fullName.trim()) {
      toast.error('Nama wajib diisi', {
        description: 'Masukkan nama lengkap kamu ya!',
      });
      return;
    }

    if (fullName.trim().length < 3) {
      toast.error('Nama terlalu pendek', {
        description: 'Minimal 3 karakter ya!',
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error('Tidak dapat memverifikasi pengguna', {
          description: 'Silakan login kembali.',
        });
        router.push('/auth/login');
        return;
      }

      // TODO: Upload avatar file if exists
      let uploadedAvatarUrl: string | null = null;
      if (avatarFile) {
        setIsUploading(true);
        // Upload logic will be implemented later
        // For now, skip avatar upload
        setIsUploading(false);
      }

      // Update user profile in database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          profile_picture_url: uploadedAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.error('Gagal membuat profil', {
          description: 'Coba lagi ya!',
        });
        return;
      }

      toast.success('Profil berhasil dibuat! 🎉', {
        description: 'Selamat datang di Arisan Digital!',
      });

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Error setting up profile:', err);
      toast.error('Terjadi kesalahan', {
        description: 'Coba lagi dalam beberapa saat.',
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleSkipAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Yuk, Lengkapi Profil Kamu!</h1>
          <p className="text-gray-600">Tinggal sedikit lagi nih!</p>
        </div>

        {/* Setup Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Buat Profil</CardTitle>
            <CardDescription className="text-base">
              Lengkapi data diri kamu biar lebih personal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <Label className="text-gray-700">
                  Foto Profil <span className="text-gray-400 font-normal">(Opsional)</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 border-4 border-emerald-100">
                    <AvatarImage src={avatarPreview} alt={fullName || 'User'} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xl font-semibold">
                      {fullName ? getInitials(fullName) : <User className="w-8 h-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Mengupload...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          {avatarPreview ? 'Ganti Foto' : 'Pilih Foto'}
                        </>
                      )}
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleSkipAvatar}
                        disabled={isLoading}
                        className="w-full text-xs"
                      >
                        Hapus Foto
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Maksimal 5MB. Format: JPG, PNG, atau WebP.
                </p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap kamu"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={isLoading}
                  required
                  autoFocus
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">
                  Nama ini akan ditampilkan di profil dan grup arisan kamu.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="casual"
                size="lg"
                className="w-full mt-8"
                disabled={isLoading || !fullName.trim() || isUploading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Membuat Profil...
                  </>
                ) : (
                  <>Mulai Menggunakan Arisan 🚀</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Encouraging Message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Dengan melengkapi profil, kamu bisa langsung bergabung dengan arisan!
          </p>
        </div>
      </div>
    </div>
  );
}

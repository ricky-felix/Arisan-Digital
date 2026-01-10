/**
 * Profile Page
 *
 * User profile settings and preferences.
 * Features profile editing, password change, and account management.
 *
 * TODO: Implement profile editing and settings
 */

import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Profile',
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          Profil Saya
        </h1>
        <p className="text-neutral-600">
          Kelola informasi dan pengaturan akun
        </p>
      </div>

      <Card className="border-dashed border-2 border-neutral-300 bg-neutral-50">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold text-neutral-900">
              Halaman dalam pengembangan
            </h3>
            <p className="text-neutral-600">
              Fitur pengaturan profil sedang dikembangkan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

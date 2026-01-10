/**
 * Notifications Page
 *
 * Displays user notifications for payments, rounds, and group activities.
 *
 * TODO: Implement notifications list with read/unread status
 */

import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Notifications',
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          Notifikasi
        </h1>
        <p className="text-neutral-600">
          Pembaruan dan pengingat arisan kamu
        </p>
      </div>

      <Card className="border-dashed border-2 border-neutral-300 bg-neutral-50">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-xl font-bold text-neutral-900">
              Tidak ada notifikasi
            </h3>
            <p className="text-neutral-600">
              Kamu akan menerima notifikasi tentang pembayaran dan aktivitas arisan di sini
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

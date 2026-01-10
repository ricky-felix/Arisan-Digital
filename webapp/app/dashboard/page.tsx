/**
 * Dashboard Home Page
 *
 * Main dashboard overview with:
 * - Personalized welcome message
 * - Quick stats cards (contributions, active groups, next payment)
 * - Active groups grid
 * - Empty state for new users
 * - Floating Action Button to create new group
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, TrendingUp, Users, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile, getUserGroups } from '@/lib/supabase/queries';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GroupCard } from '@/components/groups/group-card';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { formatCurrency } from '@/lib/utils';

async function DashboardContent() {
  // Get current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user profile and groups
  const [profileResult, groupsResult] = await Promise.all([
    getUserProfile(user.id),
    getUserGroups(user.id),
  ]);

  const profile = profileResult.data;
  const groups = groupsResult.data || [];

  // Filter active groups
  const activeGroups = groups.filter((group) => group.status === 'active');

  // Calculate stats (mock data for now - will be replaced with real calculations)
  const totalContributed = activeGroups.reduce(
    (sum, group) => sum + group.contribution_amount,
    0
  );
  const activeGroupsCount = activeGroups.length;

  // Get first name for greeting
  const firstName = profile?.full_name?.split(' ')[0] || 'Teman';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
          Hai, {firstName}! 👋
        </h1>
        <p className="text-neutral-600">
          {activeGroupsCount > 0
            ? `Kamu punya ${activeGroupsCount} arisan aktif`
            : 'Yuk mulai arisan pertama kamu!'}
        </p>
      </div>

      {/* Quick Stats */}
      {activeGroupsCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Contributed */}
          <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary-100">
                  <TrendingUp className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-600">Total Iuran/Bulan</p>
                  <p className="text-2xl font-bold text-neutral-900 truncate">
                    {formatCurrency(totalContributed)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Groups */}
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-100">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-600">Arisan Aktif</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {activeGroupsCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Payment */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-100">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-600">Bayar Berikutnya</p>
                  <p className="text-lg font-bold text-neutral-900">
                    Segera
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Groups Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900">
            Arisan Aktif
          </h2>
          {activeGroupsCount > 0 && (
            <Link href="/dashboard/groups">
              <Button variant="ghost" size="sm">
                Lihat Semua
              </Button>
            </Link>
          )}
        </div>

        {/* Groups Grid or Empty State */}
        {activeGroupsCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGroups.slice(0, 6).map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                members={[]} // TODO: Fetch group members
                nextPaymentDate={null} // TODO: Calculate next payment date
                paymentStatus="pending"
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-neutral-300 bg-neutral-50">
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <Users className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Belum ada arisan nih!
                </h3>
                <p className="text-neutral-600">
                  Yuk buat arisan pertama kamu atau join arisan teman
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Link href="/dashboard/groups/create">
                    <Button variant="casual" size="lg" className="w-full sm:w-auto">
                      <Plus className="w-5 h-5" />
                      Buat Arisan Baru
                    </Button>
                  </Link>
                  <Link href="/dashboard/groups/join">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Gabung Arisan
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Action Button (Mobile) */}
      {activeGroupsCount > 0 && (
        <Link href="/dashboard/groups/create" className="md:hidden">
          <Button
            variant="casual"
            size="lg"
            className="fixed bottom-20 right-4 z-40 rounded-full w-14 h-14 p-0 shadow-2xl"
            aria-label="Buat Arisan Baru"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

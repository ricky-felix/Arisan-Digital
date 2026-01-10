/**
 * Dashboard Layout
 *
 * Protected layout for authenticated users.
 * Features:
 * - Mobile: Header at top, bottom navigation
 * - Desktop: Sidebar navigation with user info
 * - Responsive design with smooth transitions
 * - Gen Z aesthetic with emerald green accents
 *
 * Navigation Structure:
 * - Home (Dashboard overview)
 * - Groups (Arisan groups list)
 * - Payments (Payment history)
 * - Profile (User settings)
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/supabase/queries';
import { MobileHeader } from '@/components/shared/mobile-header';
import { BottomNav } from '@/components/shared/bottom-nav';
import { DesktopSidebar } from '@/components/shared/desktop-sidebar';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (authError || !user) {
    redirect('/auth/login');
  }

  // Fetch user profile
  const { data: profile } = await getUserProfile(user.id);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile Header - visible only on mobile */}
      <MobileHeader
        userName={profile?.full_name || 'User'}
        userAvatar={profile?.profile_picture_url}
        notificationCount={0} // TODO: Implement notification count
        className="md:hidden"
      />

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar - visible only on desktop */}
        <DesktopSidebar
          userName={profile?.full_name || 'User'}
          userAvatar={profile?.profile_picture_url}
          userPhone={profile?.phone_number}
          className="hidden md:flex"
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full min-h-screen pb-20 md:pb-6">
          <div className="container max-w-7xl mx-auto px-4 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - visible only on mobile */}
      <BottomNav />
    </div>
  );
}

/**
 * Dashboard Loading State
 *
 * Displays a loading skeleton while dashboard data is being fetched.
 */

import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';

export default function DashboardLoading() {
  return <DashboardSkeleton />;
}

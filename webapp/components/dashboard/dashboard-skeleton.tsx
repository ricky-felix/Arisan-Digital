/**
 * Dashboard Skeleton Component
 *
 * Loading skeleton for the dashboard page.
 * Shows placeholder content while data is being fetched.
 * Uses shimmer animation for a polished loading experience.
 */

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-neutral-200 rounded',
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Header Skeleton */}
      <div className="space-y-2">
        <SkeletonBox className="h-10 w-64 rounded-xl" />
        <SkeletonBox className="h-5 w-48 rounded-lg" />
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <SkeletonBox className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <SkeletonBox className="h-4 w-24 rounded" />
                  <SkeletonBox className="h-8 w-32 rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Groups Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-8 w-32 rounded-xl" />
          <SkeletonBox className="h-9 w-24 rounded-lg" />
        </div>

        {/* Groups Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <SkeletonBox className="h-6 w-3/4 rounded-lg" />
                  <SkeletonBox className="h-4 w-1/2 rounded" />
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((j) => (
                    <SkeletonBox key={j} className="h-8 w-8 rounded-full" />
                  ))}
                </div>
                <div className="space-y-2">
                  <SkeletonBox className="h-4 w-full rounded" />
                  <SkeletonBox className="h-6 w-2/3 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

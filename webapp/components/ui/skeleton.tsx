/**
 * Skeleton Component
 *
 * A loading skeleton component for displaying placeholder content.
 * Features smooth pulse animation and Gen Z aesthetic.
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-neutral-200', className)}
      {...props}
    />
  );
}

export { Skeleton };

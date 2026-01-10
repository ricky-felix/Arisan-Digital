/**
 * Badge Component
 *
 * A badge component based on shadcn/ui with Gen Z aesthetic.
 * Features rounded corners, emerald green colors, and multiple variants.
 * Perfect for status indicators, tags, and labels with emoji support.
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm',
        secondary:
          'border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
        destructive:
          'border-transparent bg-red-500 text-white hover:bg-red-600 shadow-sm',
        outline: 'border-emerald-500 text-emerald-600 hover:bg-emerald-50',
        success:
          'border-transparent bg-green-500 text-white hover:bg-green-600 shadow-sm',
        warning:
          'border-transparent bg-amber-500 text-white hover:bg-amber-600 shadow-sm',
        info: 'border-transparent bg-blue-500 text-white hover:bg-blue-600 shadow-sm',
        casual:
          'border-transparent bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md hover:shadow-lg hover:scale-105',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

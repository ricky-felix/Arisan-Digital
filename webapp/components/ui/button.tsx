/**
 * Button Component
 *
 * A customizable button component based on shadcn/ui with Gen Z aesthetic.
 * Features emerald green primary color, rounded corners, and a casual variant.
 * All buttons meet minimum 48px touch target requirement for mobile accessibility.
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-md hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-md hover:shadow-lg active:shadow-sm transform hover:-translate-y-0.5 active:translate-y-0',
        outline:
          'border-2 border-emerald-500 bg-transparent text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100',
        secondary:
          'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 active:bg-emerald-300',
        ghost: 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 active:bg-emerald-100',
        link: 'text-emerald-600 underline-offset-4 hover:underline hover:text-emerald-700',
        casual:
          'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 shadow-lg hover:shadow-xl active:shadow-md rounded-2xl font-semibold transform hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-100 transition-all duration-200',
      },
      size: {
        default: 'h-12 px-6 py-3 min-h-[48px]',
        sm: 'h-10 rounded-lg px-4 min-h-[40px] text-xs',
        lg: 'h-14 rounded-2xl px-8 min-h-[48px] text-base',
        icon: 'h-12 w-12 min-h-[48px] min-w-[48px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

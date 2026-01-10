/**
 * Input Component
 *
 * A text input component based on shadcn/ui with Gen Z aesthetic.
 * Features rounded corners, emerald focus ring, and proper accessibility.
 * Minimum 48px height for mobile touch targets.
 */

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Optional error state
   */
  error?: boolean;
  /**
   * Optional error message
   */
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-xl border-2 bg-white px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all min-h-[48px]',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-gray-300 hover:border-emerald-400',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1.5 text-sm text-red-500 font-medium">{errorMessage}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

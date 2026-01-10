/**
 * OTP Input Component
 *
 * 6-digit OTP input with auto-focus, auto-submit, and paste support.
 * Mobile-friendly with large touch targets and clear visual feedback.
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
}

const OTPInput = React.forwardRef<HTMLDivElement, OTPInputProps>(
  ({ value, onChange, onComplete, length = 6, disabled = false, error = false }, ref) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    // Initialize refs array
    React.useEffect(() => {
      inputRefs.current = inputRefs.current.slice(0, length);
    }, [length]);

    // Auto-submit when complete
    React.useEffect(() => {
      if (value.length === length && onComplete) {
        onComplete(value);
      }
    }, [value, length, onComplete]);

    const handleChange = (index: number, digit: string) => {
      // Only allow digits
      if (digit && !/^\d$/.test(digit)) {
        return;
      }

      const newValue = value.split('');
      newValue[index] = digit;
      const updatedValue = newValue.join('').slice(0, length);

      onChange(updatedValue);

      // Auto-focus next input
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace
      if (e.key === 'Backspace') {
        e.preventDefault();

        const newValue = value.split('');

        if (newValue[index]) {
          // Clear current digit
          newValue[index] = '';
          onChange(newValue.join(''));
        } else if (index > 0) {
          // Move to previous input and clear it
          newValue[index - 1] = '';
          onChange(newValue.join(''));
          inputRefs.current[index - 1]?.focus();
        }
      }

      // Handle left arrow
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }

      // Handle right arrow
      if (e.key === 'ArrowRight' && index < length - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('text/plain');
      const digits = pasteData.replace(/\D/g, '').slice(0, length);

      if (digits) {
        onChange(digits);
        // Focus the last filled input or the next empty one
        const nextIndex = Math.min(digits.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
      }
    };

    const handleFocus = (index: number) => {
      // Select the input content on focus
      inputRefs.current[index]?.select();
    };

    return (
      <div ref={ref} className="flex gap-3 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={el => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={cn(
              'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              error
                ? 'border-red-500 text-red-600 focus:ring-red-500 bg-red-50'
                : value[index]
                ? 'border-emerald-500 text-emerald-600 focus:ring-emerald-500 bg-emerald-50'
                : 'border-gray-300 text-gray-900 focus:ring-emerald-500 bg-white hover:border-emerald-400',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
    );
  }
);

OTPInput.displayName = 'OTPInput';

export { OTPInput };

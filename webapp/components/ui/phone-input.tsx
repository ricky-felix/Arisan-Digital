/**
 * Phone Input Component
 *
 * Indonesian phone number input with automatic formatting and validation.
 * Formats as user types: +62 XXX-XXXX-XXXX
 * Validates Indonesian phone number format.
 */

'use client';

import * as React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  errorMessage?: string;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, error, errorMessage, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    // Format phone number for display
    React.useEffect(() => {
      if (!value) {
        setDisplayValue('');
        return;
      }

      // Remove all non-digit characters
      let cleaned = value.replace(/\D/g, '');

      // Handle numbers starting with 0
      if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
      }

      // Add country code if missing
      if (!cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
      }

      // Format: +62 XXX-XXXX-XXXX
      const countryCode = '62';
      const areaCode = cleaned.slice(2, 5); // 3 digits
      const firstPart = cleaned.slice(5, 9); // 4 digits
      const secondPart = cleaned.slice(9, 13); // 4 digits

      let formatted = `+${countryCode}`;

      if (areaCode) {
        formatted += ` ${areaCode}`;
      }

      if (firstPart) {
        formatted += `-${firstPart}`;
      }

      if (secondPart) {
        formatted += `-${secondPart}`;
      }

      setDisplayValue(formatted);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;

      // Remove all non-digit characters
      let cleaned = input.replace(/\D/g, '');

      // Handle numbers starting with 0
      if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.slice(1);
      }

      // Add country code if missing and there are digits
      if (cleaned && !cleaned.startsWith('62')) {
        cleaned = '62' + cleaned;
      }

      // Limit to 13 digits (62 + 11 digits max)
      cleaned = cleaned.slice(0, 13);

      // Update the raw value
      onChange(cleaned);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow backspace to clear the +62 prefix
      if (e.key === 'Backspace' && value.length <= 2) {
        onChange('');
        e.preventDefault();
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          placeholder="+62 812-3456-7890"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          error={error}
          errorMessage={errorMessage}
          className={cn('font-mono text-base', className)}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };

/**
 * Group Form Component
 *
 * A comprehensive form for creating/editing arisan groups.
 * Features React Hook Form with Zod validation, currency input,
 * and Indonesian date picker.
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import type { Frequency } from '@/lib/types/database';

// Validation schema
const groupFormSchema = z.object({
  name: z
    .string()
    .min(3, 'Nama arisan minimal 3 karakter')
    .max(50, 'Nama arisan maksimal 50 karakter'),
  contribution_amount: z
    .number({
      required_error: 'Jumlah iuran wajib diisi',
      invalid_type_error: 'Jumlah iuran harus berupa angka',
    })
    .min(10000, 'Jumlah iuran minimal Rp 10.000')
    .max(100000000, 'Jumlah iuran maksimal Rp 100.000.000'),
  frequency: z.enum(['weekly', 'monthly'], {
    required_error: 'Frekuensi wajib dipilih',
  }),
  member_count: z
    .number({
      required_error: 'Jumlah anggota wajib diisi',
      invalid_type_error: 'Jumlah anggota harus berupa angka',
    })
    .int('Jumlah anggota harus bilangan bulat')
    .min(2, 'Minimal 2 anggota')
    .max(20, 'Maksimal 20 anggota'),
  start_date: z
    .string({
      required_error: 'Tanggal mulai wajib diisi',
    })
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Tanggal mulai tidak boleh di masa lalu'),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;

interface GroupFormProps {
  /**
   * Initial values for editing
   */
  defaultValues?: Partial<GroupFormData>;
  /**
   * Callback when form is submitted
   */
  onSubmit: (data: GroupFormData) => void | Promise<void>;
  /**
   * Whether the form is submitting
   */
  isSubmitting?: boolean;
  /**
   * Submit button text
   */
  submitText?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function GroupForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitText = 'Buat Arisan',
  className,
}: GroupFormProps) {
  const [contributionDisplay, setContributionDisplay] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      contribution_amount: defaultValues?.contribution_amount || undefined,
      frequency: defaultValues?.frequency || 'monthly',
      member_count: defaultValues?.member_count || 10,
      start_date: defaultValues?.start_date || '',
    },
  });

  const frequency = watch('frequency');
  const memberCount = watch('member_count');
  const contributionAmount = watch('contribution_amount');

  // Initialize display value
  React.useEffect(() => {
    if (defaultValues?.contribution_amount) {
      setContributionDisplay(
        formatCurrency(defaultValues.contribution_amount).replace('Rp ', '')
      );
    }
  }, [defaultValues?.contribution_amount]);

  // Handle currency input
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = value ? parseInt(value, 10) : 0;

    setValue('contribution_amount', numericValue, { shouldValidate: true });

    if (value) {
      const formatted = formatCurrency(numericValue).replace('Rp ', '');
      setContributionDisplay(formatted);
    } else {
      setContributionDisplay('');
    }
  };

  // Calculate total payout
  const totalPayout = contributionAmount && memberCount ? contributionAmount * memberCount : 0;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* Group Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Nama Arisan <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Contoh: Arisan Keluarga"
          error={!!errors.name}
          errorMessage={errors.name?.message}
          {...register('name')}
        />
        <p className="text-xs text-neutral-500">
          Kasih nama yang mudah diingat ya!
        </p>
      </div>

      {/* Contribution Amount */}
      <div className="space-y-2">
        <Label htmlFor="contribution_amount">
          Iuran per Putaran <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
            Rp
          </span>
          <Input
            id="contribution_amount"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={contributionDisplay}
            onChange={handleCurrencyChange}
            error={!!errors.contribution_amount}
            errorMessage={errors.contribution_amount?.message}
            className="pl-12"
          />
        </div>
        {totalPayout > 0 && (
          <p className="text-xs text-emerald-600 font-medium">
            Total yang didapat pemenang: {formatCurrency(totalPayout)}
          </p>
        )}
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <Label htmlFor="frequency">
          Frekuensi Arisan <span className="text-red-500">*</span>
        </Label>
        <Select
          value={frequency}
          onValueChange={(value) =>
            setValue('frequency', value as Frequency, { shouldValidate: true })
          }
        >
          <SelectTrigger id="frequency" className={errors.frequency ? 'border-red-500' : ''}>
            <SelectValue placeholder="Pilih frekuensi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Mingguan</SelectItem>
            <SelectItem value="monthly">Bulanan</SelectItem>
          </SelectContent>
        </Select>
        {errors.frequency && (
          <p className="text-sm text-red-500 font-medium">
            {errors.frequency.message}
          </p>
        )}
      </div>

      {/* Member Count */}
      <div className="space-y-2">
        <Label htmlFor="member_count">
          Jumlah Anggota <span className="text-red-500">*</span>
        </Label>
        <Input
          id="member_count"
          type="number"
          min="2"
          max="20"
          placeholder="10"
          error={!!errors.member_count}
          errorMessage={errors.member_count?.message}
          {...register('member_count', { valueAsNumber: true })}
        />
        <p className="text-xs text-neutral-500">
          Minimal 2, maksimal 20 anggota
        </p>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label htmlFor="start_date">
          Tanggal Mulai <span className="text-red-500">*</span>
        </Label>
        <Input
          id="start_date"
          type="date"
          error={!!errors.start_date}
          errorMessage={errors.start_date?.message}
          {...register('start_date')}
          min={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-neutral-500">
          Arisan akan mulai pada tanggal ini
        </p>
      </div>

      {/* Duration Info */}
      {memberCount > 0 && frequency && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <h4 className="font-semibold text-emerald-900 mb-1">
            Perkiraan Durasi
          </h4>
          <p className="text-sm text-emerald-700">
            Arisan akan selesai dalam{' '}
            <span className="font-semibold">
              {frequency === 'weekly'
                ? `${memberCount} minggu`
                : `${memberCount} bulan`}
            </span>
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="casual"
        className="w-full"
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? 'Memproses...' : submitText}
      </Button>
    </form>
  );
}

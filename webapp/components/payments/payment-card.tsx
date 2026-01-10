/**
 * Payment Card Component
 *
 * Displays a payment item with group name, round number, amount,
 * status badge, deadline countdown, and quick actions.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { PaymentStatus } from '@/lib/types/database';

interface PaymentCardProps {
  roundId: string;
  groupName: string;
  roundNumber: number;
  amount: number;
  status: PaymentStatus;
  deadline: string;
  isPaid?: boolean;
}

/**
 * Calculates the time remaining until deadline
 */
function getTimeRemaining(deadline: string): {
  text: string;
  isOverdue: boolean;
  isUrgent: boolean;
} {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff < 0) {
    return { text: 'Terlambat', isOverdue: true, isUrgent: false };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days === 0 && hours < 24) {
    return { text: `${hours} jam lagi`, isOverdue: false, isUrgent: true };
  }

  if (days === 0) {
    return { text: 'Hari ini', isOverdue: false, isUrgent: true };
  }

  if (days === 1) {
    return { text: 'Besok', isOverdue: false, isUrgent: true };
  }

  return { text: `${days} hari lagi`, isOverdue: false, isUrgent: days <= 3 };
}

/**
 * Gets the appropriate badge variant for payment status
 */
function getStatusBadge(status: PaymentStatus): {
  variant: 'success' | 'warning' | 'destructive' | 'default';
  text: string;
  icon: React.ReactNode;
} {
  switch (status) {
    case 'paid':
      return {
        variant: 'success',
        text: 'Lunas',
        icon: <CheckCircle2 className="h-3 w-3" />,
      };
    case 'late':
      return {
        variant: 'destructive',
        text: 'Terlambat',
        icon: <AlertCircle className="h-3 w-3" />,
      };
    case 'pending':
    default:
      return {
        variant: 'warning',
        text: 'Menunggu',
        icon: <Clock className="h-3 w-3" />,
      };
  }
}

export function PaymentCard({
  roundId,
  groupName,
  roundNumber,
  amount,
  status,
  deadline,
  isPaid = false,
}: PaymentCardProps) {
  const timeRemaining = getTimeRemaining(deadline);
  const statusBadge = getStatusBadge(status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{groupName}</CardTitle>
            <CardDescription>Round {roundNumber}</CardDescription>
          </div>
          <Badge variant={statusBadge.variant} className="gap-1">
            {statusBadge.icon}
            {statusBadge.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Amount */}
        <div>
          <p className="text-sm text-neutral-600">Jumlah Iuran</p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(amount)}
          </p>
        </div>

        {/* Deadline */}
        {!isPaid && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 ${
              timeRemaining.isOverdue
                ? 'bg-red-50 text-red-700'
                : timeRemaining.isUrgent
                ? 'bg-amber-50 text-amber-700'
                : 'bg-neutral-50 text-neutral-700'
            }`}
          >
            <Clock
              className={`h-4 w-4 ${
                timeRemaining.isOverdue
                  ? 'text-red-500'
                  : timeRemaining.isUrgent
                  ? 'text-amber-500'
                  : 'text-neutral-500'
              }`}
            />
            <div className="flex-1">
              <p className="text-xs font-medium">Batas Waktu</p>
              <p className="text-sm font-semibold">{timeRemaining.text}</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {isPaid ? (
          <Button variant="outline" className="w-full" disabled>
            Sudah Dibayar
          </Button>
        ) : (
          <Button asChild className="w-full gap-2">
            <Link href={`/dashboard/payments/submit/${roundId}`}>
              Bayar Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

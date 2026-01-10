/**
 * Group Card Component
 *
 * Displays a summary of an arisan group with key information.
 * Features:
 * - Group name and status
 * - Member avatars (max 5 shown, +X more indicator)
 * - Next round information
 * - Payment status badge
 * - Contribution amount
 * - Click to view details
 *
 * Gen Z aesthetic with emerald green accents and smooth animations.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, Coins, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatCurrency, formatDate, getInitials } from '@/lib/utils';
import type { Group, User } from '@/lib/types/database';

interface GroupCardProps {
  /**
   * Group data
   */
  group: Group;
  /**
   * Array of group members for avatar display
   */
  members?: User[];
  /**
   * Next payment deadline
   */
  nextPaymentDate?: string | null;
  /**
   * Current user's payment status for next round
   */
  paymentStatus?: 'pending' | 'paid' | 'late';
  /**
   * Additional CSS classes
   */
  className?: string;
}

const statusConfig = {
  active: {
    variant: 'default' as const,
    label: 'Aktif',
  },
  completed: {
    variant: 'secondary' as const,
    label: 'Selesai',
  },
  paused: {
    variant: 'outline' as const,
    label: 'Dijeda',
  },
};

const paymentStatusConfig = {
  pending: {
    variant: 'warning' as const,
    label: 'Menunggu Bayar',
  },
  paid: {
    variant: 'success' as const,
    label: 'Lunas',
  },
  late: {
    variant: 'destructive' as const,
    label: 'Terlambat',
  },
};

export function GroupCard({
  group,
  members = [],
  nextPaymentDate,
  paymentStatus = 'pending',
  className,
}: GroupCardProps) {
  const maxAvatarsShown = 5;
  const visibleMembers = members.slice(0, maxAvatarsShown);
  const remainingCount = Math.max(0, members.length - maxAvatarsShown);

  const statusInfo = statusConfig[group.status];
  const paymentInfo = paymentStatusConfig[paymentStatus];

  return (
    <Link href={`/dashboard/groups/${group.id}`}>
      <Card
        className={cn(
          'cursor-pointer transition-all duration-200',
          'hover:shadow-xl hover:-translate-y-1',
          'active:translate-y-0 active:shadow-lg',
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{group.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Users className="w-3.5 h-3.5" />
                <span>{group.member_count} anggota</span>
              </CardDescription>
            </div>
            <Badge variant={statusInfo.variant} className="shrink-0">
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Member Avatars */}
          {members.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {visibleMembers.map((member, index) => (
                  <Avatar
                    key={member.id}
                    className="h-8 w-8 border-2 border-white shadow-sm"
                    style={{ zIndex: maxAvatarsShown - index }}
                  >
                    <AvatarImage
                      src={member.profile_picture_url || undefined}
                      alt={member.full_name}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(member.full_name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {remainingCount > 0 && (
                  <div
                    className="h-8 w-8 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center shadow-sm"
                    style={{ zIndex: 0 }}
                  >
                    <span className="text-xs font-semibold text-neutral-700">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contribution Amount */}
          <div className="flex items-center gap-2 text-sm">
            <div className="p-2 rounded-lg bg-primary-50">
              <Coins className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-neutral-500">Iuran per putaran</p>
              <p className="font-semibold text-neutral-900">
                {formatCurrency(group.contribution_amount)}
              </p>
            </div>
          </div>

          {/* Next Payment Date & Status */}
          {nextPaymentDate && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-neutral-500" />
                <div>
                  <p className="text-xs text-neutral-500">Bayar sebelum</p>
                  <p className="font-medium text-neutral-900">
                    {formatDate(nextPaymentDate)}
                  </p>
                </div>
              </div>
              <Badge variant={paymentInfo.variant} className="shrink-0">
                {paymentInfo.label}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

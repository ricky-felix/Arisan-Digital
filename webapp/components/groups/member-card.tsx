/**
 * Member Card Component
 *
 * Displays a group member with avatar, name, role, and payment stats.
 * Includes admin action dropdown for admins.
 */

'use client';

import * as React from 'react';
import { MoreVertical, Crown, UserMinus, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, getInitials } from '@/lib/utils';
import type { User } from '@/lib/types/database';

interface MemberCardProps {
  /**
   * User information
   */
  user: User;
  /**
   * Whether the user is an admin
   */
  isAdmin: boolean;
  /**
   * Number of payments made
   */
  paymentsMade?: number;
  /**
   * Total number of rounds
   */
  totalRounds?: number;
  /**
   * Whether the current user can perform admin actions
   */
  canManage?: boolean;
  /**
   * Callback when remove member is clicked
   */
  onRemove?: (userId: string) => void;
  /**
   * Callback when promote to admin is clicked
   */
  onPromote?: (userId: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function MemberCard({
  user,
  isAdmin,
  paymentsMade = 0,
  totalRounds = 0,
  canManage = false,
  onRemove,
  onPromote,
  className,
}: MemberCardProps) {
  const paymentRate = totalRounds > 0 ? Math.round((paymentsMade / totalRounds) * 100) : 0;

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar and Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage
                src={user.profile_picture_url || undefined}
                alt={user.full_name}
              />
              <AvatarFallback className="text-sm font-semibold bg-emerald-100 text-emerald-700">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-neutral-900 truncate">
                  {user.full_name}
                </h4>
                {isAdmin && (
                  <Badge variant="default" className="shrink-0 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>

              {totalRounds > 0 && (
                <div className="text-sm text-neutral-600">
                  <span className="font-medium">{paymentsMade}</span>/{totalRounds} putaran
                  <span className="mx-2">•</span>
                  <span
                    className={cn(
                      'font-medium',
                      paymentRate >= 80
                        ? 'text-green-600'
                        : paymentRate >= 50
                        ? 'text-amber-600'
                        : 'text-red-600'
                    )}
                  >
                    {paymentRate}% lunas
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Actions */}
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Opsi anggota</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isAdmin && onPromote && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onPromote(user.id)}
                      className="cursor-pointer"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Jadikan Admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {onRemove && (
                  <DropdownMenuItem
                    onClick={() => onRemove(user.id)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Hapus Anggota
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

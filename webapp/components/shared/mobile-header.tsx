/**
 * Mobile Header Component
 *
 * Mobile-optimized header with app logo, notifications, and user menu.
 * Features a clean, Gen Z aesthetic with emerald green accents.
 * Responsive design that adapts to different screen sizes.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, getInitials } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface MobileHeaderProps {
  /**
   * User's full name for avatar fallback
   */
  userName?: string;
  /**
   * User's profile picture URL
   */
  userAvatar?: string | null;
  /**
   * Number of unread notifications
   */
  notificationCount?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function MobileHeader({
  userName = 'User',
  userAvatar,
  notificationCount = 0,
  className,
}: MobileHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error('Gagal keluar', {
          description: 'Coba lagi ya!',
        });
        return;
      }

      toast.success('Berhasil keluar', {
        description: 'Sampai jumpa lagi!',
      });

      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Terjadi kesalahan');
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-sticky bg-white border-b border-neutral-200',
        'px-4 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        {/* App Logo/Title */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-neutral-900 leading-none">
              Arisan Digital
            </span>
            <span className="text-xs text-neutral-500 leading-none mt-0.5">
              Kelola arisan mu
            </span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <Link
            href="/dashboard/notifications"
            className="relative p-2 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
            aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
          >
            <Bell className="w-6 h-6 text-neutral-700" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Link>

          {/* User Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                aria-label="User menu"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userAvatar || undefined} alt={userName} />
                  <AvatarFallback className="text-xs">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-neutral-500">
                    Menu Akun
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profil Saya</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

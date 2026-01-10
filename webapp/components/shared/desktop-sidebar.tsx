/**
 * Desktop Sidebar Component
 *
 * Desktop navigation sidebar with user profile, main navigation links, and logout.
 * Features emerald green accents and smooth hover effects.
 * Hidden on mobile (shown only on md breakpoint and above).
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Wallet, User, LogOut, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn, getInitials, formatPhone } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/dashboard/groups',
    label: 'Groups',
    icon: Users,
  },
  {
    href: '/dashboard/payments',
    label: 'Payments',
    icon: Wallet,
  },
  {
    href: '/dashboard/profile',
    label: 'Profile',
    icon: User,
  },
];

interface DesktopSidebarProps {
  /**
   * User's full name
   */
  userName?: string;
  /**
   * User's profile picture URL
   */
  userAvatar?: string | null;
  /**
   * User's phone number
   */
  userPhone?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function DesktopSidebar({
  userName = 'User',
  userAvatar,
  userPhone,
  className,
}: DesktopSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'w-64 min-h-screen bg-white border-r border-neutral-200 flex-col',
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-neutral-200">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-neutral-900 leading-none">
                Arisan Digital
              </span>
              <span className="text-xs text-neutral-500 leading-none mt-1">
                Kelola arisan mu
              </span>
            </div>
          </Link>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={userAvatar || undefined} alt={userName} />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-900 truncate">
                {userName}
              </p>
              {userPhone && (
                <p className="text-xs text-neutral-500 truncate">
                  {formatPhone(userPhone)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4" role="navigation" aria-label="Main navigation">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl',
                      'transition-all duration-200 ease-out',
                      'hover:bg-primary-50',
                      active
                        ? 'bg-primary-100 text-primary-700 font-semibold shadow-sm'
                        : 'text-neutral-700 hover:text-primary-700'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-colors',
                        active ? 'text-primary-600' : 'text-neutral-500'
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-200 space-y-2">
          {/* Notifications */}
          <Link
            href="/dashboard/notifications"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
          >
            <Bell className="w-5 h-5 text-neutral-500" aria-hidden="true" />
            <span>Notifications</span>
          </Link>

          {/* Logout */}
          <form action="/auth/signout" method="post">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-3 text-error hover:bg-error-light hover:text-error"
            >
              <LogOut className="w-5 h-5" aria-hidden="true" />
              <span>Keluar</span>
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}

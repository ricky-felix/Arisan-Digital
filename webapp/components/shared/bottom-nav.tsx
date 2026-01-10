/**
 * Bottom Navigation Component
 *
 * Mobile-only bottom navigation bar with 4 main tabs.
 * Features smooth transitions, emerald green active states, and Gen Z aesthetic.
 * Hidden on desktop (md breakpoint and above).
 *
 * Tabs:
 * - Home (Dashboard)
 * - Groups (Group List)
 * - Payments (Payment History)
 * - Profile (User Profile)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-fixed bg-white border-t border-neutral-200 md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full',
                'transition-all duration-200 ease-out',
                'rounded-xl',
                'hover:bg-primary-50',
                active && 'bg-primary-50'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-colors duration-200',
                  active ? 'text-primary-600' : 'text-neutral-500'
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-200',
                  active ? 'text-primary-600' : 'text-neutral-600'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

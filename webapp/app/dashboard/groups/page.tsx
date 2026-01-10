/**
 * Groups List Page
 *
 * Displays all arisan groups the user is a member of.
 * Features filtering by status, search, and empty state.
 */

import * as React from 'react';
import type { Metadata } from 'next';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GroupsListClient } from './groups-list-client';
import { createClient } from '@/lib/supabase/server';
import { getUserGroups, getGroupMembers } from '@/lib/supabase/queries';

export const metadata: Metadata = {
  title: 'Arisan Saya',
  description: 'Kelola semua arisan yang kamu ikuti',
};

export default async function GroupsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Arisan Saya
          </h1>
          <p className="text-neutral-600">
            Login dulu buat lihat arisan kamu
          </p>
        </div>
      </div>
    );
  }

  // Fetch user's groups
  const { data: groups, error } = await getUserGroups(user.id);

  // Fetch members for each group (for avatar display)
  const groupsWithMembers = await Promise.all(
    (groups || []).map(async (group) => {
      const { data: members } = await getGroupMembers(group.id);
      return {
        ...group,
        members: (members || []).map((m) => m.user),
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Arisan Saya
          </h1>
          <p className="text-neutral-600">
            Kelola semua arisan yang kamu ikuti
          </p>
        </div>
        <Link href="/dashboard/groups/create">
          <Button variant="casual" className="shrink-0">
            <Plus className="mr-2 h-5 w-5" />
            Buat Arisan
          </Button>
        </Link>
      </div>

      {/* Client-side filtering and display */}
      <GroupsListClient
        groups={groupsWithMembers}
        error={error?.message}
      />
    </div>
  );
}

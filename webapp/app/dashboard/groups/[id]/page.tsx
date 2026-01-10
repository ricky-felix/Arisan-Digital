/**
 * Group Detail Page
 *
 * Displays comprehensive information about an arisan group.
 * Features: Overview, Members, Rounds, and Settings tabs.
 */

import * as React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getGroupDetails,
  getGroupMembers,
  isGroupAdmin,
} from '@/lib/supabase/queries';
import { GroupDetailClient } from './group-detail-client';

interface GroupDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: GroupDetailPageProps): Promise<Metadata> {
  const { id } = params;
  const { data: group } = await getGroupDetails(id);

  return {
    title: group?.name || 'Detail Arisan',
    description: `Informasi lengkap tentang arisan ${group?.name || ''}`,
  };
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { id } = params;
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
            Detail Arisan
          </h1>
          <p className="text-neutral-600">
            Login dulu buat lihat detail arisan
          </p>
        </div>
      </div>
    );
  }

  // Fetch group details
  const { data: group, error: groupError } = await getGroupDetails(id);

  if (groupError || !group) {
    notFound();
  }

  // Fetch group members
  const { data: members } = await getGroupMembers(id);

  // Check if user is admin
  const { data: isAdmin } = await isGroupAdmin(id, user.id);

  // Fetch rounds (if rounds table exists)
  const { data: rounds } = await supabase
    .from('rounds')
    .select('*')
    .eq('group_id', id)
    .order('round_number', { ascending: false });

  return (
    <GroupDetailClient
      group={group}
      members={members || []}
      rounds={rounds || []}
      currentUserId={user.id}
      isAdmin={isAdmin || false}
    />
  );
}

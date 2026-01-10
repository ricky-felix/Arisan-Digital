/**
 * Groups List Client Component
 *
 * Client-side component for filtering and searching groups.
 * Handles tabs, search, and empty states.
 */

'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Search, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GroupCard } from '@/components/groups/group-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Group, User, GroupStatus } from '@/lib/types/database';

interface GroupWithMembers extends Group {
  members: User[];
}

interface GroupsListClientProps {
  groups: GroupWithMembers[];
  error?: string;
}

export function GroupsListClient({ groups, error }: GroupsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | GroupStatus>('all');

  // Filter groups based on search and tab
  const filteredGroups = useMemo(() => {
    let filtered = groups;

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((group) => group.status === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((group) =>
        group.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [groups, activeTab, searchQuery]);

  // Count groups by status
  const statusCounts = useMemo(() => {
    return {
      all: groups.length,
      active: groups.filter((g) => g.status === 'active').length,
      completed: groups.filter((g) => g.status === 'completed').length,
      paused: groups.filter((g) => g.status === 'paused').length,
    };
  }, [groups]);

  // Show error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 font-medium">
            Gagal memuat arisan. Coba refresh halaman ya!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no groups
  if (groups.length === 0) {
    return (
      <Card className="border-dashed border-2 border-neutral-300 bg-neutral-50">
        <CardContent className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <Inbox className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900">
              Belum ikut arisan nih!
            </h3>
            <p className="text-neutral-600">
              Yuk gabung atau buat arisan baru buat mulai patungan bareng teman-teman
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Link href="/dashboard/groups/create">
                <Button variant="casual" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Buat Arisan Baru
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all">
            Semua ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="active">
            Aktif ({statusCounts.active})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Selesai ({statusCounts.completed})
          </TabsTrigger>
          {statusCounts.paused > 0 && (
            <TabsTrigger value="paused">
              Dijeda ({statusCounts.paused})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Search Bar */}
        <div className="pt-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              type="search"
              placeholder="Cari nama arisan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>

        {/* Groups Grid */}
        <TabsContent value={activeTab} className="mt-6">
          {filteredGroups.length === 0 ? (
            <Card className="border-dashed border-2 border-neutral-300 bg-neutral-50">
              <CardContent className="p-8 text-center">
                <p className="text-neutral-600">
                  {searchQuery.trim()
                    ? `Nggak ada arisan dengan nama "${searchQuery}"`
                    : `Belum ada arisan ${
                        activeTab === 'active'
                          ? 'aktif'
                          : activeTab === 'completed'
                          ? 'selesai'
                          : 'dijeda'
                      }`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  members={group.members}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Import Plus icon
import { Plus } from 'lucide-react';

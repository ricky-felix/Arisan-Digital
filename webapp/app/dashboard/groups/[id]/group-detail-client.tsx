/**
 * Group Detail Client Component
 *
 * Client-side component for displaying group details with tabs.
 * Handles state management and user interactions.
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Users,
  Coins,
  Calendar,
  Settings,
  Share2,
  Clock,
  TrendingUp,
  AlertCircle,
  LogOut,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemberCard } from '@/components/groups/member-card';
import { InviteDialog } from '@/components/groups/invite-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  leaveGroupAction,
  removeMemberAction,
  promoteMemberAction,
  generateInviteLinkAction,
} from '@/app/actions/groups';
import { toast } from 'sonner';
import { formatCurrency, formatDate, formatFrequency } from '@/lib/utils';
import type { Group, GroupMemberWithUser, Round } from '@/lib/types/database';

interface GroupDetailClientProps {
  group: Group;
  members: GroupMemberWithUser[];
  rounds: Round[];
  currentUserId: string;
  isAdmin: boolean;
}

export function GroupDetailClient({
  group,
  members,
  rounds,
  currentUserId,
  isAdmin,
}: GroupDetailClientProps) {
  const router = useRouter();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate invite link
  const handleShare = async () => {
    const result = await generateInviteLinkAction(group.id);
    if (result.success && result.data?.inviteUrl) {
      setInviteUrl(result.data.inviteUrl);
      setShowInviteDialog(true);
    } else {
      toast.error(result.error || 'Gagal membuat link undangan');
    }
  };

  // Handle remove member
  const handleRemoveMember = async (userId: string) => {
    setIsLoading(true);
    const result = await removeMemberAction(group.id, userId);
    setIsLoading(false);

    if (result.success) {
      toast.success('Anggota berhasil dihapus');
      router.refresh();
    } else {
      toast.error(result.error || 'Gagal menghapus anggota');
    }
  };

  // Handle promote member
  const handlePromoteMember = async (userId: string) => {
    setIsLoading(true);
    const result = await promoteMemberAction(group.id, userId);
    setIsLoading(false);

    if (result.success) {
      toast.success('Anggota berhasil dijadikan admin');
      router.refresh();
    } else {
      toast.error(result.error || 'Gagal menjadikan admin');
    }
  };

  // Handle leave group
  const handleLeaveGroup = async () => {
    setIsLoading(true);
    const result = await leaveGroupAction(group.id);
    setIsLoading(false);

    if (result.success) {
      toast.success('Berhasil keluar dari arisan');
      router.push('/dashboard/groups');
    } else {
      toast.error(result.error || 'Gagal keluar dari arisan');
    }
  };

  const statusConfig = {
    active: { variant: 'default' as const, label: 'Aktif' },
    completed: { variant: 'secondary' as const, label: 'Selesai' },
    paused: { variant: 'outline' as const, label: 'Dijeda' },
  };

  const statusInfo = statusConfig[group.status];

  // Calculate stats
  const totalContributed = rounds.length * group.contribution_amount * members.length;
  const completedRounds = rounds.filter((r) => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/groups">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Daftar
        </Button>
      </Link>

      {/* Group Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-neutral-900 truncate">
                  {group.name}
                </h1>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  <span>{formatCurrency(group.contribution_amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatFrequency(group.frequency)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {members.length}/{group.member_count} anggota
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Mulai {formatDate(group.start_date)}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Undang
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="members">
            Anggota ({members.length})
          </TabsTrigger>
          <TabsTrigger value="rounds">
            Ronde ({rounds.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Pengaturan
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">
                  Total Terkumpul
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(totalContributed)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">
                  Ronde Selesai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neutral-900">
                  {completedRounds} / {group.member_count}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">
                  Payout per Pemenang
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  {formatCurrency(group.contribution_amount * group.member_count)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Round Info */}
          {group.status === 'active' && (
            <Card>
              <CardHeader>
                <CardTitle>Ronde Saat Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-neutral-600">
                    Fitur ronde akan segera hadir!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Warning if not enough members */}
          {members.length < group.member_count && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Anggota Belum Lengkap
                    </h4>
                    <p className="text-sm text-amber-700">
                      Arisan butuh {group.member_count - members.length} anggota lagi
                      buat bisa dimulai. Yuk undang teman-teman!
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="shrink-0"
                  >
                    Undang
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                user={member.user}
                isAdmin={member.is_admin}
                canManage={isAdmin && member.user_id !== currentUserId}
                onRemove={handleRemoveMember}
                onPromote={handlePromoteMember}
              />
            ))}
          </div>
        </TabsContent>

        {/* Rounds Tab */}
        <TabsContent value="rounds" className="space-y-4">
          {rounds.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  Belum Ada Ronde
                </h3>
                <p className="text-neutral-600">
                  Ronde pertama akan dimulai setelah semua anggota join
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rounds.map((round) => (
                <Card key={round.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-neutral-900">
                          Ronde {round.round_number}
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Deadline: {formatDate(round.payment_deadline)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          round.status === 'completed' ? 'success' : 'warning'
                        }
                      >
                        {round.status === 'completed' ? 'Selesai' : 'Berlangsung'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Grup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAdmin && (
                <>
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Detail Arisan
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Arisan
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-600"
                onClick={() => setShowLeaveDialog(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar dari Arisan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <InviteDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        inviteUrl={inviteUrl}
        groupName={group.name}
      />

      {/* Leave Confirmation Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluar dari Arisan?</DialogTitle>
            <DialogDescription>
              Kamu yakin mau keluar dari arisan {group.name}? Aksi ini tidak bisa
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLeaveDialog(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveGroup}
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Ya, Keluar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

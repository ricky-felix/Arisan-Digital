/**
 * Round Server Actions
 *
 * Server-side actions for managing arisan rounds, including creation,
 * completion, and winner selection.
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { RoundStatus, PaymentStatus } from '@/lib/types/database';

/**
 * Creates a new round for a group (admin only)
 *
 * @param groupId - The group ID to create a round for
 * @returns Object with success status and optional error message
 */
export async function createRound(
  groupId: string
): Promise<{ success: boolean; error?: string; roundId?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Unauthorized. Please login.' };
    }

    // Check if user is admin of this group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('is_admin')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership?.is_admin) {
      return { success: false, error: 'Hanya admin yang dapat membuat round baru' };
    }

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, frequency, member_count, contribution_amount')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      return { success: false, error: 'Grup tidak ditemukan' };
    }

    // Get the latest round number
    const { data: latestRound } = await supabase
      .from('rounds')
      .select('round_number')
      .eq('group_id', groupId)
      .order('round_number', { ascending: false })
      .limit(1)
      .single();

    const nextRoundNumber = latestRound ? latestRound.round_number + 1 : 1;

    // Calculate payment deadline based on frequency
    const deadline = new Date();
    if (group.frequency === 'weekly') {
      deadline.setDate(deadline.getDate() + 7);
    } else {
      deadline.setMonth(deadline.getMonth() + 1);
    }

    // Create new round
    const { data: newRound, error: insertError } = await supabase
      .from('rounds')
      .insert({
        group_id: groupId,
        round_number: nextRoundNumber,
        payment_deadline: deadline.toISOString(),
        status: 'pending' as RoundStatus,
      })
      .select('id')
      .single();

    if (insertError || !newRound) {
      console.error('Create round error:', insertError);
      return { success: false, error: 'Gagal membuat round baru' };
    }

    // Get all group members
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);

    if (membersError || !members || members.length === 0) {
      return { success: false, error: 'Tidak ada anggota dalam grup' };
    }

    // Create payment records for all members
    const payments = members.map((member) => ({
      round_id: newRound.id,
      user_id: member.user_id,
      amount: group.contribution_amount,
      status: 'pending' as PaymentStatus,
    }));

    const { error: paymentsError } = await supabase
      .from('payments')
      .insert(payments);

    if (paymentsError) {
      console.error('Create payments error:', paymentsError);
      return { success: false, error: 'Gagal membuat catatan pembayaran' };
    }

    revalidatePath('/dashboard/groups');
    revalidatePath('/dashboard/payments');
    return { success: true, roundId: newRound.id };
  } catch (error) {
    console.error('Create round error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

/**
 * Completes a round and marks it as finished
 *
 * @param roundId - The round ID to complete
 * @returns Object with success status and optional error message
 */
export async function completeRound(
  roundId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Unauthorized. Please login.' };
    }

    // Get round details
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('id, group_id, winner_id')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return { success: false, error: 'Round tidak ditemukan' };
    }

    // Check if user is admin of this group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('is_admin')
      .eq('group_id', round.group_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership?.is_admin) {
      return { success: false, error: 'Hanya admin yang dapat menyelesaikan round' };
    }

    // Check if winner has been selected
    if (!round.winner_id) {
      return { success: false, error: 'Pemenang harus dipilih terlebih dahulu' };
    }

    // Update round status
    const { error: updateError } = await supabase
      .from('rounds')
      .update({
        status: 'completed' as RoundStatus,
        completed_at: new Date().toISOString(),
      })
      .eq('id', roundId);

    if (updateError) {
      console.error('Complete round error:', updateError);
      return { success: false, error: 'Gagal menyelesaikan round' };
    }

    revalidatePath('/dashboard/groups');
    revalidatePath('/dashboard/payments');
    return { success: true };
  } catch (error) {
    console.error('Complete round error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

/**
 * Selects a winner for a round (random or manual)
 *
 * @param roundId - The round ID
 * @param winnerId - Optional specific winner ID (for manual selection)
 * @returns Object with success status and winner ID
 */
export async function selectWinner(
  roundId: string,
  winnerId?: string
): Promise<{ success: boolean; error?: string; winnerId?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Unauthorized. Please login.' };
    }

    // Get round details
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('id, group_id, winner_id')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return { success: false, error: 'Round tidak ditemukan' };
    }

    // Check if user is admin of this group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('is_admin')
      .eq('group_id', round.group_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership?.is_admin) {
      return { success: false, error: 'Hanya admin yang dapat memilih pemenang' };
    }

    // Check if winner already selected
    if (round.winner_id) {
      return { success: false, error: 'Pemenang sudah dipilih untuk round ini' };
    }

    let selectedWinnerId = winnerId;

    // If no specific winner provided, select randomly
    if (!selectedWinnerId) {
      // Get all group members who haven't won yet
      const { data: previousWinners } = await supabase
        .from('rounds')
        .select('winner_id')
        .eq('group_id', round.group_id)
        .not('winner_id', 'is', null);

      const previousWinnerIds = previousWinners
        ? previousWinners.map((r) => r.winner_id).filter(Boolean)
        : [];

      // Get all group members
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', round.group_id);

      if (membersError || !members || members.length === 0) {
        return { success: false, error: 'Tidak ada anggota dalam grup' };
      }

      // Filter out previous winners
      const eligibleMembers = members.filter(
        (m) => !previousWinnerIds.includes(m.user_id)
      );

      if (eligibleMembers.length === 0) {
        return {
          success: false,
          error: 'Semua anggota sudah pernah menang. Mulai siklus baru?',
        };
      }

      // Randomly select a winner
      const randomIndex = Math.floor(Math.random() * eligibleMembers.length);
      const selectedMember = eligibleMembers[randomIndex];
      if (!selectedMember) {
        return { success: false, error: 'Gagal memilih pemenang' };
      }
      selectedWinnerId = selectedMember.user_id;
    }

    // Verify the selected winner is a group member
    const { data: winnerMembership, error: winnerError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', round.group_id)
      .eq('user_id', selectedWinnerId)
      .single();

    if (winnerError || !winnerMembership) {
      return { success: false, error: 'Pemenang yang dipilih bukan anggota grup' };
    }

    // Update round with winner
    const { error: updateError } = await supabase
      .from('rounds')
      .update({
        winner_id: selectedWinnerId,
      })
      .eq('id', roundId);

    if (updateError) {
      console.error('Select winner error:', updateError);
      return { success: false, error: 'Gagal memilih pemenang' };
    }

    revalidatePath('/dashboard/groups');
    return { success: true, winnerId: selectedWinnerId };
  } catch (error) {
    console.error('Select winner error:', error);
    return { success: false, error: 'Terjadi kesalahan pada server' };
  }
}

/**
 * Gets all payments for a specific round with user details
 *
 * @param roundId - The round ID
 * @returns Round payment status details
 */
export async function getRoundPayments(roundId: string) {
  try {
    const supabase = await createClient();

    const { data: payments, error } = await supabase
      .from('payments')
      .select(
        `
        id,
        user_id,
        amount,
        status,
        paid_at,
        proof_url,
        created_at,
        users(id, full_name, profile_picture_url)
      `
      )
      .eq('round_id', roundId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get round payments error:', error);
      return { data: null, error: error.message };
    }

    return { data: payments, error: null };
  } catch (error) {
    console.error('Get round payments error:', error);
    return { data: null, error: 'Terjadi kesalahan pada server' };
  }
}

/**
 * Gets round details with payments and winner information
 *
 * @param roundId - The round ID
 * @returns Complete round details
 */
export async function getRoundDetails(roundId: string) {
  try {
    const supabase = await createClient();

    const { data: round, error } = await supabase
      .from('rounds')
      .select(
        `
        id,
        round_number,
        payment_deadline,
        status,
        completed_at,
        created_at,
        groups(
          id,
          name,
          contribution_amount,
          frequency,
          member_count
        ),
        users:winner_id(
          id,
          full_name,
          profile_picture_url
        )
      `
      )
      .eq('id', roundId)
      .single();

    if (error) {
      console.error('Get round details error:', error);
      return { data: null, error: error.message };
    }

    return { data: round, error: null };
  } catch (error) {
    console.error('Get round details error:', error);
    return { data: null, error: 'Terjadi kesalahan pada server' };
  }
}

/**
 * Server Actions for Group Management
 *
 * This file contains all server actions for managing arisan groups.
 * All actions use proper error handling and return consistent response types.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createGroup as createGroupQuery,
  updateGroup,
  joinGroup,
  leaveGroup,
  isGroupAdmin,
} from '@/lib/supabase/queries';
import type { GroupInsert, GroupUpdate, Frequency, GroupStatus } from '@/lib/types/database';

/**
 * Action result type for consistent error handling
 */
export type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Creates a new arisan group
 *
 * @param formData - Form data containing group details
 * @returns Result with the created group or error
 */
export async function createGroupAction(
  formData: FormData
): Promise<ActionResult<{ groupId: string }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Kamu harus login dulu',
      };
    }

    // Extract and validate form data
    const name = formData.get('name') as string;
    const contributionAmount = parseFloat(formData.get('contribution_amount') as string);
    const frequency = formData.get('frequency') as Frequency;
    const memberCount = parseInt(formData.get('member_count') as string, 10);
    const startDate = formData.get('start_date') as string;

    // Validate required fields
    if (!name || !contributionAmount || !frequency || !memberCount || !startDate) {
      return {
        success: false,
        error: 'Semua field wajib diisi',
      };
    }

    // Validate ranges
    if (contributionAmount <= 0) {
      return {
        success: false,
        error: 'Jumlah iuran harus lebih dari 0',
      };
    }

    if (memberCount < 2 || memberCount > 20) {
      return {
        success: false,
        error: 'Jumlah anggota harus antara 2-20 orang',
      };
    }

    // Create group
    const groupData: GroupInsert = {
      name,
      contribution_amount: contributionAmount,
      frequency,
      member_count: memberCount,
      start_date: startDate,
      status: 'active',
      created_by: user.id,
    };

    const { data: group, error: createError } = await createGroupQuery(groupData);

    if (createError || !group) {
      console.error('Failed to create group:', createError);
      return {
        success: false,
        error: 'Gagal membuat arisan. Coba lagi ya!',
      };
    }

    // Add creator as admin member
    const { error: joinError } = await joinGroup(group.id, user.id, true);

    if (joinError) {
      console.error('Failed to add creator as member:', joinError);
      // Note: Group was created but creator couldn't join
      // This is a critical error but we still return the group ID
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/groups');

    return {
      success: true,
      data: { groupId: group.id },
    };
  } catch (error) {
    console.error('Unexpected error in createGroupAction:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Coba lagi nanti ya!',
    };
  }
}

/**
 * Updates an existing group's information
 *
 * @param groupId - The UUID of the group to update
 * @param formData - Form data containing updated group details
 * @returns Result indicating success or error
 */
export async function updateGroupAction(
  groupId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Kamu harus login dulu',
      };
    }

    // Check if user is admin
    const { data: isAdmin, error: adminCheckError } = await isGroupAdmin(groupId, user.id);

    if (adminCheckError || !isAdmin) {
      return {
        success: false,
        error: 'Kamu bukan admin grup ini',
      };
    }

    // Extract form data
    const updates: GroupUpdate = {};

    const name = formData.get('name') as string;
    if (name) {
      updates.name = name;
    }

    const contributionAmount = formData.get('contribution_amount') as string;
    if (contributionAmount) {
      const amount = parseFloat(contributionAmount);
      if (amount > 0) {
        updates.contribution_amount = amount;
      }
    }

    const frequency = formData.get('frequency') as Frequency;
    if (frequency) {
      updates.frequency = frequency;
    }

    const status = formData.get('status') as GroupStatus;
    if (status) {
      updates.status = status;
    }

    const startDate = formData.get('start_date') as string;
    if (startDate) {
      updates.start_date = startDate;
    }

    // Update group
    const { error: updateError } = await updateGroup(groupId, updates);

    if (updateError) {
      console.error('Failed to update group:', updateError);
      return {
        success: false,
        error: 'Gagal update arisan. Coba lagi ya!',
      };
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard/groups');
    revalidatePath(`/dashboard/groups/${groupId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error in updateGroupAction:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Coba lagi nanti ya!',
    };
  }
}

/**
 * Allows a user to join a group via invite link
 *
 * @param groupId - The UUID of the group to join
 * @returns Result indicating success or error
 */
export async function joinGroupAction(groupId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Kamu harus login dulu',
      };
    }

    // Join group as regular member
    const { error: joinError } = await joinGroup(groupId, user.id, false);

    if (joinError) {
      console.error('Failed to join group:', joinError);
      return {
        success: false,
        error: 'Gagal gabung grup. Mungkin kamu sudah jadi anggota?',
      };
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/groups');
    revalidatePath(`/dashboard/groups/${groupId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error in joinGroupAction:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Coba lagi nanti ya!',
    };
  }
}

/**
 * Allows a user to leave a group
 *
 * @param groupId - The UUID of the group to leave
 * @returns Result indicating success or error
 */
export async function leaveGroupAction(groupId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Kamu harus login dulu',
      };
    }

    // Leave group
    const { error: leaveError } = await leaveGroup(groupId, user.id);

    if (leaveError) {
      console.error('Failed to leave group:', leaveError);
      return {
        success: false,
        error: 'Gagal keluar dari grup. Coba lagi ya!',
      };
    }

    // Revalidate relevant pages
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/groups');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error in leaveGroupAction:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Coba lagi nanti ya!',
    };
  }
}

/**
 * Removes a member from a group (admin only)
 *
 * @param groupId - The UUID of the group
 * @param userId - The UUID of the user to remove
 * @returns Result indicating success or error
 */
export async function removeMemberAction(
  groupId: string,
  userId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Kamu harus login dulu',
      };
    }

    // Check if current user is admin
    const { data: isAdmin, error: adminCheckError } = await isGroupAdmin(groupId, user.id);

    if (adminCheckError || !isAdmin) {
      return {
        success: false,
        error: 'Kamu bukan admin grup ini',
      };
    }

    // Prevent removing self
    if (userId === user.id) {
      return {
        success: false,
        error: 'Kamu nggak bisa hapus diri sendiri. Gunakan opsi "Keluar dari Grup"',
      };
    }

    // Remove member
    const { error: removeError } = await leaveGroup(groupId, userId);

    if (removeError) {
      console.error('Failed to remove member:', removeError);
      return {
        success: false,
        error: 'Gagal hapus anggota. Coba lagi ya!',
      };
    }

    // Revalidate relevant pages
    revalidatePath(`/dashboard/groups/${groupId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error in removeMemberAction:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Coba lagi nanti ya!',
    };
  }
}

/**
 * Promotes a member to admin status (admin only)
 *
 * @param groupId - The UUID of the group
 * @param userId - The UUID of the user to promote
 * @returns Result indicating success or error
 */
export async function promoteMemberAction(
  groupId: string,
  userId: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Kamu harus login dulu',
      };
    }

    // Check if current user is admin
    const { data: isAdmin, error: adminCheckError } = await isGroupAdmin(groupId, user.id);

    if (adminCheckError || !isAdmin) {
      return {
        success: false,
        error: 'Kamu bukan admin grup ini',
      };
    }

    // Promote member to admin
    const { error: promoteError } = await supabase
      .from('group_members')
      .update({ is_admin: true } as never)
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (promoteError) {
      console.error('Failed to promote member:', promoteError);
      return {
        success: false,
        error: 'Gagal jadikan admin. Coba lagi ya!',
      };
    }

    // Revalidate relevant pages
    revalidatePath(`/dashboard/groups/${groupId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Unexpected error in promoteMemberAction:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Coba lagi nanti ya!',
    };
  }
}

/**
 * Generates an invite link for a group
 *
 * @param groupId - The UUID of the group
 * @returns Result with the invite URL or error
 */
export async function generateInviteLinkAction(
  groupId: string
): Promise<ActionResult<{ inviteUrl: string }>> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Kamu harus login dulu',
      };
    }

    // Check if user is member of the group
    const { data: isMember, error: memberCheckError } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (memberCheckError || !isMember) {
      return {
        success: false,
        error: 'Kamu bukan anggota grup ini',
      };
    }

    // Generate invite URL (using group ID as token for simplicity)
    // In production, you'd want to generate a unique token and store it
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${groupId}`;

    return {
      success: true,
      data: { inviteUrl },
    };
  } catch (error) {
    console.error('Unexpected error in generateInviteLinkAction:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan. Coba lagi nanti ya!',
    };
  }
}

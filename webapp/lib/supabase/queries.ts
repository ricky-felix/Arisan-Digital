/**
 * Database Query Helper Functions
 *
 * This file contains reusable database query functions for common operations.
 * All functions use proper error handling and type safety.
 */

import { createClient } from './server';
import type {
  User,
  UserInsert,
  UserUpdate,
  Group,
  GroupInsert,
  GroupUpdate,
  GroupMember,
  GroupMemberInsert,
  GroupWithMembers,
  GroupMemberWithUser,
  DbResult,
  DbResultArray,
} from '@/lib/types/database';

// =====================================================
// USER QUERIES
// =====================================================

/**
 * Get a user profile by user ID
 *
 * @param userId - The UUID of the user
 * @returns User profile or null if not found
 *
 * @example
 * ```typescript
 * const result = await getUserProfile('123e4567-e89b-12d3-a456-426614174000');
 * if (result.error) {
 *   console.error('Failed to fetch user:', result.error);
 * } else {
 *   console.log('User:', result.data);
 * }
 * ```
 */
export async function getUserProfile(userId: string): Promise<DbResult<User>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get a user profile by phone number
 *
 * @param phoneNumber - The phone number of the user
 * @returns User profile or null if not found
 */
export async function getUserByPhone(phoneNumber: string): Promise<DbResult<User>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error) {
      console.error('Error fetching user by phone:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in getUserByPhone:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Create a new user profile
 *
 * @param userData - User data to insert
 * @returns Newly created user profile
 */
export async function createUserProfile(userData: UserInsert): Promise<DbResult<User>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('users')
      .insert(userData as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in createUserProfile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Update a user profile
 *
 * @param userId - The UUID of the user to update
 * @param updates - Fields to update
 * @returns Updated user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: UserUpdate
): Promise<DbResult<User>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('users')
      .update(updates as never)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in updateUserProfile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

// =====================================================
// GROUP QUERIES
// =====================================================

/**
 * Get all groups for a specific user
 *
 * @param userId - The UUID of the user
 * @returns Array of groups the user is a member of
 *
 * @example
 * ```typescript
 * const result = await getUserGroups('123e4567-e89b-12d3-a456-426614174000');
 * if (result.error) {
 *   console.error('Failed to fetch groups:', result.error);
 * } else {
 *   console.log('User groups:', result.data);
 * }
 * ```
 */
export async function getUserGroups(userId: string): Promise<DbResultArray<Group>> {
  try {
    const supabase = await createClient();

    // Query groups where the user is a member
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', userId)
      .returns<Array<{ group_id: string; groups: Group }>>();

    if (error) {
      console.error('Error fetching user groups:', error);
      return { data: null, error: new Error(error.message) };
    }

    // Extract the group data from the join result
    const groups = data?.map(item => item.groups).filter(Boolean) as Group[];

    return { data: groups, error: null };
  } catch (error) {
    console.error('Unexpected error in getUserGroups:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get detailed information about a specific group
 *
 * @param groupId - The UUID of the group
 * @returns Group details or null if not found
 *
 * @example
 * ```typescript
 * const result = await getGroupDetails('123e4567-e89b-12d3-a456-426614174000');
 * if (result.data) {
 *   console.log('Group name:', result.data.name);
 *   console.log('Contribution:', result.data.contribution_amount);
 * }
 * ```
 */
export async function getGroupDetails(groupId: string): Promise<DbResult<Group>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error) {
      console.error('Error fetching group details:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in getGroupDetails:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get all members of a specific group with their user information
 *
 * @param groupId - The UUID of the group
 * @returns Array of group members with user details
 *
 * @example
 * ```typescript
 * const result = await getGroupMembers('123e4567-e89b-12d3-a456-426614174000');
 * if (result.data) {
 *   result.data.forEach(member => {
 *     console.log(`${member.user.full_name} - Admin: ${member.is_admin}`);
 *   });
 * }
 * ```
 */
export async function getGroupMembers(
  groupId: string
): Promise<DbResultArray<GroupMemberWithUser>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        *,
        user:users(*)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching group members:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as GroupMemberWithUser[], error: null };
  } catch (error) {
    console.error('Unexpected error in getGroupMembers:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get a group with all its members
 *
 * @param groupId - The UUID of the group
 * @returns Group with member details
 */
export async function getGroupWithMembers(
  groupId: string
): Promise<DbResult<GroupWithMembers>> {
  try {
    await createClient();

    // Fetch group details
    const groupResult = await getGroupDetails(groupId);
    if (groupResult.error || !groupResult.data) {
      return { data: null, error: groupResult.error };
    }

    // Fetch members
    const membersResult = await getGroupMembers(groupId);
    if (membersResult.error) {
      return { data: null, error: membersResult.error };
    }

    const groupWithMembers: GroupWithMembers = {
      ...groupResult.data,
      members: membersResult.data || [],
    };

    return { data: groupWithMembers, error: null };
  } catch (error) {
    console.error('Unexpected error in getGroupWithMembers:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Create a new arisan group
 *
 * @param groupData - Group data to insert
 * @returns Newly created group
 *
 * @example
 * ```typescript
 * const result = await createGroup({
 *   name: 'Family Arisan',
 *   contribution_amount: 1000000,
 *   frequency: 'monthly',
 *   member_count: 10,
 *   start_date: '2025-02-01',
 *   created_by: userId
 * });
 * ```
 */
export async function createGroup(groupData: GroupInsert): Promise<DbResult<Group>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('groups')
      .insert(groupData as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating group:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in createGroup:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Update a group's information
 *
 * @param groupId - The UUID of the group to update
 * @param updates - Fields to update
 * @returns Updated group
 */
export async function updateGroup(
  groupId: string,
  updates: GroupUpdate
): Promise<DbResult<Group>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('groups')
      .update(updates as never)
      .eq('id', groupId)
      .select()
      .single();

    if (error) {
      console.error('Error updating group:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in updateGroup:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

// =====================================================
// GROUP MEMBER QUERIES
// =====================================================

/**
 * Add a user to a group
 *
 * @param groupId - The UUID of the group
 * @param userId - The UUID of the user to add
 * @param isAdmin - Whether the user should be an admin (default: false)
 * @returns The created group member record
 *
 * @example
 * ```typescript
 * const result = await joinGroup(groupId, userId, false);
 * if (result.error) {
 *   console.error('Failed to join group:', result.error);
 * } else {
 *   console.log('Successfully joined group!');
 * }
 * ```
 */
export async function joinGroup(
  groupId: string,
  userId: string,
  isAdmin: boolean = false
): Promise<DbResult<GroupMember>> {
  try {
    const supabase = await createClient();

    const memberData: GroupMemberInsert = {
      group_id: groupId,
      user_id: userId,
      is_admin: isAdmin,
    };

    const { data, error } = await supabase
      .from('group_members')
      .insert(memberData)
      .select()
      .single();

    if (error) {
      console.error('Error joining group:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in joinGroup:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Remove a user from a group
 *
 * @param groupId - The UUID of the group
 * @param userId - The UUID of the user to remove
 * @returns Success status
 */
export async function leaveGroup(
  groupId: string,
  userId: string
): Promise<DbResult<null>> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error leaving group:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Unexpected error in leaveGroup:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Check if a user is a member of a group
 *
 * @param groupId - The UUID of the group
 * @param userId - The UUID of the user
 * @returns True if user is a member, false otherwise
 */
export async function isGroupMember(
  groupId: string,
  userId: string
): Promise<DbResult<boolean>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error) {
      // Not found is not an error in this case
      if (error.code === 'PGRST116') {
        return { data: false, error: null };
      }
      console.error('Error checking group membership:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: !!data, error: null };
  } catch (error) {
    console.error('Unexpected error in isGroupMember:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Check if a user is an admin of a group
 *
 * @param groupId - The UUID of the group
 * @param userId - The UUID of the user
 * @returns True if user is an admin, false otherwise
 */
export async function isGroupAdmin(
  groupId: string,
  userId: string
): Promise<DbResult<boolean>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('group_members')
      .select('is_admin')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (error) {
      // Not found means not a member, hence not an admin
      if (error.code === 'PGRST116') {
        return { data: false, error: null };
      }
      console.error('Error checking group admin status:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data?.is_admin || false, error: null };
  } catch (error) {
    console.error('Unexpected error in isGroupAdmin:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

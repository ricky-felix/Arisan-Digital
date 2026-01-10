/**
 * Database Type Definitions
 *
 * This file contains TypeScript types for all database tables.
 * These types provide type safety when querying the database.
 */

/**
 * Main Database interface
 * This is the top-level type used to type the Supabase client
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      groups: {
        Row: Group;
        Insert: GroupInsert;
        Update: GroupUpdate;
      };
      group_members: {
        Row: GroupMember;
        Insert: GroupMemberInsert;
        Update: GroupMemberUpdate;
      };
      rounds: {
        Row: Round;
        Insert: RoundInsert;
        Update: RoundUpdate;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      frequency: 'weekly' | 'monthly';
      group_status: 'active' | 'completed' | 'paused';
      round_status: 'pending' | 'completed';
      payment_status: 'pending' | 'paid' | 'late';
    };
  };
}

// =====================================================
// USERS TABLE TYPES
// =====================================================

/**
 * User table row type
 * Represents a complete user record from the database
 */
export interface User {
  id: string;
  phone_number: string;
  full_name: string;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Type for inserting a new user
 * All required fields must be provided, optional fields can be omitted
 */
export interface UserInsert {
  id?: string;
  phone_number: string;
  full_name: string;
  profile_picture_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Type for updating a user
 * All fields are optional since partial updates are allowed
 */
export interface UserUpdate {
  phone_number?: string;
  full_name?: string;
  profile_picture_url?: string | null;
  updated_at?: string;
}

// =====================================================
// GROUPS TABLE TYPES
// =====================================================

/**
 * Frequency of group contributions
 */
export type Frequency = 'weekly' | 'monthly';

/**
 * Status of an arisan group
 */
export type GroupStatus = 'active' | 'completed' | 'paused';

/**
 * Group table row type
 * Represents a complete arisan group record from the database
 */
export interface Group {
  id: string;
  name: string;
  contribution_amount: number;
  frequency: Frequency;
  member_count: number;
  start_date: string;
  status: GroupStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Type for inserting a new group
 */
export interface GroupInsert {
  id?: string;
  name: string;
  contribution_amount: number;
  frequency: Frequency;
  member_count: number;
  start_date: string;
  status?: GroupStatus;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Type for updating a group
 */
export interface GroupUpdate {
  name?: string;
  contribution_amount?: number;
  frequency?: Frequency;
  member_count?: number;
  start_date?: string;
  status?: GroupStatus;
  updated_at?: string;
}

// =====================================================
// GROUP_MEMBERS TABLE TYPES
// =====================================================

/**
 * GroupMember table row type
 * Represents the relationship between a user and a group
 */
export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
  is_admin: boolean;
}

/**
 * Type for inserting a new group member
 */
export interface GroupMemberInsert {
  id?: string;
  group_id: string;
  user_id: string;
  joined_at?: string;
  is_admin?: boolean;
}

/**
 * Type for updating a group member
 */
export interface GroupMemberUpdate {
  is_admin?: boolean;
}

// =====================================================
// ROUNDS TABLE TYPES
// =====================================================

/**
 * Status of a round
 */
export type RoundStatus = 'pending' | 'completed';

/**
 * Round table row type
 * Represents an arisan round where one member wins
 */
export interface Round {
  id: string;
  group_id: string;
  round_number: number;
  winner_id: string | null;
  payment_deadline: string;
  status: RoundStatus;
  created_at: string;
  completed_at: string | null;
}

/**
 * Type for inserting a new round
 */
export interface RoundInsert {
  id?: string;
  group_id: string;
  round_number: number;
  winner_id?: string | null;
  payment_deadline: string;
  status?: RoundStatus;
  created_at?: string;
  completed_at?: string | null;
}

/**
 * Type for updating a round
 */
export interface RoundUpdate {
  winner_id?: string | null;
  payment_deadline?: string;
  status?: RoundStatus;
  completed_at?: string | null;
}

// =====================================================
// PAYMENTS TABLE TYPES
// =====================================================

/**
 * Status of a payment
 */
export type PaymentStatus = 'pending' | 'paid' | 'late';

/**
 * Payment table row type
 * Represents a member's payment for a specific round
 */
export interface Payment {
  id: string;
  round_id: string;
  user_id: string;
  amount: number;
  paid_at: string | null;
  proof_url: string | null;
  status: PaymentStatus;
  created_at: string;
}

/**
 * Type for inserting a new payment
 */
export interface PaymentInsert {
  id?: string;
  round_id: string;
  user_id: string;
  amount: number;
  paid_at?: string | null;
  proof_url?: string | null;
  status?: PaymentStatus;
  created_at?: string;
}

/**
 * Type for updating a payment
 */
export interface PaymentUpdate {
  amount?: number;
  paid_at?: string | null;
  proof_url?: string | null;
  status?: PaymentStatus;
}

// =====================================================
// EXTENDED TYPES WITH RELATIONS
// =====================================================

/**
 * Group with creator information
 */
export interface GroupWithCreator extends Group {
  creator: User | null;
}

/**
 * Group with full member details
 */
export interface GroupWithMembers extends Group {
  members: (GroupMember & { user: User })[];
}

/**
 * Round with winner and group information
 */
export interface RoundWithDetails extends Round {
  winner: User | null;
  group: Group;
  payments: (Payment & { user: User })[];
}

/**
 * Payment with user information
 */
export interface PaymentWithUser extends Payment {
  user: User;
}

/**
 * Group member with user information
 */
export interface GroupMemberWithUser extends GroupMember {
  user: User;
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Type for database query responses
 */
export type DbResult<T> = {
  data: T | null;
  error: Error | null;
};

/**
 * Type for database query responses with arrays
 */
export type DbResultArray<T> = {
  data: T[] | null;
  error: Error | null;
};

/**
 * Error type for database operations
 */
export interface DbError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

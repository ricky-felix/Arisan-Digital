/**
 * Supabase Client for Client-Side Operations
 *
 * This file provides a Supabase client for use in Client Components.
 * It uses the @supabase/ssr package for proper App Router integration.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database';

/**
 * Creates and returns a Supabase client for client-side operations
 *
 * This client should only be used in Client Components (components with 'use client' directive).
 * For Server Components and Server Actions, use the server client instead.
 *
 * @returns Supabase client instance typed with our database schema
 */
export function createClient() {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  // Create and return the browser client with type safety
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

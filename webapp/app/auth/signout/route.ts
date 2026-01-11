/**
 * Sign Out Route Handler
 *
 * Handles user sign out and redirects to landing page.
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function POST(_request: NextRequest) {
  const supabase = await createClient();

  // Sign out the user
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    return new Response('Error signing out', { status: 500 });
  }

  // Revalidate the layout to update the UI
  revalidatePath('/', 'layout');

  // Redirect to landing page
  redirect('/');
}

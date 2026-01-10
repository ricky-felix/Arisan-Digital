/**
 * useAuth Hook
 *
 * Client-side React hook for authentication state management.
 * Provides real-time auth state, user information, and sign-out functionality.
 *
 * @example
 * function MyComponent() {
 *   const { user, loading, signOut } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Not authenticated</div>;
 *
 *   return (
 *     <div>
 *       <p>Welcome {user.phone}!</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { signOut as signOutAction } from '@/lib/auth/actions';

/**
 * Auth state interface
 */
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

/**
 * Hook for managing authentication state
 *
 * Features:
 * - Real-time auth state updates via Supabase listener
 * - Loading state while checking authentication
 * - Auto-refresh session on expiry
 * - Sign out functionality
 *
 * @returns Auth state and actions
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Update user state on auth changes
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle different auth events
      if (event === 'SIGNED_IN') {
        // User just signed in
        router.refresh();
      }

      if (event === 'SIGNED_OUT') {
        // User just signed out
        setUser(null);
        router.push('/');
        router.refresh();
      }

      if (event === 'TOKEN_REFRESHED') {
        // Session was refreshed
        console.log('Session token refreshed');
      }

      if (event === 'USER_UPDATED') {
        // User data was updated
        router.refresh();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  /**
   * Sign out the current user
   *
   * Calls the server action to clear the session and redirects to home.
   * Handles errors gracefully with console logging.
   */
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await signOutAction();

      if (!result.success) {
        console.error('Sign out error:', result.error);
        // Still clear local state even if server action fails
        setUser(null);
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Clear local state on error
      setUser(null);
      router.push('/');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signOut,
  };
}

/**
 * Hook for protected routes that require authentication
 *
 * Redirects to login page if user is not authenticated.
 * Shows loading state while checking authentication.
 *
 * @param redirectTo - Path to redirect to after login (default: current path)
 * @returns Auth state with guaranteed non-null user after loading
 *
 * @example
 * function ProtectedPage() {
 *   const { user, loading } = useRequireAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   // User is guaranteed to be authenticated here
 *   return <div>Hello {user.phone}!</div>;
 * }
 */
export function useRequireAuth(redirectTo?: string): UseAuthReturn {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    if (!auth.loading && !auth.user) {
      const loginUrl = redirectTo
        ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
        : '/auth/login';
      router.push(loginUrl);
    }
  }, [auth.loading, auth.user, router, redirectTo]);

  return auth;
}

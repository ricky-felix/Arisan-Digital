import { api } from '../lib/api';

/**
 * Auth-related backend calls that need the service-role admin API (and therefore
 * can't run against the anon Supabase client in the browser).
 */
export const authService = {
  /**
   * Promote the phone captured during registration (stored in the user's auth
   * metadata by signUp) onto the top-level auth.users.phone field so that
   * phone + password login works.
   *
   * Best-effort: safe to call right after signUp before a session exists.
   * POST /auth/sync-phone  body: { userId }
   * @param {string} userId - the freshly-created auth user id
   * @returns {Promise<{ synced: boolean }>}
   */
  syncPhone: (userId) => api.post('/auth/sync-phone', { userId }),
};

import { useState } from 'react';
import { inviteLinksService } from '../services';

/**
 * useInvite — wraps inviteLinksService for the Undang screen.
 *
 * Creates an invite link for the given groupId on demand.
 * The invite object returned by the API is expected to contain at minimum:
 *   { token, expires_at, max_uses }
 */
export function useInvite(groupId) {
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function createInvite(options = {}) {
    if (!groupId) return null;
    setLoading(true);
    setError(null);
    try {
      // TODO(wave2-auth): Supabase session token required.
      const result = await inviteLinksService.create(groupId, {
        expires_at: options.expires_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        max_uses: options.max_uses ?? 50,
      });
      setInvite(result);
      return result;
    } catch (err) {
      console.error('[useInvite] createInvite failed:', err.message);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { invite, loading, error, createInvite };
}

/**
 * useJoinGroup — wraps inviteLinksService.redeem() for GabungMasuk / Gabung screens.
 *
 * The backend has NO separate validate endpoint (GET /invites/validate/:token does
 * not exist). Token format validation is performed client-side before the user
 * navigates to the preview screen. The actual join happens via redeem() which
 * calls POST /invites/redeem/:token.
 */
export function useJoinGroup() {
  const [joinedGroup, setJoinedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * validate — client-side only token sanity check (non-empty, no whitespace-only).
   *
   * NOTE: The backend has no /invites/validate/:token endpoint. This function
   * intentionally does NOT make a network request. It returns a truthy placeholder
   * object so callers (GabungMasuk) can proceed to the preview screen; the real
   * membership check happens when the user confirms and calls redeem().
   *
   * @param {string} token - Invite token or link
   * @returns {{ token: string }|null} Sanitised token wrapper, or null if blank
   */
  function validate(token) {
    const trimmed = token?.trim();
    if (!trimmed) return null;
    // Accept bare tokens or full URLs — extract the last path segment as the token.
    const extracted = trimmed.includes('/') ? trimmed.split('/').pop() : trimmed;
    if (!extracted) return null;
    return { token: extracted };
  }

  /**
   * redeem — calls POST /invites/redeem/:token and adds the current user to the group.
   *
   * QR *decoding* is mocked (the camera resolves to a sample code for MVP).
   * The actual network join call is real once a token is in hand.
   * See: // TODO in GabungMasuk — QR decode is mocked, redeem is real.
   *
   * @param {string} token - Invite token
   * @returns {Promise<Object|null>} Joined group details, or null on error
   */
  async function redeem(token) {
    const trimmed = token?.trim();
    if (!trimmed) return null;
    setLoading(true);
    setError(null);
    try {
      // TODO(wave2-auth): Supabase session token required.
      const result = await inviteLinksService.redeem(trimmed);
      setJoinedGroup(result);
      return result;
    } catch (err) {
      console.error('[useJoinGroup] redeem failed:', err.message);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * join — alias for redeem(), kept so existing call-sites in GabungMasuk that
   * still reference join() continue to work without touching page components.
   */
  const join = redeem;

  return { joinedGroup, loading, error, validate, join, redeem };
}

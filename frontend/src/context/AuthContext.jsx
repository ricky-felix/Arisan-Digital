/**
 * AuthContext.jsx — Real email/phone+password authentication (Workstream C4).
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * REQUIRED SUPABASE PROJECT SETTINGS (dashboard.supabase.com → project settings)
 * ──────────────────────────────────────────────────────────────────────────────
 *  Authentication → Providers → Email
 *    ✓ Enable Email provider
 *    ✓ "Confirm email" → DISABLE for a seamless password-only flow.
 *      (If left enabled, signUp returns a user with no session and the user
 *       must click the confirmation link before they can sign in. The code
 *       handles this gracefully but it breaks the "register and enter
 *       immediately" UX. For production you may want to enable it.)
 *
 *  Authentication → Providers → Phone
 *    ✓ Enable Phone provider
 *    ✓ "Confirm phone" → DISABLE. Without a paid SMS provider this setting
 *      MUST be off; otherwise Supabase requires an OTP SMS for every phone
 *      sign-up, which will fail unless Twilio/MessageBird/etc. is configured.
 *      Password-only phone auth works only when "Confirm phone" is disabled.
 *
 *  Authentication → Providers → Anonymous
 *    ✗ Not required / can be disabled — anonymous sessions are no longer used.
 *
 *  Optionally, in Authentication → Settings:
 *    • Minimum password length: 8 (the UI enforces this already)
 *    • Site URL / Redirect URLs: add your production domain
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Exported context value:
 *   user           – Supabase User | null
 *   session        – Supabase Session | null
 *   profile        – row from `users` table | null  (kept for downstream consumers)
 *   loading        – boolean — true while initial session is resolving
 *   isAuthenticated– boolean (true when session exists)
 *   register({ identifier, password, name })  → Promise<void>
 *   login({ identifier, password })           → Promise<void>
 *   logout()                                  → Promise<void>
 *   updateProfile(updates)                    → Promise<void>
 *
 * NOTE: The old signInAnonymously / signUp / signIn / signOut / convertToAccount
 * names are gone. Any component that imported those must be updated to the new API.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ensureProfile, updateProfile as updateProfileRow } from "../lib/data";
import { parseIdentifier } from "../utils/identifier";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Session bootstrap ─────────────────────────────────────────────────────
  useEffect(() => {
    // Hydrate from any persisted session (localStorage / cookie).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      if (data.session?.user) {
        ensureProfile(data.session.user.id)
          .then(setProfile)
          .catch(() => {});
      }
      setLoading(false);
    });

    // Keep in sync with Supabase's own state changes (token refresh, sign-out
    // from another tab, etc.).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
      if (s?.user) {
        ensureProfile(s.user.id).then(setProfile).catch(() => {});
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── register ─────────────────────────────────────────────────────────────
  /**
   * Register a new account using email or phone + password.
   *
   * @param {{ identifier: string, password: string, name: string }} opts
   * @throws Error with a user-friendly Indonesian message.
   */
  async function register({ identifier, password, name }) {
    const parsed = parseIdentifier(identifier);
    if (!parsed) {
      throw new Error("Masukkan email atau nomor HP yang valid.");
    }

    let signUpArgs;
    if (parsed.type === "email") {
      signUpArgs = {
        email: parsed.email,
        password,
        options: { data: { full_name: name } },
      };
    } else {
      // Phone + password.
      // NOTE: Supabase phone+password auth works WITHOUT an SMS provider ONLY
      // when "Confirm phone" is DISABLED in Authentication → Providers → Phone.
      // Pass phone in metadata as well so the handle_new_user DB trigger can
      // populate users.phone without needing it as a top-level auth field.
      signUpArgs = {
        phone: parsed.phone,
        password,
        options: { data: { full_name: name, phone: parsed.phone } },
      };
    }

    const { data, error } = await supabase.auth.signUp(signUpArgs);
    if (error) throw error;

    // ── Confirmation-pending case ─────────────────────────────────────────
    // When "Confirm email/phone" is ENABLED in Supabase, signUp returns a
    // user object but session is null — the user must click the confirmation
    // link first. Surface a clear message instead of silently hanging.
    if (data.user && !data.session) {
      // Don't throw here — let the caller show the "please confirm" message.
      // We communicate this via the returned object being a no-session state.
      // The caller (LoginOrRegister) checks for this condition.
      throw new Error(
        "Silakan konfirmasi akun kamu. Kami mengirim tautan verifikasi ke " +
        (parsed.type === "email" ? parsed.email : parsed.phone) + "."
      );
    }
  }

  // ── login ─────────────────────────────────────────────────────────────────
  /**
   * Sign in with email or phone + password.
   *
   * @param {{ identifier: string, password: string }} opts
   * @throws Error with a user-friendly Indonesian message.
   */
  async function login({ identifier, password }) {
    const parsed = parseIdentifier(identifier);
    if (!parsed) {
      throw new Error("Masukkan email atau nomor HP yang valid.");
    }

    let signInArgs;
    if (parsed.type === "email") {
      signInArgs = { email: parsed.email, password };
    } else {
      signInArgs = { phone: parsed.phone, password };
    }

    const { error } = await supabase.auth.signInWithPassword(signInArgs);
    if (error) throw error;
  }

  // ── logout ────────────────────────────────────────────────────────────────
  /**
   * Sign out and clear local session. Does NOT re-create an anonymous session.
   */
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // State is cleaned up by the onAuthStateChange listener above.
  }

  // ── updateProfile ─────────────────────────────────────────────────────────
  async function updateProfile(updates) {
    if (!session?.user) return;
    await updateProfileRow(session.user.id, updates);
    setProfile((prev) => ({ ...prev, ...updates }));
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const user = session?.user ?? null;
  const isAuthenticated = !!session;

  // ── Backward-compatibility shims ─────────────────────────────────────────
  // isAnonymous: always false — anonymous sessions were removed in C4.
  // Kept so frozen v1 components (SaveAccountBanner, v1 ProfilPage, etc.)
  // that still destructure { isAnonymous } from useAuth() compile without errors.
  // They simply branch on false and show nothing, which is the correct UX.
  const isAnonymous = false;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthenticated,
        // Compat shim — always false, keeps v1 components compiling.
        isAnonymous,
        register,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

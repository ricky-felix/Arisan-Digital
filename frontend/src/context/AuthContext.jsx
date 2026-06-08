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
 *   register({ email, phone, password, name }) → Promise<void>
 *   login({ identifier, password })           → Promise<void>
 *   logout()                                  → Promise<void>
 *   updateProfile(updates)                    → Promise<void>
 *
 * NOTE: The old signInAnonymously / signUp / signIn / signOut / convertToAccount
 * names are gone. Any component that imported those must be updated to the new API.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { usersService } from "../services/users.service";
import { authService } from "../services/auth.service";
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
      const s = data.session ?? null;
      // C4: anonymous sessions are no longer used. A leftover pre-C4 anonymous
      // session would otherwise slip past <ProtectedRoute> and surface the user
      // as a guest ("Tamu"). Terminate it and stay logged-out.
      if (s?.user?.is_anonymous) {
        supabase.auth.signOut().catch(() => {});
        setSession(null);
        setLoading(false);
        return;
      }
      setSession(s);
      if (s?.user) {
        // Load the profile from the backend (GET /users/me). The profile row is
        // created by the handle_new_user DB trigger from the registered name —
        // the frontend never writes it, so there is no guest/"Tamu" placeholder.
        usersService.getMe().then(setProfile).catch(() => setProfile(null));
      }
      setLoading(false);
    });

    // Keep in sync with Supabase's own state changes (token refresh, sign-out
    // from another tab, etc.).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user?.is_anonymous) {
        supabase.auth.signOut().catch(() => {});
        setSession(null);
        setProfile(null);
        return;
      }
      setSession(s ?? null);
      if (s?.user) {
        usersService.getMe().then(setProfile).catch(() => setProfile(null));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── register ─────────────────────────────────────────────────────────────
  /**
   * Register a new account. Both email and phone number are required; email +
   * password is the auth credential, the phone number is stored on the profile.
   *
   * Email is always the signUp credential (signUp accepts either an email OR a
   * phone, never both). The phone is passed in user metadata so the
   * handle_new_user DB trigger can populate users.phone. Immediately afterwards
   * we call the backend (authService.syncPhone) to also promote that phone onto
   * the top-level auth.users.phone field — confirmed via the admin API — so that
   * phone + password login works. Without this step, phone login can never
   * succeed because Supabase looks users up by auth.users.phone, which signUp
   * leaves null.
   *
   * @param {{ email: string, phone: string, password: string, name: string }} opts
   * @throws Error with a user-friendly Indonesian message.
   */
  async function register({ email, phone, password, name }) {
    const parsedEmail = parseIdentifier(email);
    if (!parsedEmail || parsedEmail.type !== "email") {
      throw new Error("Masukkan alamat email yang valid.");
    }
    const parsedPhone = parseIdentifier(phone);
    if (!parsedPhone || parsedPhone.type !== "phone") {
      throw new Error("Masukkan nomor HP yang valid.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: parsedEmail.email,
      password,
      options: { data: { full_name: name, phone: parsedPhone.phone } },
    });
    if (error) throw error;

    // ── Promote the phone onto the auth record (enables phone login) ──────
    // signUp only stored the phone in user metadata; copy it to
    // auth.users.phone (confirmed) via the backend admin API. Best-effort:
    // a failure here must not block an otherwise-successful registration, and
    // it must run before the confirmation-pending throw below so the phone is
    // attached even when there is no session yet.
    if (data.user) {
      try {
        await authService.syncPhone(data.user.id);
      } catch {
        // Non-fatal — the account exists and the profile still has the phone.
      }
    }

    // ── Confirmation-pending case ─────────────────────────────────────────
    // When "Confirm email" is ENABLED in Supabase, signUp returns a user
    // object but session is null — the user must click the confirmation link
    // first. Surface a clear message instead of silently hanging.
    if (data.user && !data.session) {
      // Don't throw here — let the caller show the "please confirm" message.
      // We communicate this via the returned object being a no-session state.
      // The caller (LoginOrRegister) checks for this condition.
      throw new Error(
        "Silakan konfirmasi akun kamu. Kami mengirim tautan verifikasi ke " +
        parsedEmail.email + "."
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
    // PATCH /users/me — returns the updated row; fall back to a local merge.
    const updated = await usersService.updateMe(updates);
    setProfile((prev) => updated ?? { ...prev, ...updates });
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const user = session?.user ?? null;
  // Anonymous sessions don't count as authenticated (C4 — guest accounts removed).
  const isAuthenticated = !!session && !user?.is_anonymous;

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

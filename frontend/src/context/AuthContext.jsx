import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { ensureProfile, updateProfile as updateProfileRow } from "../lib/data";

const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────
// MVP auth: there is no login screen. On load we ensure an
// anonymous Supabase session exists, then make sure the user has a
// row in `users` (their editable profile). Real email/password
// sign-in is still available via signIn/signUp for later use.
// ─────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  async function bootstrap(session) {
    try {
      let active = session;
      if (!active) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        active = data.session;
      }
      setSession(active);
      if (active?.user) {
        const row = await ensureProfile(active.user.id);
        setProfile(row);
      }
    } catch (err) {
      // Most common cause: "Anonymous sign-ins are disabled" in the
      // Supabase dashboard. Surface it instead of spinning forever.
      console.error("Auth bootstrap failed:", err);
      setAuthError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => bootstrap(data.session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) ensureProfile(s.user.id).then(setProfile).catch(() => {});
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signUp({ firstName, lastName, phone, email, password }) {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw error;
    return data;
  }

  // Deferred registration: upgrade the CURRENT anonymous user into a
  // permanent email/password account. Same auth uid → all arisan &
  // patungan they already created stay theirs (no data migration).
  async function convertToAccount({ firstName, lastName, phone, email, password }) {
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
      data: { full_name: name, phone },
    });
    if (error) throw error;
    // Keep our profile row (users table) in sync with the new identity.
    if (session?.user) {
      await updateProfileRow(session.user.id, { name, phone: phone || null }).catch(() => {});
      setProfile((prev) => ({ ...prev, name, phone: phone || null }));
    }
    return data;
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async function updateProfile(updates) {
    if (!session?.user) return;
    await updateProfileRow(session.user.id, updates);
    setProfile((prev) => ({ ...prev, ...updates }));
  }

  const user = session?.user ?? null;
  const isAnonymous = !!user?.is_anonymous;

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, authError, isAnonymous, signUp, signIn, signOut, convertToAccount, updateProfile }}
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

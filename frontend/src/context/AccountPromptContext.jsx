/**
 * AccountPromptContext.jsx — Deferred-registration nudge (NEUTRALISED — C4).
 *
 * In the anonymous-auth MVP this context opened a "save your account" modal.
 * Since Workstream C4 requires login for all users (no anonymous sessions),
 * the nudge is permanently gated off:
 *
 *   - AccountPromptProvider is kept in App.jsx so the import tree doesn't break.
 *   - promptRegister() is a no-op — the modal is never rendered.
 *   - Consumers in BuatArisan / BuatPatungan still call promptRegister() after
 *     creating a group; those calls are silently ignored.
 *   - The LoginOrRegister import is intentionally removed to avoid a dead
 *     modal being mounted in the tree.
 *
 * If a future workstream needs a contextual upsell (e.g. "upgrade plan"),
 * this is the right place to restore that pattern with a different target URL.
 */

import { createContext, useContext, useCallback } from "react";

const AccountPromptContext = createContext(null);

export function AccountPromptProvider({ children }) {
  // No-op: every user is already authenticated; there is nothing to prompt for.
  const promptRegister = useCallback(() => {
    // Intentional no-op — anonymous sessions removed in Workstream C4.
  }, []);

  return (
    <AccountPromptContext.Provider value={{ promptRegister }}>
      {children}
    </AccountPromptContext.Provider>
  );
}

export function useAccountPrompt() {
  return useContext(AccountPromptContext) ?? { promptRegister: () => {} };
}

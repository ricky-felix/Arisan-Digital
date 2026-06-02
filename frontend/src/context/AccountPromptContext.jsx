import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { LoginOrRegister } from "../pages/LoginOrRegister";

const AccountPromptContext = createContext(null);

// Lets any screen open the "save your account" (deferred registration)
// modal — e.g. after creating an arisan, or when an account-only action
// is attempted while still anonymous.
export function AccountPromptProvider({ children }) {
  const [state, setState] = useState({ open: false, reason: null });

  const promptRegister = useCallback((reason = null) => {
    setState({ open: true, reason });
  }, []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);

  return (
    <AccountPromptContext.Provider value={{ promptRegister }}>
      {children}
      <AnimatePresence>
        {state.open && (
          <LoginOrRegister
            defaultTab="register"
            reason={state.reason}
            onClose={close}
            onSuccess={close}
          />
        )}
      </AnimatePresence>
    </AccountPromptContext.Provider>
  );
}

export function useAccountPrompt() {
  return useContext(AccountPromptContext) ?? { promptRegister: () => {} };
}

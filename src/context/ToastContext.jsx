import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "../components/application/Icon";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, kind = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="app-toast-stack">
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`app-toast ${t.kind === "error" ? "error" : t.kind === "warn" ? "warn" : ""}`}
              style={{ animation: "none" }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "999px",
                background: t.kind === "error" ? "var(--danger-soft)" : t.kind === "warn" ? "var(--warn-soft)" : "var(--emerald-soft)",
                color: t.kind === "error" ? "#b91c1c" : t.kind === "warn" ? "#b45309" : "var(--emerald-dark)",
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                <Icon name={t.kind === "error" ? "alert" : t.kind === "warn" ? "clock" : "check"} size={16} />
              </div>
              <div>{t.msg}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

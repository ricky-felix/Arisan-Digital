import { AnimatePresence, motion } from "framer-motion";
import Icon from "../Icon";

export default function ConfirmDialog({
  open, title, message,
  confirmText = "Konfirmasi",
  danger = false,
  onCancel, onConfirm,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(17,24,39,0.45)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
        >
          <motion.div
            className="app-sheet dialog"
            style={{ animation: "none" }}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{title}</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 20, lineHeight: 1.5 }}>{message}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="app-btn btn-secondary btn-block" onClick={onCancel}>Batal</button>
              <button
                className={`app-btn ${danger ? "btn-danger" : "btn-primary"} btn-block`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

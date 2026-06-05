import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useAccountPrompt } from "../../../context/AccountPromptContext";
import { hasCreatedSomething } from "../../../lib/data";
import Icon from "../Icon";

const DISMISS_KEY = "ad_save_banner_dismissed";

// Soft, dismissible nudge shown to anonymous users who have already created
// something — "save your data by registering". Non-blocking.
export default function SaveAccountBanner() {
  const { isAnonymous } = useAuth();
  const { promptRegister } = useAccountPrompt();
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
  });

  if (!isAnonymous || dismissed || !hasCreatedSomething()) return null;

  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    setDismissed(true);
  };

  return (
    <div
      className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5"
      style={{ background: "var(--emerald-tint)", borderBottom: "1px solid var(--emerald-soft)" }}
    >
      <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--emerald)", color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
        <Icon name="lock" size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)" }}>Simpan datamu</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
          Daftar gratis agar arisan &amp; patunganmu tidak hilang dan bisa dibuka di perangkat lain.
        </div>
      </div>
      <button
        className="app-btn btn-primary"
        style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }}
        onClick={() => promptRegister("Daftar agar arisan & patunganmu tersimpan dan bisa diakses di perangkat lain.")}
      >
        Daftar
      </button>
      <button className="app-icon-btn" style={{ border: 0, background: "transparent", flexShrink: 0 }} onClick={dismiss} aria-label="Tutup">
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { Check, Globe } from "../../../components/application/v2/icons";
import ScreenHeader from "../../../components/application/v2/ScreenHeader";

// Persisted to localStorage so the selection survives page reloads.
// Key: "arisan.v2.lang"
// Only "id" is functional in this release; additional locales are stubs
// for the wave 2 i18n rollout.
const LANG_KEY = "arisan.v2.lang";

const LANGUAGES = [
  { code: "id", label: "Bahasa Indonesia", native: "Bahasa Indonesia", available: true },
  { code: "en", label: "English",          native: "English",           available: false },
];

export default function Bahasa() {
  const navigate = useNavigate();
  const toast = useToast();
  const [selected, setSelected] = useState(
    () => localStorage.getItem(LANG_KEY) || "id"
  );

  const handleSelect = (code, available) => {
    if (!available) {
      toast("Bahasa ini belum tersedia — segera hadir");
      return;
    }
    setSelected(code);
    try {
      localStorage.setItem(LANG_KEY, code);
    } catch {
      // private mode — in-memory only
    }
    // TODO(wave2-i18n): Trigger i18next language change:
    //   import i18n from "../../../i18n"; i18n.changeLanguage(code);
    // and PATCH /users/me/settings { locale: code } if user is authenticated.
    toast("Bahasa disimpan ✓");
  };

  return (
    <div className="v2-screen">
      <div className="v2-inner" style={{ overflowY: "auto" }}>

        {/* ── Sticky header ── */}
        <ScreenHeader title="Bahasa" onBack={() => navigate("/app/profil")} />

        {/* ── Content column ── */}
        <div className="mx-auto w-full max-w-[480px] px-5 py-6 lg:max-w-[600px] lg:px-6">

          {/* Hero */}
          <div className="mb-6 flex flex-col items-center gap-3 py-2 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-gray-soft text-ink-2">
              <Globe size={26} strokeWidth={1.5} />
            </div>
            <p className="text-[14px] font-medium text-ink-3">
              Pilih bahasa tampilan WebApp
            </p>
          </div>

          {/* Language list */}
          <div
            className="overflow-hidden rounded-card bg-surface shadow-card divide-y divide-line-soft"
            role="radiogroup"
            aria-label="Pilih bahasa"
          >
            {LANGUAGES.map((lang) => {
              const isSelected = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(lang.code, lang.available)}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-gray-soft"
                >
                  {/* Flag / emoji placeholder */}
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-gray-soft text-[20px]">
                    {lang.code === "id" ? "🇮🇩" : lang.code === "en" ? "🇬🇧" : "🇲🇾"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-semibold leading-tight ${isSelected ? "text-brand-primary-hover" : "text-ink-1"}`}>
                      {lang.native}
                    </p>
                    {!lang.available && (
                      <p className="mt-0.5 text-[11px] font-medium text-ink-3">Segera hadir</p>
                    )}
                  </div>
                  {isSelected ? (
                    <Check size={17} strokeWidth={2.5} className="shrink-0 text-brand-primary" />
                  ) : (
                    <div className="h-5 w-5 shrink-0 rounded-full border-2 border-line" />
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-center text-[11px] font-medium text-ink-3">
            Pilihan bahasa disimpan di perangkat ini. Bahasa tambahan akan tersedia di wave 2.
          </p>
        </div>

      </div>
    </div>
  );
}

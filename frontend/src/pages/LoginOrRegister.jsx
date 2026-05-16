import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoginForm } from "../components/auth/LoginForm";
import { RegisterForm } from "../components/auth/RegisterForm";

const TABS = [
  { key: "login", label: "Masuk" },
  { key: "register", label: "Daftar" },
];

/** Inline SVG brand mark — a rounded leaf/coin shape + wordmark, no external URL. */
function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Icon: stylised coin / leaf circle */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="16" fill="white" fillOpacity="0.2" />
        <circle cx="16" cy="16" r="13" fill="white" fillOpacity="0.15" />
        {/* Coin inner ring */}
        <circle cx="16" cy="16" r="10" stroke="white" strokeWidth="1.5" fill="none" />
        {/* Stylised Rp / leaf shape */}
        <path
          d="M12 11h5a3 3 0 010 6h-5V11z"
          fill="white"
        />
        <path
          d="M12 17h6M12 20h4"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark */}
      <span className="text-base font-bold tracking-tight text-white">
        Arisan<span className="font-light opacity-90"> Digital</span>
      </span>
    </div>
  );
}

export function LoginOrRegister({ onClose, defaultTab = "login" }) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header (sticky) ── */}
        <div className="flex shrink-0 items-center justify-between bg-[#10b981] px-6 py-4">
          <BrandLogo />
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="flex size-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Tabs (sticky) ── */}
        <div className="flex shrink-0 border-b border-gray-200 bg-gray-50">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={[
                "relative flex-1 py-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#10b981]/40",
                tab === key ? "text-[#10b981]" : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              {label}
              {tab === key && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981]"
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              {tab === "login" ? "Selamat datang kembali!" : "Buat akun baru"}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {tab === "login"
                ? "Masuk untuk melanjutkan arisan digitalmu."
                : "Bergabung dan mulai arisan digitalmu sekarang."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "login" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "login" ? 10 : -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {tab === "login" ? <LoginForm /> : <RegisterForm />}
            </motion.div>
          </AnimatePresence>

          <p className="mt-5 text-center text-sm text-gray-500">
            {tab === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  onClick={() => setTab("register")}
                  className="font-semibold text-[#10b981] transition hover:text-[#0d9e6e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40 focus-visible:ring-offset-1"
                >
                  Daftar sekarang
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  onClick={() => setTab("login")}
                  className="font-semibold text-[#10b981] transition hover:text-[#0d9e6e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40 focus-visible:ring-offset-1"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginOrRegister;

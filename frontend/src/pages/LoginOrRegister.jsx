/**
 * LoginOrRegister.jsx — Full-page auth screen for /masuk (Workstream C4).
 *
 * This replaces the old modal-only component. It now renders as a standalone
 * full-viewport page (not a modal) and is mounted at the public route /masuk.
 *
 * Features:
 *  - Toggle between "Masuk" (login) and "Daftar" (register) tabs.
 *  - Single "Email atau Nomor HP" identifier field for both flows.
 *  - parseIdentifier() validates and normalises the input client-side.
 *  - Post-auth redirect: reads `returnTo` from query param (?returnTo=/app/xyz)
 *    or from React Router location.state.returnTo, defaulting to /app.
 *  - Inline field errors + server error banner.
 *  - Loading state + disabled submit while in-flight.
 *  - Password strength meter on the register form.
 *  - CSS: Tailwind utilities only (no Framer Motion — this is a v2 screen).
 *
 * NOTE: The old modal-style export (with onClose/onSuccess props) is no longer
 * the primary use-case. AccountPromptContext renders this page inline but since
 * every user is now authenticated the prompt is gated off (see AccountPromptContext).
 */

import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { parseIdentifier } from "../utils/identifier";
import { InputField } from "../components/auth/InputField";

// ── Small helpers ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="inline-block size-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ErrorAlert({ message }) {
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3">
      <svg className="mt-px size-4 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
      <p className="text-xs leading-relaxed text-red-700">{message}</p>
    </div>
  );
}

function InfoAlert({ message }) {
  return (
    <div role="status" aria-live="polite" className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3">
      <svg className="mt-px size-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-xs leading-relaxed text-emerald-800">{message}</p>
    </div>
  );
}

/** Returns { level: 0|1|2|3 } — 0 empty, 1 lemah, 2 sedang, 3 kuat */
function getPasswordStrength(pw) {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Lemah", color: "bg-red-400" };
  if (score <= 3) return { level: 2, label: "Sedang", color: "bg-amber-400" };
  return { level: 3, label: "Kuat", color: "bg-[#10b981]" };
}

function PasswordStrengthBar({ password }) {
  const { level, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-1.5 flex flex-col gap-1" aria-live="polite" aria-label={`Kekuatan kata sandi: ${label}`}>
      <div className="flex gap-1">
        {[1, 2, 3].map((step) => (
          <div key={step} className={["h-1 flex-1 rounded-full transition-all duration-300", level >= step ? color : "bg-gray-200"].join(" ")} />
        ))}
      </div>
      <p className={["text-xs font-medium", level === 1 && "text-red-500", level === 2 && "text-amber-500", level === 3 && "text-[#10b981]"].filter(Boolean).join(" ")}>
        {label}
      </p>
    </div>
  );
}

// ── Identifier field hint ─────────────────────────────────────────────────────
// Shows inline feedback as the user types — email detected / phone detected /
// invalid — so they know the field accepted their input.
function IdentifierHint({ value }) {
  if (!value) return null;
  const parsed = parseIdentifier(value);
  if (!parsed) {
    return <p className="mt-1 text-xs text-red-500">Format tidak dikenali. Masukkan email atau nomor HP.</p>;
  }
  if (parsed.type === "email") {
    return <p className="mt-1 text-xs text-emerald-600">Email terdeteksi.</p>;
  }
  return <p className="mt-1 text-xs text-emerald-600">Nomor HP: {parsed.phone}</p>;
}

// ── Typed field hint (register form) ──────────────────────────────────────────
// The register form has dedicated Email and Nomor HP fields (both required), so
// each one validates against a single expected type rather than accepting either.
function TypedHint({ value, expect }) {
  if (!value) return null;
  const parsed = parseIdentifier(value);
  if (parsed?.type === expect) {
    return (
      <p className="mt-1 text-xs text-emerald-600">
        {expect === "email" ? "Email terdeteksi." : `Nomor HP: ${parsed.phone}`}
      </p>
    );
  }
  return (
    <p className="mt-1 text-xs text-red-500">
      {expect === "email" ? "Format email tidak dikenali." : "Format nomor HP tidak dikenali."}
    </p>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────
function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const identifierParsed = parseIdentifier(identifier);
  const canSubmit = !!identifierParsed && password.length >= 1 && !pending;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setPending(true);
    try {
      await login({ identifier, password });
      onSuccess();
    } catch (err) {
      setError(err.message ?? "Gagal masuk. Periksa email/nomor HP dan kata sandi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div>
        <InputField
          label="Email atau Nomor HP"
          type="text"
          placeholder="nama@email.com atau 0812..."
          id="login-identifier"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          inputMode="email"
        />
        <IdentifierHint value={identifier} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
            Kata Sandi<span className="ml-0.5 text-red-400" aria-hidden="true">*</span>
          </label>
        </div>
        <InputField
          type="password"
          placeholder="••••••••"
          id="login-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>

      {error && <ErrorAlert message={error} />}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#10b981] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d9e6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <><Spinner /><span>Memproses...</span></> : "Masuk"}
      </button>
    </form>
  );
}

// ── Register form ─────────────────────────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const { register } = useAuth();

  const [form, setForm] = useState({ email: "", phone: "", name: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [pending, setPending] = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nama wajib diisi";

    const parsedEmail = parseIdentifier(form.email);
    if (!form.email.trim()) {
      errs.email = "Email wajib diisi";
    } else if (parsedEmail?.type !== "email") {
      errs.email = "Masukkan alamat email yang valid.";
    }

    const parsedPhone = parseIdentifier(form.phone);
    if (!form.phone.trim()) {
      errs.phone = "Nomor HP wajib diisi";
    } else if (parsedPhone?.type !== "phone") {
      errs.phone = "Masukkan nomor HP yang valid.";
    }

    if (form.password.length < 8) errs.password = "Minimal 8 karakter";
    if (form.password !== form.confirm) errs.confirm = "Kata sandi tidak cocok";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setInfoMessage("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setPending(true);
    try {
      await register({ email: form.email, phone: form.phone, password: form.password, name: form.name.trim() });
      onSuccess();
    } catch (err) {
      const msg = err.message ?? "Gagal mendaftar. Coba lagi.";
      // Detect the "please confirm" case (signUp succeeded but no session yet).
      if (msg.toLowerCase().includes("konfirmasi") || msg.toLowerCase().includes("verifikasi")) {
        setInfoMessage(msg);
      } else {
        setServerError(msg);
      }
    } finally {
      setPending(false);
    }
  }

  const canSubmit =
    parseIdentifier(form.email)?.type === "email" &&
    parseIdentifier(form.phone)?.type === "phone" &&
    form.name.trim() &&
    form.password.length >= 8 &&
    form.password === form.confirm &&
    !pending;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <InputField
        label="Nama Lengkap"
        placeholder="Budi Santoso"
        id="reg-name"
        required
        value={form.name}
        onChange={set("name")}
        error={errors.name}
        autoComplete="name"
      />

      <div>
        <InputField
          label="Email"
          type="email"
          placeholder="nama@email.com"
          id="reg-email"
          required
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
          inputMode="email"
        />
        {!errors.email && <TypedHint value={form.email} expect="email" />}
      </div>

      <div>
        <InputField
          label="Nomor HP"
          type="tel"
          placeholder="0812..."
          id="reg-phone"
          required
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
          autoComplete="tel"
          inputMode="tel"
        />
        {!errors.phone && <TypedHint value={form.phone} expect="phone" />}
      </div>

      <div className="flex flex-col gap-0">
        <InputField
          label="Kata Sandi"
          type="password"
          placeholder="Min. 8 karakter"
          id="reg-password"
          required
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          autoComplete="new-password"
        />
        <PasswordStrengthBar password={form.password} />
      </div>

      <InputField
        label="Konfirmasi Kata Sandi"
        type="password"
        placeholder="Ulangi kata sandi"
        id="reg-confirm"
        required
        value={form.confirm}
        onChange={set("confirm")}
        error={errors.confirm}
        autoComplete="new-password"
      />

      <p className="text-xs leading-relaxed text-gray-500">
        Dengan mendaftar, kamu menyetujui{" "}
        <a href="#" className="font-medium text-[#10b981] transition hover:underline">Syarat &amp; Ketentuan</a>{" "}
        dan{" "}
        <a href="#" className="font-medium text-[#10b981] transition hover:underline">Kebijakan Privasi</a>{" "}
        kami.
      </p>

      {serverError && <ErrorAlert message={serverError} />}
      {infoMessage && <InfoAlert message={infoMessage} />}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#10b981] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d9e6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <><Spinner /><span>Mendaftarkan...</span></> : "Daftar Sekarang"}
      </button>
    </form>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
const TABS = [
  { key: "login", label: "Masuk" },
  { key: "register", label: "Daftar" },
];

/**
 * LoginOrRegister — standalone full-viewport auth page at /masuk.
 *
 * Props (all optional — retained for backwards-compat with AccountPromptContext
 * which no longer opens it, but keeps the import):
 *   defaultTab   {string}   "login" | "register"
 *   onClose      {Function} — ignored in page mode (no overlay)
 *   onSuccess    {Function} — if provided, called instead of navigate(returnTo)
 *   reason       {string}   — subtitle override (unused in page mode)
 */
export function LoginOrRegister({ defaultTab = "login", onSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(defaultTab);

  // ── Determine where to send the user after auth ───────────────────────────
  // Priority: query param ?returnTo → location.state.returnTo → /app
  const returnTo =
    searchParams.get("returnTo") ||
    location.state?.returnTo ||
    "/app";

  function handleSuccess() {
    if (onSuccess) {
      onSuccess();
    } else {
      // Replace so the user can't hit back to the login page after authenticating.
      navigate(returnTo, { replace: true });
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-start bg-gray-50 px-4 py-8 sm:justify-center">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg py-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40 focus-visible:ring-offset-1"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali ke beranda
        </button>

        <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between bg-[#10b981] px-6 py-4">
          <img
            src="/Arisan-Digital-Full-Logo-no-bg.webp"
            alt="Arisan Digital"
            style={{ height: "56px", width: "auto" }}
          />
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Tutup dan kembali ke beranda"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-gray-200 bg-gray-50">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={[
                "relative flex-1 py-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#10b981]/40",
                tab === key ? "text-[#10b981]" : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
              aria-selected={tab === key}
              role="tab"
            >
              {label}
              {tab === key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981]" />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-5">
            <h1 className="text-lg font-bold text-gray-900">
              {tab === "login" ? "Selamat datang kembali!" : "Buat akun baru"}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {tab === "login"
                ? "Masuk dengan email atau nomor HP dan kata sandimu."
                : "Daftar dengan email dan nomor HP, lalu buat kata sandi."}
            </p>
          </div>

          {tab === "login"
            ? <LoginForm onSuccess={handleSuccess} />
            : <RegisterForm onSuccess={handleSuccess} />}

          <p className="mt-5 text-center text-sm text-gray-500">
            {tab === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className="font-semibold text-[#10b981] transition hover:text-[#0d9e6e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40 focus-visible:ring-offset-1"
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="font-semibold text-[#10b981] transition hover:text-[#0d9e6e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40 focus-visible:ring-offset-1"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}

export default LoginOrRegister;

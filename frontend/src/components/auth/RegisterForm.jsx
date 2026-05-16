import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputField } from "./InputField";
import { Divider } from "./Divider";
import { useAuth } from "../../context/AuthContext";

function Spinner() {
  return (
    <svg
      className="inline-block size-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function ErrorAlert({ message }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3"
    >
      <svg
        className="mt-px size-4 shrink-0 text-red-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      <p className="text-xs leading-relaxed text-red-700">{message}</p>
    </div>
  );
}

/**
 * Returns { level: 0|1|2|3, label: string, color: string }
 * 0 = empty, 1 = lemah, 2 = sedang, 3 = kuat
 */
function getPasswordStrength(password) {
  if (!password) return { level: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

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
          <div
            key={step}
            className={[
              "h-1 flex-1 rounded-full transition-all duration-300",
              level >= step ? color : "bg-gray-200",
            ].join(" ")}
          />
        ))}
      </div>
      <p
        className={[
          "text-xs font-medium",
          level === 1 && "text-red-500",
          level === 2 && "text-amber-500",
          level === 3 && "text-[#10b981]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </p>
    </div>
  );
}

export function RegisterForm() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "Wajib diisi";
    if (!form.lastName.trim()) errs.lastName = "Wajib diisi";
    if (!form.phone.trim()) errs.phone = "Wajib diisi";
    if (!form.email.trim()) errs.email = "Wajib diisi";
    if (form.password.length < 8) errs.password = "Minimal 8 karakter";
    if (form.password !== form.confirm) errs.confirm = "Kata sandi tidak cocok";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signUp(form);
      navigate("/app");
    } catch (err) {
      setServerError(err.message ?? "Gagal mendaftar. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="Nama Depan"
          placeholder="Budi"
          id="reg-firstname"
          required
          value={form.firstName}
          onChange={set("firstName")}
          error={errors.firstName}
          autoComplete="given-name"
        />
        <InputField
          label="Nama Belakang"
          placeholder="Santoso"
          id="reg-lastname"
          required
          value={form.lastName}
          onChange={set("lastName")}
          error={errors.lastName}
          autoComplete="family-name"
        />
      </div>

      <InputField
        label="Nomor HP"
        type="tel"
        placeholder="+62 812 3456 7890"
        id="reg-phone"
        required
        value={form.phone}
        onChange={set("phone")}
        error={errors.phone}
        autoComplete="tel"
      />

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
      />

      {/* Password with strength indicator below */}
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
        <a
          href="#"
          className="font-medium text-[#10b981] transition hover:text-[#0d9e6e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40"
        >
          Syarat &amp; Ketentuan
        </a>{" "}
        dan{" "}
        <a
          href="#"
          className="font-medium text-[#10b981] transition hover:text-[#0d9e6e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40"
        >
          Kebijakan Privasi
        </a>{" "}
        kami.
      </p>

      {serverError && <ErrorAlert message={serverError} />}

      <button
        type="submit"
        disabled={loading}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#10b981] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d9e6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Spinner />
            <span>Mendaftarkan...</span>
          </>
        ) : (
          "Daftar Sekarang"
        )}
      </button>

      <Divider />
    </form>
  );
}

export default RegisterForm;

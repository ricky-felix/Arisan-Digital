/**
 * RegisterForm.jsx — Thin wrapper kept for backward compatibility.
 *
 * The full registration UI now lives in LoginOrRegister.jsx (the /masuk page).
 * This component delegates to the new `register` function from AuthContext
 * (replaces the old signUp / convertToAccount / isAnonymous pattern).
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputField } from "./InputField";
import { useAuth } from "../../context/AuthContext";
import { parseIdentifier } from "../../utils/identifier";

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

export function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: "", name: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nama wajib diisi";
    const parsed = parseIdentifier(form.identifier);
    if (!form.identifier.trim()) errs.identifier = "Email atau nomor HP wajib diisi";
    else if (!parsed) errs.identifier = "Format tidak dikenali";
    if (form.password.length < 8) errs.password = "Minimal 8 karakter";
    if (form.password !== form.confirm) errs.confirm = "Kata sandi tidak cocok";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register({ identifier: form.identifier, password: form.password, name: form.name.trim() });
      if (onSuccess) onSuccess();
      else navigate("/app");
    } catch (err) {
      setServerError(err.message ?? "Gagal mendaftar. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !!parseIdentifier(form.identifier) && form.name.trim() && form.password.length >= 8 && form.password === form.confirm && !loading;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <InputField label="Nama Lengkap" placeholder="Budi Santoso" id="reg-name" required value={form.name} onChange={set("name")} error={errors.name} autoComplete="name" />
      <InputField label="Email atau Nomor HP" type="text" placeholder="nama@email.com atau 0812..." id="reg-identifier" required value={form.identifier} onChange={set("identifier")} error={errors.identifier} autoComplete="username" />
      <InputField label="Kata Sandi" type="password" placeholder="Min. 8 karakter" id="reg-password" required value={form.password} onChange={set("password")} error={errors.password} autoComplete="new-password" />
      <InputField label="Konfirmasi Kata Sandi" type="password" placeholder="Ulangi kata sandi" id="reg-confirm" required value={form.confirm} onChange={set("confirm")} error={errors.confirm} autoComplete="new-password" />

      {serverError && <ErrorAlert message={serverError} />}

      <button type="submit" disabled={!canSubmit} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#10b981] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d9e6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? <><Spinner /><span>Mendaftarkan...</span></> : "Daftar Sekarang"}
      </button>
    </form>
  );
}

export default RegisterForm;

import React, { useState } from "react";
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

export function LoginForm({ onSuccess }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn({ email, password });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message ?? "Gagal masuk. Periksa email dan kata sandi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <InputField
        label="Email"
        type="email"
        placeholder="nama@email.com"
        id="login-email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      {/*
        Password field: uses a custom label row so we can add the
        "Lupa kata sandi?" link inline. InputField handles the
        toggle + input — we suppress its label by not passing `label`.
      */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
            Kata Sandi
            <span className="ml-0.5 text-red-400" aria-hidden="true">*</span>
          </label>
          <button
            type="button"
            className="text-xs font-medium text-[#10b981] transition hover:text-[#0d9e6e] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]/40 focus-visible:ring-offset-1"
          >
            Lupa kata sandi?
          </button>
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
        disabled={loading}
        className="mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#10b981] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d9e6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Spinner />
            <span>Memproses...</span>
          </>
        ) : (
          "Masuk"
        )}
      </button>

      <Divider />
    </form>
  );
}

export default LoginForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputField } from "./InputField";
import { Divider } from "./Divider";
import { useAuth } from "../../context/AuthContext";

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

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
      navigate("/app");
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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
            Kata Sandi
          </label>
          <button
            type="button"
            className="text-xs font-medium text-[#10b981] hover:underline focus-visible:outline-none"
          >
            Lupa kata sandi?
          </button>
        </div>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-[#10b981] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9e6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>

      <Divider />
    </form>
  );
}

export default LoginForm;

import React from "react";
import { InputField } from "./InputField";
import { Divider } from "./Divider";

export function LoginForm() {
  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <InputField
        label="Email"
        type="email"
        placeholder="nama@email.com"
        id="login-email"
        required
      />
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
            Kata Sandi
          </label>
          <a href="#" className="text-xs font-medium text-[#10b981] hover:underline">
            Lupa kata sandi?
          </a>
        </div>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
        />
      </div>
      <button
        type="submit"
        className="mt-2 w-full rounded-lg bg-[#10b981] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9e6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2"
      >
        Masuk
      </button>
      <Divider />
    </form>
  );
}

export default LoginForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputField } from "./InputField";
import { Divider } from "./Divider";
import { useAuth } from "../../context/AuthContext";

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

      <p className="text-xs text-gray-500">
        Dengan mendaftar, kamu menyetujui{" "}
        <a href="#" className="font-medium text-[#10b981] hover:underline">
          Syarat &amp; Ketentuan
        </a>{" "}
        dan{" "}
        <a href="#" className="font-medium text-[#10b981] hover:underline">
          Kebijakan Privasi
        </a>{" "}
        kami.
      </p>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#10b981] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9e6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
      </button>

      <Divider />
    </form>
  );
}

export default RegisterForm;

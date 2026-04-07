import React from "react";
import { InputField } from "./InputField";
import { Divider } from "./Divider";

export function RegisterForm() {
  return (
    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Nama Depan" placeholder="Budi" id="reg-firstname" required />
        <InputField label="Nama Belakang" placeholder="Santoso" id="reg-lastname" required />
      </div>
      <InputField
        label="Nomor HP"
        type="tel"
        placeholder="+62 812 3456 7890"
        id="reg-phone"
        required
      />
      <InputField
        label="Email"
        type="email"
        placeholder="nama@email.com"
        id="reg-email"
        required
      />
      <InputField
        label="Kata Sandi"
        type="password"
        placeholder="Min. 8 karakter"
        id="reg-password"
        required
      />
      <InputField
        label="Konfirmasi Kata Sandi"
        type="password"
        placeholder="Ulangi kata sandi"
        id="reg-confirm"
        required
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
      <button
        type="submit"
        className="w-full rounded-lg bg-[#10b981] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9e6e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981] focus-visible:ring-offset-2"
      >
        Daftar Sekarang
      </button>
      <Divider />
    </form>
  );
}

export default RegisterForm;

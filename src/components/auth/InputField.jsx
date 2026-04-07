import React from "react";

export function InputField({ label, type = "text", placeholder, id, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20"
      />
    </div>
  );
}

export default InputField;

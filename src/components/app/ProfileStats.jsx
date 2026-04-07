import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";

export function ProfileStats({ stats }) {
  const items = [
    { label: "Grup Aktif", value: stats.totalGroups },
    { label: "Total Tabungan", value: formatRupiah(stats.totalSaved) },
    { label: "Bulan Aktif", value: stats.monthsActive },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center py-4">
          <p className="text-base font-bold text-gray-900">{value}</p>
          <p className="mt-0.5 text-center text-[10px] leading-tight text-gray-400">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default ProfileStats;

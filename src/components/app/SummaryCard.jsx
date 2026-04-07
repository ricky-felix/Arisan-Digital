import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";

export function SummaryCard({ summary }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] p-5 text-white shadow-lg shadow-emerald-200">
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-4 h-36 w-36 rounded-full bg-white/10" />

      <p className="text-xs font-medium text-white/70">Total Tabungan Arisan</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{formatRupiah(summary.totalSaved)}</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/15 p-3">
          <p className="text-xs text-white/70">Iuran Berikutnya</p>
          <p className="mt-0.5 text-base font-semibold">{formatRupiah(summary.nextDue)}</p>
          <p className="text-xs text-white/70">{summary.nextDueDate}</p>
        </div>
        <div className="rounded-xl bg-white/15 p-3">
          <p className="text-xs text-white/70">Penerimaan Berikutnya</p>
          <p className="mt-0.5 text-base font-semibold">{formatRupiah(summary.nextPayout)}</p>
          <p className="text-xs text-white/70">{summary.nextPayoutDate}</p>
        </div>
      </div>
    </div>
  );
}

export default SummaryCard;

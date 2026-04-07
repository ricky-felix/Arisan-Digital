import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";

export function PaymentSummaryCard({ pendingPayments }) {
  const total = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = pendingPayments.filter((p) => p.overdue).length;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] p-5 text-white shadow-lg">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -right-2 h-16 w-16 rounded-full bg-white/10" />

      <p className="text-sm font-medium text-white/80">Total Tagihan Bulan Ini</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{formatRupiah(total)}</p>

      <div className="mt-4 flex items-center gap-3">
        <div className="rounded-lg bg-white/20 px-3 py-1.5">
          <p className="text-[11px] text-white/70">Tagihan</p>
          <p className="text-sm font-bold">{pendingPayments.length} grup</p>
        </div>
        {overdueCount > 0 && (
          <div className="rounded-lg bg-red-400/30 px-3 py-1.5">
            <p className="text-[11px] text-white/70">Terlambat</p>
            <p className="text-sm font-bold">{overdueCount} tagihan</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentSummaryCard;

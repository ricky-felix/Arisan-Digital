import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";

export function PendingPaymentItem({ payment, onPay }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3.5 ${payment.overdue ? "border-red-200 bg-red-50" : "border-gray-100 bg-white"}`}>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
        style={{ backgroundColor: payment.color }}
      >
        {payment.group.slice(0, 2).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">{payment.group}</p>
        <p className={`text-xs ${payment.overdue ? "font-medium text-red-500" : "text-gray-400"}`}>
          {payment.overdue ? "Terlambat · " : "Jatuh tempo · "}
          {payment.dueDate}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">{formatRupiah(payment.amount)}</p>
        <button
          onClick={() => onPay?.("Transfer Bank")}
          className="mt-1 rounded-lg bg-[#10b981] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#0d9e6e] focus-visible:outline-none"
        >
          Bayar
        </button>
      </div>
    </div>
  );
}

export default PendingPaymentItem;

import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";

export function BayarHistoryItem({ item }) {
  const isTerima = item.type === "terima";

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-0">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isTerima ? "bg-emerald-100" : "bg-gray-100"}`}>
        <svg
          className={`size-4 ${isTerima ? "text-[#10b981]" : "text-gray-500"}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          {isTerima ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          )}
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">{item.group}</p>
        <p className="text-xs text-gray-400">{item.date} · {item.method}</p>
      </div>

      <p className={`text-sm font-semibold ${isTerima ? "text-[#10b981]" : "text-gray-900"}`}>
        {isTerima ? "+" : "-"}{formatRupiah(item.amount)}
      </p>
    </div>
  );
}

export default BayarHistoryItem;

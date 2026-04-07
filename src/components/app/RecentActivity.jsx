import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";

function ActivityItem({ item }) {
  const isPayout = item.type === "terima";

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isPayout ? "bg-emerald-50" : "bg-gray-100"}`}>
        {isPayout ? (
          <svg className="size-4 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="size-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{item.group}</p>
        <p className="text-xs text-gray-400">{item.date}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`text-sm font-semibold ${isPayout ? "text-[#10b981]" : "text-gray-700"}`}>
          {isPayout ? "+" : "-"}{formatRupiah(item.amount)}
        </p>
        <span className={`text-[10px] font-medium ${isPayout ? "text-[#10b981]" : "text-gray-400"}`}>
          {item.status}
        </span>
      </div>
    </div>
  );
}

export function RecentActivity({ items }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Aktivitas Terakhir</h2>
        <button className="text-xs font-semibold text-[#10b981] focus-visible:outline-none">
          Lihat semua
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <ActivityItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default RecentActivity;

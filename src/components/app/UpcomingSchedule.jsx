import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";

function ScheduleItem({ item }) {
  const isPayout = item.type === "terima";

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isPayout ? "bg-emerald-50" : "bg-orange-50"}`}>
        {isPayout ? (
          <svg className="size-4 text-[#10b981]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        ) : (
          <svg className="size-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{item.group}</p>
        <p className="text-xs text-gray-400">{item.date}</p>
      </div>
      <p className={`shrink-0 text-sm font-semibold ${isPayout ? "text-[#10b981]" : "text-orange-500"}`}>
        {isPayout ? "+" : "-"}{formatRupiah(item.amount)}
      </p>
    </div>
  );
}

export function UpcomingSchedule({ items }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Jadwal Mendatang</h2>
        <button className="text-xs font-semibold text-[#10b981] focus-visible:outline-none">
          Lihat semua
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <ScheduleItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default UpcomingSchedule;

import React from "react";

const ACTIONS = [
  {
    label: "Bayar",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
    color: "bg-emerald-50 text-[#10b981]",
  },
  {
    label: "Buat Grup",
    icon: "M12 4v16m8-8H4",
    color: "bg-violet-50 text-violet-600",
  },
  {
    label: "Gabung",
    icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Riwayat",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    color: "bg-orange-50 text-orange-500",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {ACTIONS.map((action) => (
        <button
          key={action.label}
          className="flex flex-col items-center gap-2 rounded-2xl bg-white p-3 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
            </svg>
          </div>
          <span className="text-center text-[10px] font-medium leading-tight text-gray-600">{action.label}</span>
        </button>
      ))}
    </div>
  );
}

export default QuickActions;

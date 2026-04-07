import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";

export function GroupListCard({ group }) {
  const progress = group.currentRound / group.totalRounds;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: group.color }}
        >
          {group.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-gray-900">{group.name}</p>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#10b981]">
              Aktif
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {group.members} anggota · {group.currentRound}/{group.totalRounds} putaran
          </p>
        </div>
      </div>

      <div className="mt-3.5 h-1.5 w-full rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${progress * 100}%`, backgroundColor: group.color }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-gray-400">Iuran / putaran</p>
          <p className="text-sm font-bold text-gray-900">{formatRupiah(group.amount)}</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-gray-400">Giliranku</p>
          <p className="text-sm font-semibold text-gray-700">ke-{group.myPosition}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-400">Bayar berikutnya</p>
          <p className="text-xs font-medium text-gray-600">{group.nextDate}</p>
        </div>
      </div>

      <button
        className="mt-3.5 w-full rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-600 transition hover:border-[#10b981] hover:text-[#10b981] focus-visible:outline-none"
      >
        Lihat Detail
      </button>
    </div>
  );
}

export default GroupListCard;

import React from "react";
import { formatRupiah } from "../../utils/formatRupiah";

export function GroupCard({ group }) {
  const progress = group.currentRound / group.totalRounds;

  return (
    <div className="min-w-[220px] rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: group.color }}
        >
          {group.name.slice(0, 2).toUpperCase()}
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#10b981]">
          Aktif
        </span>
      </div>

      <p className="mt-2.5 text-sm font-semibold text-gray-900">{group.name}</p>
      <p className="text-xs text-gray-400">
        {group.members} anggota · Putaran {group.currentRound}/{group.totalRounds}
      </p>

      <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${progress * 100}%`, backgroundColor: group.color }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Iuran</p>
          <p className="text-sm font-bold text-gray-900">{formatRupiah(group.amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Giliran ke-{group.myPosition}</p>
          <p className="text-xs text-gray-500">{group.nextDate}</p>
        </div>
      </div>
    </div>
  );
}

export default GroupCard;

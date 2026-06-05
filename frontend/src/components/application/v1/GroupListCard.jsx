import { formatRupiah } from "../../../utils/formatRupiah";
import StatusBadge from "./StatusBadge";
import Icon from "../Icon";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const fmt = (d) => d instanceof Date ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}` : d;

export default function GroupListCard({ group, onClick }) {
  const pct = Math.round((group.currentRound / group.totalRounds) * 100);
  return (
    <div
      className="app-card cursor-pointer transition-all hover:border-[var(--emerald)] hover:shadow-md"
      style={{ padding: 16 }}
      onClick={onClick}
    >
      <div className="flex gap-3 items-start">
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: "linear-gradient(135deg, var(--emerald-soft), var(--lavender-soft))",
          color: "var(--emerald-dark)",
          display: "grid", placeItems: "center",
          fontWeight: 700, fontSize: 18,
        }}>
          {group.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{group.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
                {formatRupiah(group.amount)}/ronde · {group.members} anggota · {group.frequency}
              </div>
            </div>
            <StatusBadge status={group.badgeStatus} dot={false} />
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="app-progress" style={{ height: 6 }}>
              <div style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-1.5" style={{ fontSize: 11, color: "var(--ink-3)" }}>
              <span>Ronde {group.currentRound}/{group.totalRounds}</span>
              <span>Berikutnya: {fmt(group.nextDate)}</span>
            </div>
          </div>
        </div>
      </div>
      {group.isAdmin && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line-soft)" }}>
          <span className="app-badge badge-admin" style={{ fontSize: 11 }}>Admin</span>
        </div>
      )}
    </div>
  );
}

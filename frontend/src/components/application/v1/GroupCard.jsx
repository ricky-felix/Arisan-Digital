import { formatRupiah } from "../../../utils/formatRupiah";
import StatusBadge from "./StatusBadge";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const formatShort = (d) => d instanceof Date
  ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
  : d;

export default function GroupCard({ group, onClick }) {
  return (
    <div className="app-group-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="app-group-thumb">{group.name[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{group.name}</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span><strong style={{ color: "var(--ink-1)" }}>{formatRupiah(group.amount)}</strong>/ronde</span>
          <span>·</span>
          <span>{group.members} anggota</span>
          <span>·</span>
          <span>Giliran: {formatShort(group.nextDate)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <StatusBadge status={group.badgeStatus} />
        {group.isAdmin && (
          <span className="app-badge badge-admin" style={{ fontSize: 11 }}>Admin</span>
        )}
      </div>
    </div>
  );
}

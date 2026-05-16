import { formatRupiah } from "../../utils/formatRupiah";

export default function ProfileStats({ totalGroups, totalSaved, monthsActive }) {
  return (
    <div className="app-card" style={{ padding: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        <Stat label="Total Grup" value={totalGroups} />
        <Stat label="Total Tabungan" value={formatRupiah(totalSaved)} small />
        <Stat label="Bulan Aktif" value={monthsActive} />
      </div>
    </div>
  );
}

function Stat({ label, value, small }) {
  return (
    <div style={{ textAlign: "center", padding: "4px 0" }}>
      <div style={{
        fontSize: small ? 15 : 22,
        fontWeight: 700, letterSpacing: "-0.01em",
        color: "var(--ink-1)",
      }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 2 }}>{label}</div>
    </div>
  );
}

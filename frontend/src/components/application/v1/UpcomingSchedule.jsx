import Icon from "../Icon";
import StatusBadge from "./StatusBadge";
import { formatRupiah } from "../../../utils/formatRupiah";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const formatShort = (d) => d instanceof Date
  ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
  : d;

export default function UpcomingSchedule({ bills = [] }) {
  return (
    <section>
      <div className="app-section-head">
        <h2>Jadwal Mendatang</h2>
      </div>
      <div className="app-card" style={{ padding: 0, overflow: "hidden" }}>
        {bills.map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
              background: "#fff",
              borderTop: i > 0 ? "1px solid var(--line-soft)" : "none",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "999px",
              background: "var(--emerald-tint)", color: "var(--emerald-dark)",
              display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              <Icon name="calendar" size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{b.group}</div>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 1 }}>
                Ronde {b.round} · {formatShort(b.due)}
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: 14, fontWeight: 600 }}>{formatRupiah(b.amount)}</div>
              <div style={{ marginTop: 4 }}><StatusBadge status={b.status} dot={false} /></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

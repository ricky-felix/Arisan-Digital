import Icon from "./Icon";
import { formatRupiah } from "../../utils/formatRupiah";

export default function PaymentSummaryCard({ bills = [] }) {
  const total = bills.reduce((s, b) => s + b.amount, 0);
  const overdueCount = bills.filter(b => b.status === "terlambat").length;
  const pendingCount = bills.filter(b => b.status === "menunggu").length;

  return (
    <div
      className="app-card"
      style={{
        padding: 18,
        background: "linear-gradient(135deg, var(--emerald-tint), var(--lavender-tint))",
        borderColor: "var(--emerald-soft)",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: "var(--emerald)", color: "#fff",
          display: "grid", placeItems: "center",
        }}>
          <Icon name="wallet" size={18} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "var(--emerald-dark)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total Tagihan Bulan Ini
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink-1)" }}>
            {formatRupiah(total)}
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <div style={{ flex: 1, background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "8px 12px" }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600 }}>Menunggu</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{pendingCount}</div>
        </div>
        {overdueCount > 0 && (
          <div style={{ flex: 1, background: "var(--danger-soft)", borderRadius: 10, padding: "8px 12px" }}>
            <div style={{ fontSize: 11, color: "#b91c1c", fontWeight: 600 }}>Terlambat</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--danger)" }}>{overdueCount}</div>
          </div>
        )}
      </div>
    </div>
  );
}

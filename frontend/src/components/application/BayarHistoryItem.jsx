import StatusBadge from "./StatusBadge";
import Icon from "./Icon";
import { formatRupiah } from "../../utils/formatRupiah";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const fmt = (d) => d instanceof Date ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` : d;

export default function BayarHistoryItem({ payment, isAdmin, onConfirm, onReject }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fff", flexWrap: "wrap" }}>
      {/* Proof thumbnail */}
      <div className="app-proof-thumb" style={{ flexShrink: 0 }}>
        {payment.hasProof !== false ? "JPG" : "—"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{payment.member || payment.group}</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
          Ronde {payment.round} · {formatRupiah(payment.amount)} · {fmt(payment.date)}
        </div>
      </div>
      <StatusBadge status={payment.status} dot={false} />
      {isAdmin && payment.status === "menunggu" && (
        <div className="flex gap-1.5 w-full" style={{ paddingLeft: 56, marginTop: 4 }}>
          <button
            className="app-btn btn-primary"
            style={{ padding: "6px 12px", fontSize: 12 }}
            onClick={() => onConfirm?.(payment.id)}
          >
            <Icon name="check" size={14} /> Konfirmasi
          </button>
          <button
            className="app-btn btn-secondary"
            style={{ padding: "6px 12px", fontSize: 12, color: "#b91c1c", borderColor: "#fecaca" }}
            onClick={() => onReject?.(payment.id)}
          >
            <Icon name="x" size={14} /> Tolak
          </button>
        </div>
      )}
    </div>
  );
}

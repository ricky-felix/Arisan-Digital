import Icon from "../Icon";
import StatusBadge from "./StatusBadge";
import { formatRupiah } from "../../../utils/formatRupiah";

const DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const formatFull = (d) => d instanceof Date
  ? `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  : d;

export default function PendingPaymentItem({ bill, onBayar }) {
  const isOverdue = bill.status === "terlambat";
  return (
    <div className="app-card" style={{ padding: 16 }}>
      <div className="flex justify-between items-start">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{bill.group}</div>
          <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>
            Ronde {bill.round} · Jatuh tempo {formatFull(bill.due)}
          </div>
        </div>
        <StatusBadge status={bill.status} />
      </div>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line-soft)",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Total</div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: isOverdue ? "var(--danger)" : "var(--ink-1)" }}>
            {formatRupiah(bill.amount)}
          </div>
        </div>
        <button
          className="app-btn btn-primary"
          onClick={() => onBayar?.(bill)}
          style={isOverdue ? { background: "var(--danger)" } : {}}
        >
          Bayar Sekarang <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </div>
  );
}

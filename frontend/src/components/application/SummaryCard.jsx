import Icon from "./Icon";
import { formatRupiah } from "../../utils/formatRupiah";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const formatShort = (d) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;

export default function SummaryCard({ totalGroups, nextBill, totalSaved }) {
  return (
    <div className="app-h-scroll md:grid md:grid-cols-3 md:gap-4 md:mx-0">
      {/* Total groups */}
      <div className="app-metric" style={{ minWidth: 220 }}>
        <div className="accent" />
        <div className="ico"><Icon name="users" size={18} /></div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>Total Grup Aktif</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{totalGroups}</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)" }}>+1 dari bulan lalu</div>
      </div>

      {/* Next bill */}
      <div className="app-metric amber" style={{ minWidth: 240 }}>
        <div className="accent" />
        <div className="ico"><Icon name="wallet" size={18} /></div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>Tagihan Berikutnya</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{formatRupiah(nextBill.amount)}</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
          Jatuh tempo {formatShort(nextBill.due)} · {nextBill.group}
        </div>
      </div>

      {/* Total savings */}
      <div className="app-metric violet" style={{ minWidth: 240 }}>
        <div className="accent" />
        <div className="ico"><Icon name="trending-up" size={18} /></div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>Total Tabungan 2026</div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>{formatRupiah(totalSaved)}</div>
        <div style={{ fontSize: 12, color: "var(--emerald-dark)", fontWeight: 600 }}>+12% YoY</div>
      </div>
    </div>
  );
}

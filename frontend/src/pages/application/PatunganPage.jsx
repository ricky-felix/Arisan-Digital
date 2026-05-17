import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/application/Icon";
import Avatar from "../../components/application/Avatar";
import StatusBadge from "../../components/application/StatusBadge";

// Category data
const CATEGORIES = [
  { id: "makanan", label: "Makanan", emoji: "🍽" },
  { id: "transport", label: "Transport", emoji: "🚗" },
  { id: "penginapan", label: "Penginapan", emoji: "🏨" },
  { id: "utilitas", label: "Utilitas", emoji: "⚡" },
  { id: "hiburan", label: "Hiburan", emoji: "🎬" },
  { id: "lainnya", label: "Lainnya", emoji: "···" },
];

// Mock bills data
const billsAsPayer = [
  {
    id: "padang",
    title: "Makan malam di Restoran Padang",
    category: "makanan",
    total: 480000,
    method: "Sama Rata",
    paidBy: "Sari Wulandari",
    participants: ["Sari Wulandari", "Budi Santoso", "Andi Pratama", "Maya Lestari"],
    paid: 246000,
    status: "open",
  },
  {
    id: "bensin",
    title: "Bensin perjalanan Medan–Berastagi",
    category: "transport",
    total: 350000,
    method: "Sama Rata",
    paidBy: "Sari Wulandari",
    participants: ["Sari Wulandari", "Dewi Anggraeni", "Joko Suryanto", "Indah Permata"],
    paid: 350000,
    status: "settled",
  },
];

const billsAsDebtor = [
  {
    id: "kopi",
    title: "Kopi pagi tim ops",
    category: "makanan",
    total: 180000,
    myShare: 36000,
    paidBy: "Budi Santoso",
    status: "belum",
  },
  {
    id: "listrik",
    title: "Listrik kos Maret",
    category: "utilitas",
    total: 650000,
    myShare: 162500,
    paidBy: "Andi Pratama",
    status: "sebagian",
    paid: 100000,
    isRecurring: true,
  },
];

// Helper functions
const formatRupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);
const catEmoji = (id) => CATEGORIES.find(c => c.id === id)?.emoji || "···";

// BillRow component
function BillRow({ bill, viewMode, onClick }) {
  const isPayer = viewMode === "payer";
  const progress = isPayer ? (bill.paid / bill.total) * 100 : null;

  return (
    <div className="bill-card" onClick={onClick}>
      <div className="bill-thumb">{catEmoji(bill.category)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[15px]">{bill.title}</span>
          {bill.isRecurring && (
            <span className="recur-badge">
              <Icon name="repeat" size={10}/> Rutin
            </span>
          )}
        </div>
        {isPayer ? (
          <>
            <div className="text-xs text-[var(--ink-2)] mt-0.5 flex gap-2 flex-wrap">
              <span><b>{formatRupiah(bill.total)}</b> total</span>
              <span>·</span>
              <span>{bill.participants.length} orang</span>
              <span>·</span>
              <span>{bill.method}</span>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="app-progress flex-1 h-1.5" style={{ background: "var(--lavender-tint)" }}>
                <div style={{ width: `${progress}%`, background: "var(--lavender-dark)" }}/>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: "var(--lavender-dark)" }}>
                {Math.round(progress)}%
              </span>
            </div>
          </>
        ) : (
          <div className="text-xs text-[var(--ink-2)] mt-0.5">
            Dibayari <b>{bill.paidBy}</b> · Bagian saya: <b className="text-[var(--ink-1)]">{formatRupiah(bill.myShare)}</b>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <StatusBadge status={bill.status}/>
        {isPayer && (
          <div className="avatar-stack sm">
            {bill.participants.slice(0, 3).map((name, i) => (
              <Avatar key={i} name={name} size="sm"/>
            ))}
            {bill.participants.length > 3 && (
              <div className="more">+{bill.participants.length - 3}</div>
            )}
          </div>
        )}
        {!isPayer && <Avatar name={bill.paidBy} size="sm"/>}
      </div>
    </div>
  );
}

export default function PatunganPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("payer");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const bills = tab === "payer" ? billsAsPayer : billsAsDebtor;
  const filtered = filter === "all" ? bills :
    bills.filter(b => filter === "open" ?
      (b.status === "open" || b.status === "belum" || b.status === "sebagian") :
      (b.status === "settled" || b.status === "lunas")
    );

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--app-bg)" }}>
      {/* Header */}
      <div className="p-4 md:p-6 md:pb-0 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-module-patungan app-badge" style={{ padding: "3px 10px" }}>
              <Icon name="split" size={11}/> Patungan
            </span>
          </div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight mt-2">
            Tagihan Patungan
          </h1>
          <p className="text-sm text-[var(--ink-2)] mt-1">
            Bagi pengeluaran bersama dengan mudah
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="refresh-btn"
            onClick={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 700);
            }}
          >
            <Icon name="refresh" size={12} className={refreshing ? "spin" : ""}/>
            <span className="hidden md:inline">Perbarui</span>
          </button>
          <button className="btn-violet app-btn hidden md:flex" onClick={() => navigate("/app/patungan/buat")}>
            <Icon name="plus" size={16}/> Buat Tagihan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="app-tabs mt-4 px-4 md:px-6">
        <button className={`app-tab ${tab === "payer" ? "on" : ""}`} onClick={() => setTab("payer")}>
          Saya Bayar Duluan ({billsAsPayer.length})
        </button>
        <button className={`app-tab ${tab === "debtor" ? "on" : ""}`} onClick={() => setTab("debtor")}>
          Saya Berhutang ({billsAsDebtor.length})
        </button>
        <button className="app-tab ml-auto" style={{ color: "var(--lavender-dark)" }} onClick={() => navigate("/app/patungan/rutin")}>
          <Icon name="repeat" size={14}/> Tagihan Rutin
        </button>
      </div>

      {/* Content */}
      <div className="app-scroll p-4 md:p-6 md:pt-5">
        {/* Filter chips */}
        <div className="app-chips mb-3.5">
          {[
            { id: "all", label: "Semua" },
            { id: "open", label: "Open" },
            { id: "settled", label: "Settled" },
          ].map(c => (
            <button
              key={c.id}
              className={`app-chip ${filter === c.id ? "on" : ""}`}
              style={filter === c.id ? { background: "var(--lavender-dark)", borderColor: "var(--lavender-dark)" } : {}}
              onClick={() => setFilter(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Bills list */}
        {filtered.length === 0 ? (
          <div className="app-empty app-card p-9">
            <div className="illus" style={{ background: "radial-gradient(circle at 30% 30%, var(--lavender-soft), transparent 60%), radial-gradient(circle at 70% 70%, var(--emerald-soft), transparent 60%), #fff" }}>
              <Icon name="split" size={40} style={{ color: "var(--lavender-dark)" }}/>
            </div>
            <h3 className="text-base font-semibold">Belum ada tagihan patungan</h3>
            <p className="text-sm text-[var(--ink-2)]">Buat tagihan baru untuk membagi pengeluaran bersama teman atau keluarga.</p>
            <button className="btn-violet app-btn mt-2" onClick={() => navigate("/app/patungan/buat")}>
              <Icon name="plus" size={16}/> Buat Tagihan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(b => (
              <BillRow key={b.id} bill={b} viewMode={tab} onClick={() => navigate(`/app/patungan/${b.id}`)}/>
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <button className="btn-violet app-btn btn-block btn-lg mt-4 md:hidden" onClick={() => navigate("/app/patungan/buat")}>
          <Icon name="plus" size={18}/> Buat Tagihan Patungan
        </button>
      </div>
    </div>
  );
}

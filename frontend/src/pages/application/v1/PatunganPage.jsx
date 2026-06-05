import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/application/AppLayout";
import Icon from "../../../components/application/Icon";
import Avatar from "../../../components/application/v1/Avatar";
import StatusBadge from "../../../components/application/v1/StatusBadge";
import { listBills } from "./mockData";
import { useToast } from "../../../context/ToastContext";

const CATEGORIES = [
  { id: "makanan", emoji: "🍽" }, { id: "transport", emoji: "🚗" }, { id: "penginapan", emoji: "🏨" },
  { id: "utilitas", emoji: "⚡" }, { id: "hiburan", emoji: "🎬" }, { id: "lainnya", emoji: "···" },
];
const catEmoji = (id) => CATEGORIES.find((c) => c.id === id)?.emoji || "···";
const formatRupiah = (n) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

function BillRow({ bill, onClick }) {
  return (
    <div className="bill-card" onClick={onClick}>
      <div className="bill-thumb">{catEmoji(bill.category)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[15px]">{bill.title}</span>
        </div>
        <div className="text-xs text-[var(--ink-2)] mt-0.5 flex gap-2 flex-wrap">
          <span><b>{formatRupiah(bill.total)}</b> total</span><span>·</span>
          <span>{bill.participants.length} orang</span><span>·</span><span>{bill.method}</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <div className="app-progress flex-1 h-1.5" style={{ background: "var(--lavender-tint)" }}>
            <div style={{ width: `${bill.progress}%`, background: "var(--lavender-dark)" }} />
          </div>
          <span className="text-[11px] font-semibold" style={{ color: "var(--lavender-dark)" }}>{bill.progress}%</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <StatusBadge status={bill.status} />
        <div className="avatar-stack sm">
          {bill.participants.slice(0, 3).map((name, i) => (<Avatar key={i} name={name} size="sm" />))}
          {bill.participants.length > 3 && (<div className="more">+{bill.participants.length - 3}</div>)}
        </div>
      </div>
    </div>
  );
}

export default function PatunganPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState({ asPayer: [], asDebtor: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("payer");
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    listBills()
      .then(setData)
      .catch((e) => toast(e.message || "Gagal memuat", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const bills = tab === "payer" ? data.asPayer : data.asDebtor;
  const filtered = filter === "all" ? bills : bills.filter((b) => (filter === "open" ? b.status === "open" : b.status === "settled"));

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--app-bg)" }}>
      <div className="p-4 md:p-6 md:pb-0 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge-module-patungan app-badge" style={{ padding: "3px 10px" }}><Icon name="split" size={11}/> Patungan</span>
          </div>
          <h1 className="text-[22px] md:text-[28px] font-bold tracking-tight mt-2">Tagihan Patungan</h1>
          <p className="text-sm text-[var(--ink-2)] mt-1">Bagi pengeluaran bersama dengan mudah</p>
        </div>
        <div className="flex gap-2 items-center">
          <button className="refresh-btn" onClick={load}><Icon name="refresh" size={12} className={loading ? "spin" : ""}/><span className="hidden md:inline">Perbarui</span></button>
          <button className="btn-violet app-btn hidden md:flex" onClick={() => navigate("/app/patungan/buat")}><Icon name="plus" size={16}/> Buat Tagihan</button>
        </div>
      </div>

      <div className="app-tabs mt-4 px-4 md:px-6">
        <button className={`app-tab ${tab === "payer" ? "on" : ""}`} onClick={() => setTab("payer")}>Saya Bayar Duluan ({data.asPayer.length})</button>
        <button className={`app-tab ${tab === "debtor" ? "on" : ""}`} onClick={() => setTab("debtor")}>Saya Berhutang ({data.asDebtor.length})</button>
      </div>

      <div className="app-scroll p-4 md:p-6 md:pt-5">
        <div className="app-chips mb-3.5">
          {[{ id: "all", label: "Semua" }, { id: "open", label: "Open" }, { id: "settled", label: "Settled" }].map((c) => (
            <button key={c.id} className={`app-chip ${filter === c.id ? "on" : ""}`}
              style={filter === c.id ? { background: "var(--lavender-dark)", borderColor: "var(--lavender-dark)" } : {}}
              onClick={() => setFilter(c.id)}>{c.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="app-card" style={{ padding: 40, textAlign: "center", color: "var(--ink-2)" }}>Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="app-empty app-card p-9">
            <div className="illus" style={{ background: "radial-gradient(circle at 30% 30%, var(--lavender-soft), transparent 60%), radial-gradient(circle at 70% 70%, var(--emerald-soft), transparent 60%), #fff" }}>
              <Icon name="split" size={40} style={{ color: "var(--lavender-dark)" }}/>
            </div>
            <h3 className="text-base font-semibold">Belum ada tagihan patungan</h3>
            <p className="text-sm text-[var(--ink-2)]">Buat tagihan baru untuk membagi pengeluaran bersama teman atau keluarga.</p>
            <button className="btn-violet app-btn mt-2" onClick={() => navigate("/app/patungan/buat")}><Icon name="plus" size={16}/> Buat Tagihan</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((b) => (<BillRow key={b.id} bill={b} onClick={() => navigate(`/app/patungan/${b.id}`)} />))}
          </div>
        )}

        <button className="btn-violet app-btn btn-block btn-lg mt-4 md:hidden" onClick={() => navigate("/app/patungan/buat")}><Icon name="plus" size={18}/> Buat Tagihan Patungan</button>
      </div>
    </div>
  );
}

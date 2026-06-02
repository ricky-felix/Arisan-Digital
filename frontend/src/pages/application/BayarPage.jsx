import { useState, useEffect, useCallback } from "react";
import AppLayout from "../../components/application/AppLayout";
import StatusBadge from "../../components/application/StatusBadge";
import ConfirmDialog from "../../components/application/ConfirmDialog";
import Icon from "../../components/application/Icon";
import { getBayarData, setPayment } from "../../lib/data";
import { useToast } from "../../context/ToastContext";
import { formatRupiah } from "../../utils/formatRupiah";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const formatID = (d) => `${new Date(d).getDate()} ${MONTHS[new Date(d).getMonth()]} ${new Date(d).getFullYear()}`;

export function BayarPage() {
  const toast = useToast();
  const [tab, setTab] = useState("saya");
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState({ myBills: [], adminPayments: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getBayarData()
      .then(setData)
      .catch((e) => toast(e.message || "Gagal memuat", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const pmts = data.adminPayments;
  const visiblePmts = filter === "all" ? pmts : pmts.filter((p) => p.status === filter);

  const pay = async (bill) => {
    if (busy) return;
    setBusy(true);
    try {
      await setPayment({ groupId: bill.groupId, roundId: bill.roundId, payerName: bill.payerName, amount: bill.amount, status: "confirmed" });
      toast("Pembayaran dicatat", "success");
      load();
    } catch (e) { toast(e.message || "Gagal", "error"); } finally { setBusy(false); }
  };

  const confirm = async (p) => {
    if (busy) return;
    setBusy(true);
    try {
      await setPayment({ groupId: p.groupId, roundId: p.roundId, payerName: p.member, amount: p.amount, status: "confirmed" });
      toast("Pembayaran dikonfirmasi");
      load();
    } catch (e) { toast(e.message || "Gagal", "error"); } finally { setBusy(false); }
  };

  const reject = async (p) => {
    setRejecting(null);
    setBusy(true);
    try {
      await setPayment({ groupId: p.groupId, roundId: p.roundId, payerName: p.member, amount: p.amount, status: "rejected" });
      toast("Pembayaran ditolak", "error");
      load();
    } catch (e) { toast(e.message || "Gagal", "error"); } finally { setBusy(false); }
  };

  return (
    <AppLayout title="Pembayaran">
      <div className="app-scroll" style={{ padding: "16px 16px 24px" }}>
        <div className="hidden md:block mb-6">
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Pembayaran</h1>
          <p style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 4 }}>Kelola tagihan dan konfirmasi pembayaran anggota</p>
        </div>

        <div style={{ display: "flex", borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
          {[{ id: "saya", label: "Tagihan Saya" }, { id: "semua", label: "Semua (Admin)" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: "10px 16px", fontSize: 14, fontWeight: tab === t.id ? 700 : 500, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                color: tab === t.id ? "var(--emerald)" : "var(--ink-2)",
                borderBottom: tab === t.id ? "2px solid var(--emerald)" : "2px solid transparent", marginBottom: -1,
              }}>{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="app-card" style={{ padding: 40, textAlign: "center", color: "var(--ink-2)" }}>Memuat…</div>
        ) : tab === "saya" ? (
          data.myBills.length === 0 ? (
            <Empty icon="wallet" title="Tidak ada tagihan" sub="Anda tidak punya iuran arisan yang jatuh tempo." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {data.myBills.map((b, i) => (
                <div key={i} className="app-card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{b.group}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>Ronde {b.round} · Jatuh tempo {formatID(b.due)}</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line-soft)" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Total</div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{formatRupiah(b.amount)}</div>
                    </div>
                    <button className="app-btn btn-primary" disabled={busy} onClick={() => pay(b)}>
                      Tandai Sudah Bayar <Icon name="check" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {[
                { id: "all", label: `Semua (${pmts.length})` },
                { id: "menunggu", label: `Menunggu (${pmts.filter((p) => p.status === "menunggu").length})` },
                { id: "lunas", label: "Lunas" },
                { id: "terlambat", label: "Ditolak" },
              ].map((c) => (
                <button key={c.id} className={`app-chip ${filter === c.id ? "on" : ""}`} onClick={() => setFilter(c.id)}>{c.label}</button>
              ))}
            </div>

            <div className="app-card" style={{ padding: 0, overflow: "hidden" }}>
              {visiblePmts.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-2)" }}>
                  <Icon name="wallet" size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Tidak ada pembayaran</div>
                  <div style={{ fontSize: 13 }}>Belum ada transaksi pada filter ini.</div>
                </div>
              ) : (
                visiblePmts.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", flexWrap: "wrap", borderTop: i > 0 ? "1px solid var(--line-soft)" : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.member}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{p.group} · Ronde {p.round} · {formatRupiah(p.amount)}</div>
                    </div>
                    <StatusBadge status={p.status} dot={false} />
                    {p.status !== "lunas" && (
                      <div style={{ display: "flex", gap: 6, width: "100%", marginTop: 6 }}>
                        <button className="app-btn btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} disabled={busy} onClick={() => confirm(p)}>
                          <Icon name="check" size={14} /> Konfirmasi
                        </button>
                        <button className="app-btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12, color: "#b91c1c", borderColor: "#fecaca" }} disabled={busy} onClick={() => setRejecting(p)}>
                          <Icon name="x" size={14} /> Tolak
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!rejecting}
        title="Tolak pembayaran?"
        message="Status pembayaran anggota ini akan ditandai ditolak."
        confirmText="Tolak"
        danger
        onCancel={() => setRejecting(null)}
        onConfirm={() => reject(rejecting)}
      />
    </AppLayout>
  );
}

function Empty({ icon, title, sub }) {
  return (
    <div className="app-card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-2)" }}>
      <Icon name={icon} size={36} style={{ opacity: 0.3, marginBottom: 12 }} />
      <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--ink-1)" }}>{title}</div>
      <div style={{ fontSize: 13 }}>{sub}</div>
    </div>
  );
}

export default BayarPage;

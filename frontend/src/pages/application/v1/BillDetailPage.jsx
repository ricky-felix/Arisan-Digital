import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../../components/application/AppLayout";
import Icon from "../../../components/application/Icon";
import StatusBadge from "../../../components/application/v1/StatusBadge";
import Avatar from "../../../components/application/v1/Avatar";
import ConfirmDialog from "../../../components/application/v1/ConfirmDialog";
import { useToast } from "../../../context/ToastContext";
import { getBill, toggleSplitSettled, refreshBillStatus, deleteBill } from "./mockData";
import { formatRupiah } from "../../../utils/formatRupiah";

const CAT_EMOJI = { makanan: "🍽", transport: "🚗", penginapan: "🏨", utilitas: "⚡", hiburan: "🎬", lainnya: "···" };

export default function BillDetailPage() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      setBill(await getBill(billId));
    } catch (err) {
      toast(err.message || "Gagal memuat tagihan", "error");
    } finally {
      setLoading(false);
    }
  }, [billId, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <AppLayout title="Detail Tagihan">
        <div className="app-scroll" style={{ padding: 16 }}>
          <div className="app-card" style={{ padding: 40, textAlign: "center", color: "var(--ink-2)" }}>Memuat…</div>
        </div>
      </AppLayout>
    );
  }
  if (!bill) return null;

  const splits = [...bill.splits].sort((a, b) => Number(b.is_payer) - Number(a.is_payer));

  const toggle = async (split) => {
    if (split.is_payer || busy) return;
    setBusy(true);
    try {
      await toggleSplitSettled(split.id, !split.is_settled);
      await refreshBillStatus(bill.id);
      await load();
    } catch (err) {
      toast(err.message || "Gagal", "error");
    } finally { setBusy(false); }
  };

  const doDelete = async () => {
    setConfirmDelete(false);
    try {
      await deleteBill(bill.id);
      toast("Tagihan dihapus");
      navigate("/app/patungan");
    } catch (err) {
      toast(err.message || "Gagal menghapus", "error");
    }
  };

  return (
    <AppLayout title={bill.title}>
      <div className="app-scroll" style={{ padding: "16px 16px 32px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <button className="app-btn btn-secondary" style={{ marginBottom: 16, padding: "6px 12px", fontSize: 13 }} onClick={() => navigate("/app/patungan")}>
          <Icon name="chevron-left" size={16} /> Kembali
        </button>

        <div className="app-card" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--lavender-tint)", display: "grid", placeItems: "center", fontSize: 24, flexShrink: 0 }}>
              {CAT_EMOJI[bill.category] || "···"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{bill.title}</div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{formatRupiah(bill.total)} · {bill.method} · {bill.participants.length} orang</div>
            </div>
            <StatusBadge status={bill.status} dot={false} />
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="app-progress" style={{ height: 6, background: "var(--lavender-tint)" }}>
              <div style={{ width: `${bill.progress}%`, background: "var(--lavender-dark)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--ink-3)" }}>
              <span>Terkumpul {formatRupiah(bill.paid)}</span>
              <span>{bill.progress}%</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px 4px" }}>Rincian Peserta</div>
        <div className="app-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
          {splits.map((s, i) => {
            const name = s.participant_name || "Peserta";
            const done = s.is_payer || s.is_settled;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i > 0 ? "1px solid var(--line-soft)" : "none" }}>
                <Avatar name={name} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{name}{s.is_payer ? " (pembayar)" : ""}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{formatRupiah(Number(s.amount_owed))}</div>
                </div>
                {s.is_payer ? (
                  <span className="app-badge badge-settled" style={{ fontSize: 11 }}>Sudah bayar</span>
                ) : (
                  <button className={`app-btn ${done ? "btn-secondary" : "btn-primary"}`} style={{ padding: "5px 10px", fontSize: 12 }} disabled={busy} onClick={() => toggle(s)}>
                    {done ? <><Icon name="check" size={13} /> Lunas</> : "Tandai Lunas"}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button className="app-btn btn-secondary btn-block" style={{ color: "#b91c1c", borderColor: "#fecaca" }} onClick={() => setConfirmDelete(true)}>
          <Icon name="trash" size={15} /> Hapus Tagihan
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Hapus tagihan ini?"
        message="Rincian peserta dan pembagian akan ikut terhapus."
        confirmText="Hapus"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={doDelete}
      />
    </AppLayout>
  );
}

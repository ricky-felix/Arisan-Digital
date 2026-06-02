import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../components/application/AppLayout";
import Icon from "../../components/application/Icon";
import StatusBadge from "../../components/application/StatusBadge";
import Avatar from "../../components/application/Avatar";
import ConfirmDialog from "../../components/application/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { getGroup, setPayment, completeRound, deleteGroup } from "../../lib/data";
import { formatRupiah } from "../../utils/formatRupiah";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const fmt = (d) => (d ? `${new Date(d).getDate()} ${MONTHS[new Date(d).getMonth()]} ${new Date(d).getFullYear()}` : "—");

// Map a member's payment for the active round to a StatusBadge status.
function memberStatus(payments, roundId, name) {
  const p = payments.find((x) => x.round_id === roundId && x.payer_name === name);
  if (!p) return "akan";
  if (p.status === "confirmed") return "lunas";
  if (p.status === "rejected") return "terlambat";
  return "menunggu";
}

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      setGroup(await getGroup(id));
    } catch (err) {
      toast(err.message || "Gagal memuat grup", "error");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <AppLayout title="Detail Arisan">
        <div className="app-scroll" style={{ padding: 16 }}>
          <div className="app-card" style={{ padding: 40, textAlign: "center", color: "var(--ink-2)" }}>Memuat…</div>
        </div>
      </AppLayout>
    );
  }
  if (!group) return null;

  const activeRound = group.rounds.find((r) => r.status === "active");
  const pct = group.totalRounds ? Math.round((group.currentRound / group.totalRounds) * 100) : 0;

  const markPaid = async (name) => {
    if (!activeRound || busy) return;
    setBusy(true);
    try {
      await setPayment({ groupId: group.id, roundId: activeRound.id, payerName: name, amount: group.amount, status: "confirmed" });
      toast(`Pembayaran ${name} dikonfirmasi`);
      await load();
    } catch (err) {
      toast(err.message || "Gagal", "error");
    } finally { setBusy(false); }
  };

  const doCompleteRound = async () => {
    if (!activeRound || busy) return;
    setBusy(true);
    try {
      await completeRound(group.id, activeRound.id);
      toast("Ronde diselesaikan");
      await load();
    } catch (err) {
      toast(err.message || "Gagal", "error");
    } finally { setBusy(false); }
  };

  const doDelete = async () => {
    setConfirmDelete(false);
    try {
      await deleteGroup(group.id);
      toast("Arisan dihapus");
      navigate("/app/arisan");
    } catch (err) {
      toast(err.message || "Gagal menghapus", "error");
    }
  };

  return (
    <AppLayout title={group.name}>
      <div className="app-scroll" style={{ padding: "16px 16px 32px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <button className="app-btn btn-secondary" style={{ marginBottom: 16, padding: "6px 12px", fontSize: 13 }} onClick={() => navigate("/app/arisan")}>
          <Icon name="chevron-left" size={16} /> Kembali
        </button>

        {/* Header card */}
        <div className="app-card" style={{ padding: 18, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>{group.name}</div>
              {group.description && <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>{group.description}</div>}
            </div>
            <StatusBadge status={group.status === "completed" ? "selesai" : "menunggu"} dot={false} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <Chip>{formatRupiah(group.amount)}/ronde</Chip>
            <Chip>{group.frequency}</Chip>
            <Chip>{group.method}</Chip>
            {group.isAdmin && <span className="app-badge badge-admin" style={{ fontSize: 11 }}>Admin</span>}
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="app-progress" style={{ height: 6 }}><div style={{ width: `${pct}%` }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--ink-3)" }}>
              <span>Ronde {group.currentRound}/{group.totalRounds}</span>
              {activeRound && <span>Giliran: {activeRound.recipient_name}</span>}
            </div>
          </div>
        </div>

        {/* Active round + members payment tracking */}
        {activeRound && (
          <div className="app-card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Ronde {activeRound.round_number} — Aktif</div>
              <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{fmt(activeRound.scheduled_date)}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 12 }}>
              Penerima giliran: <b style={{ color: "var(--ink-1)" }}>{activeRound.recipient_name}</b>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.memberList.map((m) => {
                const name = m.member_name || "Anggota";
                const st = memberStatus(group.payments, activeRound.id, name);
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={name} size="sm" />
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{name}{m.giliran_order === 1 ? " (Saya)" : ""}</div>
                    <StatusBadge status={st} dot={false} />
                    {group.isAdmin && st !== "lunas" && (
                      <button className="app-btn btn-primary" style={{ padding: "5px 10px", fontSize: 12 }} disabled={busy} onClick={() => markPaid(name)}>
                        <Icon name="check" size={13} /> Lunas
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {group.isAdmin && (
              <button className="app-btn btn-secondary btn-block" style={{ marginTop: 14 }} disabled={busy} onClick={doCompleteRound}>
                Selesaikan Ronde &amp; Lanjut <Icon name="chevron-right" size={15} />
              </button>
            )}
          </div>
        )}

        {/* Giliran timeline */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px 4px" }}>Jadwal Giliran</div>
        <div className="app-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
          {group.rounds.map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i > 0 ? "1px solid var(--line-soft)" : "none" }}>
              <div style={{
                width: 30, height: 30, borderRadius: 999, flexShrink: 0, fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center",
                background: r.status === "completed" ? "var(--emerald)" : r.status === "active" ? "var(--lavender-dark)" : "var(--gray-soft)",
                color: r.status === "upcoming" ? "var(--ink-2)" : "#fff",
              }}>{r.round_number}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{r.recipient_name || "—"}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{fmt(r.scheduled_date)}</div>
              </div>
              <StatusBadge status={r.status === "completed" ? "selesai" : r.status === "active" ? "menunggu" : "akan"} dot={false} />
            </div>
          ))}
        </div>

        {group.isAdmin && (
          <button className="app-btn btn-secondary btn-block" style={{ color: "#b91c1c", borderColor: "#fecaca" }} onClick={() => setConfirmDelete(true)}>
            <Icon name="trash" size={15} /> Hapus Arisan
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Hapus arisan ini?"
        message="Semua anggota, giliran, dan riwayat pembayaran akan ikut terhapus. Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={doDelete}
      />
    </AppLayout>
  );
}

function Chip({ children }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", background: "var(--gray-soft)", padding: "4px 10px", borderRadius: 8 }}>{children}</span>
  );
}

import { useState } from "react";
import AppLayout from "../../components/application/AppLayout";
import StatusBadge from "../../components/application/StatusBadge";
import ConfirmDialog from "../../components/application/ConfirmDialog";
import Icon from "../../components/application/Icon";
import { myBills, payments as mockPayments } from "../../data/appMockData";
import { useToast } from "../../context/ToastContext";
import { formatRupiah } from "../../utils/formatRupiah";

function formatID(date) {
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
function formatShortID(date) {
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function PayBottomSheet({ bill, onClose, onSubmit }) {
  const [uploaded, setUploaded] = useState(false);
  const [notes, setNotes] = useState("");

  return (
    <div className="app-sheet-backdrop" onClick={onClose}>
      <div className="app-sheet" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="grabber" style={{ width: 36, height: 4, borderRadius: 999, background: "var(--line)", margin: "8px auto 12px" }} />
        <div style={{ padding: "4px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 17 }}>Bayar Iuran</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{bill.group} · Ronde {bill.round}</div>
          </div>
          <button className="app-icon-btn" style={{ border: 0, background: "var(--gray-soft)" }} onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div style={{ padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: 0, overflowY: "auto", maxHeight: "70vh" }}>
          {/* Amount card */}
          <div className="app-card" style={{ padding: 14, marginBottom: 16, background: "var(--emerald-tint)", borderColor: "var(--emerald-soft)" }}>
            <div style={{ fontSize: 11, color: "var(--emerald-dark)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Jumlah yang harus dibayar</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 2 }}>{formatRupiah(bill.amount)}</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>Jatuh tempo {formatID(bill.due)}</div>
          </div>

          {/* Bank account */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Rekening tujuan</div>
          <div className="app-card" style={{ padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#0066b3", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12 }}>BCA</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>0451-9382-227</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)" }}>a.n. Bagus Hermawan (Admin)</div>
              </div>
              <button className="app-btn btn-secondary" style={{ padding: "8px 12px", fontSize: 12 }}>
                <Icon name="copy" size={14} /> Salin
              </button>
            </div>
          </div>

          {/* Upload proof */}
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Unggah bukti transfer</label>
          {!uploaded ? (
            <div
              onClick={() => setUploaded(true)}
              style={{
                border: "2px dashed var(--line)", borderRadius: 12, padding: "24px 16px",
                textAlign: "center", cursor: "pointer", marginBottom: 16,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                color: "var(--ink-2)", background: "var(--gray-soft)",
              }}
            >
              <Icon name="upload" size={20} style={{ color: "var(--emerald)" }} />
              <div style={{ fontWeight: 600, color: "var(--ink-1)" }}>Pilih bukti transfer</div>
              <div style={{ fontSize: 12 }}>JPG/PNG hingga 5 MB</div>
            </div>
          ) : (
            <div className="app-card" style={{ padding: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--emerald-soft)", color: "var(--emerald-dark)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>JPG</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>bukti-transfer-mei.jpg</div>
                <div style={{ fontSize: 11, color: "var(--ink-2)" }}>1.2 MB · Berhasil diunggah</div>
              </div>
              <button className="app-icon-btn" onClick={() => setUploaded(false)} style={{ border: 0, background: "var(--gray-soft)" }}>
                <Icon name="x" size={14} />
              </button>
            </div>
          )}

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Catatan (opsional)</label>
          <textarea
            className="app-input"
            rows={2}
            placeholder="Contoh: Transfer dari rekening BNI"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ marginBottom: 20 }}
          />

          <button
            className="app-btn btn-primary btn-block btn-lg"
            disabled={!uploaded}
            style={{ opacity: uploaded ? 1 : 0.5 }}
            onClick={() => uploaded && onSubmit()}
          >
            Kirim Bukti Pembayaran <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function BayarPage() {
  const toast = useToast();
  const [tab, setTab] = useState("saya");
  const [filter, setFilter] = useState("all");
  const [sheetBill, setSheetBill] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [pmts, setPmts] = useState(mockPayments);

  const visiblePmts = filter === "all" ? pmts : pmts.filter(p => p.status === filter);

  const handleConfirm = (id) => {
    setPmts(p => p.map(x => x.id === id ? { ...x, status: "lunas" } : x));
    toast("Pembayaran dikonfirmasi");
  };
  const handleReject = (id) => {
    setPmts(p => p.map(x => x.id === id ? { ...x, status: "terlambat" } : x));
    setConfirmingId(null);
    toast("Pembayaran ditolak", "error");
  };

  return (
    <AppLayout title="Pembayaran">
      <div className="app-scroll" style={{ padding: "16px 16px 24px" }}>
        {/* Desktop heading */}
        <div className="hidden md:block mb-6">
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Pembayaran</h1>
          <p style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 4 }}>Kelola tagihan dan konfirmasi bukti transfer</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
          {[
            { id: "saya",  label: "Tagihan Saya" },
            { id: "semua", label: "Semua (Admin)" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "10px 16px", fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
                background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                color: tab === t.id ? "var(--emerald)" : "var(--ink-2)",
                borderBottom: tab === t.id ? "2px solid var(--emerald)" : "2px solid transparent",
                marginBottom: -1, transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* My bills tab */}
        {tab === "saya" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {myBills.map((b, i) => (
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
                    <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>{formatRupiah(b.amount)}</div>
                  </div>
                  <button className="app-btn btn-primary" onClick={() => setSheetBill(b)}>
                    Bayar Sekarang <Icon name="chevron-right" size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Admin tab */}
        {tab === "semua" && (
          <div>
            {/* Filter chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {[
                { id: "all",       label: `Semua (${pmts.length})` },
                { id: "menunggu",  label: `Menunggu (${pmts.filter(p => p.status === "menunggu").length})` },
                { id: "lunas",     label: "Lunas" },
                { id: "terlambat", label: "Ditolak" },
              ].map(c => (
                <button
                  key={c.id}
                  className={`app-chip ${filter === c.id ? "on" : ""}`}
                  onClick={() => setFilter(c.id)}
                >
                  {c.label}
                </button>
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
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                    flexWrap: "wrap",
                    borderTop: i > 0 ? "1px solid var(--line-soft)" : "none",
                  }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--emerald-soft)", color: "var(--emerald-dark)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>JPG</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.member}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>Ronde {p.round} · {formatRupiah(p.amount)} · {formatShortID(p.date)}</div>
                    </div>
                    <StatusBadge status={p.status} dot={false} />
                    {p.status === "menunggu" && (
                      <div style={{ display: "flex", gap: 6, width: "100%", paddingLeft: 56, marginTop: 6 }}>
                        <button className="app-btn btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => handleConfirm(p.id)}>
                          <Icon name="check" size={14} /> Konfirmasi
                        </button>
                        <button
                          className="app-btn btn-secondary"
                          style={{ padding: "6px 12px", fontSize: 12, color: "#b91c1c", borderColor: "#fecaca" }}
                          onClick={() => setConfirmingId(p.id)}
                        >
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

      {sheetBill && (
        <PayBottomSheet
          bill={sheetBill}
          onClose={() => setSheetBill(null)}
          onSubmit={() => {
            setSheetBill(null);
            toast("Bukti transfer terkirim, menunggu konfirmasi admin", "success");
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmingId}
        title="Tolak pembayaran?"
        message="Anggota akan diminta mengupload ulang bukti transfer. Beri alasan jika perlu."
        confirmText="Tolak"
        danger
        onCancel={() => setConfirmingId(null)}
        onConfirm={() => handleReject(confirmingId)}
      />
    </AppLayout>
  );
}

export default BayarPage;

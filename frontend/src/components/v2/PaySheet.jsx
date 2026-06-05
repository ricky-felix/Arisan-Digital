import { useState } from "react";
import { useToast } from "../../context/ToastContext";
import "../../styles/app-v2.css";
import { Users, Split, Check, ChevronRight } from "./icons";

/**
 * PaySheet — shared quick-pay bottom sheet
 * Props:
 *   open       boolean
 *   onClose    () => void
 *   amount     string  e.g. "Rp 200.000"
 *   label      string  e.g. "Iuran Arisan Keluarga Sari"
 *   destName   string  e.g. "Dompet Grup Keluarga Sari"
 *   destType   "arisan" | "patungan"
 *   onPaid     () => void   (called after successful confirmation)
 *   onDest     () => void   (optional — called when the "Bayar ke" row is tapped)
 */
export default function PaySheet({ open, onClose, amount, label, destName, destType = "arisan", onPaid, onDest }) {
  const toast = useToast();
  const [processing, setProcessing] = useState(false);

  if (!open) return null;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleConfirm() {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onClose();
      toast("Pembayaran berhasil");
      if (onPaid) onPaid();
    }, 900);
  }

  return (
    <div className="v2-sheet-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Konfirmasi Pembayaran">
      <div className="v2-sheet">
        <div className="sheet-grabber" />
        <div className="sheet-title">Konfirmasi Pembayaran</div>
        <div className="sheet-sub">{label}</div>

        {/* Destination row */}
        <div className="sheet-dest-row">
          <div className={`sheet-dest-icon ${destType}`}>
            {destType === "arisan"
              ? <Users size={20} stroke="currentColor" strokeWidth={2} />
              : <Split size={20} stroke="currentColor" strokeWidth={2} />}
          </div>
          <div>
            <div className="sheet-dest-label">Bayar ke</div>
            <div className="sheet-dest-val">{destName}</div>
          </div>
        </div>

        {/* Source of funds */}
        <div className="sheet-method-row">
          <div>
            <div className="sheet-method-label">Sumber dana</div>
            <div className="sheet-method-val">GoPay</div>
          </div>
          <span className="sheet-change">Ganti</span>
        </div>

        {/* Amount */}
        <div className="sheet-amount-row">
          <span className="sheet-amount-label">Jumlah iuran</span>
          <span className="sheet-amount-val">{amount}</span>
        </div>

        <button
          className="sheet-confirm-btn"
          onClick={handleConfirm}
          disabled={processing}
          type="button"
        >
          <Check size={18} stroke="white" strokeWidth={2.5} />
          {processing ? "Memproses…" : "Konfirmasi Bayar"}
        </button>

        {onDest && (
          <button
            className={`sheet-members-btn ${destType}`}
            onClick={onDest}
            disabled={processing}
            type="button"
          >
            <Users size={17} stroke="currentColor" strokeWidth={2} />
            Lihat anggota
            <ChevronRight size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}

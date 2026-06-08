import { X } from '../icons';

/**
 * DeleteConfirmModal — center modal confirming deletion of a payment method.
 *
 * PRD §3 Story 3 copy requirement:
 *   "Hapus metode pembayaran ini? Orang lain tidak bisa membayar ke rekening ini lagi."
 *
 * Props:
 *   method    {Object|null} - the method to delete; null means modal is hidden
 *   onConfirm {Function}   - called when user confirms deletion
 *   onCancel  {Function}   - called when user cancels
 *   deleting  {boolean}    - shows spinner on confirm button
 */
export default function DeleteConfirmModal({ method, onConfirm, onCancel, deleting }) {
  if (!method) return null;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onCancel();
  }

  return (
    <div
      className="v2-sheet-backdrop items-center"
      style={{ alignItems: 'center' }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Hapus Metode Pembayaran"
    >
      <div
        className="mx-4 w-full max-w-sm rounded-[20px] bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        style={{ animation: 'v2FadeIn .2s ease-out' }}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--danger-soft)]">
            {/* Trash icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onCancel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-ink-3 hover:bg-gray-soft"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <h2 className="mb-2 text-[16px] font-extrabold tracking-[-0.01em] text-ink-1">
          Hapus Metode Pembayaran?
        </h2>

        <p className="mb-1 text-[13px] font-semibold text-ink-2">
          {method.label}
        </p>

        <p className="mb-6 text-[13px] font-medium leading-relaxed text-ink-3">
          Orang lain tidak bisa membayar ke rekening ini lagi. Tindakan ini tidak bisa dibatalkan.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex h-11 flex-1 items-center justify-center rounded-[12px] border border-line bg-surface text-[13px] font-bold text-ink-2 transition-colors hover:bg-gray-soft disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[12px] bg-[var(--danger)] text-[13px] font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {deleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : null}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

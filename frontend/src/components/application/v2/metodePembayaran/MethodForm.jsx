import { useState, useEffect } from 'react';
import { X, Check } from '../icons';
import {
  TYPE_LABELS,
  TYPE_CATEGORY,
  TYPE_GROUP_ORDER,
  EWALLET_TYPES,
  TYPE_LABEL_SUGGESTIONS,
} from './data';

/**
 * MethodForm — bottom-sheet form for add/edit of a single payment method.
 *
 * Used for both "Tambah Metode" and "Edit" flows.
 * When `initial` is provided, the form is in edit mode (type is immutable).
 *
 * Props:
 *   initial     {Object|null} - existing method to edit; null = add mode
 *   onSave      {Function}    - called with the validated DTO object
 *   onCancel    {Function}    - called when sheet is dismissed
 *   saving      {boolean}     - controls the spinner on the save button
 */
export default function MethodForm({ initial, onSave, onCancel, saving }) {
  const isEdit = !!initial;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [type, setType] = useState(initial?.type ?? 'gopay');
  const [label, setLabel] = useState(initial?.label ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [isPrimary, setIsPrimary] = useState(initial?.is_primary ?? false);

  // ── Validation errors ──────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});

  // Reset field errors when type changes (in add mode)
  useEffect(() => {
    setErrors({});
  }, [type]);

  const isEwallet = EWALLET_TYPES.includes(type);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate() {
    const errs = {};

    if (!label.trim()) {
      errs.label = 'Label tidak boleh kosong';
    } else if (label.trim().length > 50) {
      errs.label = 'Label maksimal 50 karakter';
    }

    if (isEwallet) {
      if (!phone.trim()) {
        errs.phone = 'Nomor HP tidak boleh kosong';
      } else if (!/^\d{8,15}$/.test(phone.trim())) {
        errs.phone = 'Nomor HP harus angka, 8–15 digit (tanpa tanda + atau spasi)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const dto = {
      type,
      label: label.trim(),
      phone: isEwallet ? phone.trim() : null,
      qris_image_path: null, // TODO(phase4-qris): pass the uploaded path here
      is_primary: isPrimary,
    };

    onSave(dto);
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onCancel();
  }

  // ── Numeric-only helpers ────────────────────────────────────────────────────
  function onPhoneChange(e) {
    // Strip non-digits; allow leading 0 or 62 — stored as-is (per PRD §10 Q5)
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 15));
  }

  // ── Type picker: one combined list of all types (in group order), no sub-labels ──
  const allTypes = TYPE_GROUP_ORDER.flatMap((grp) =>
    Object.entries(TYPE_CATEGORY)
      .filter(([, cat]) => cat === grp)
      .map(([t]) => t)
  );

  return (
    <div
      className="v2-sheet-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
    >
      <div className="v2-sheet" style={{ maxHeight: '90vh', overflowY: 'auto', paddingBottom: 40 }}>
        <div className="sheet-grabber" />

        <div className="sheet-title">
          {isEdit ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
        </div>
        <p className="mb-5 text-[12px] font-medium leading-relaxed text-ink-3">
          {isEdit
            ? 'Perbarui detail akun pembayaranmu. Jenis pembayaran tidak bisa diubah.'
            : 'Tambahkan e-wallet agar anggota grup bisa membayarmu.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Type picker (only in add mode) ── */}
          {!isEdit && (
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3">
                Jenis Pembayaran
              </p>
              <div className="flex flex-wrap gap-2">
                {allTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={type === t}
                    onClick={() => setType(t)}
                    className={`rounded-full border px-3.5 py-2 text-[13px] font-bold transition-colors ${
                      type === t
                        ? 'border-brand-secondary bg-brand-secondary text-white'
                        : 'border-line bg-surface text-ink-2 hover:bg-gray-soft'
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── In edit mode, show the immutable type badge ── */}
          {isEdit && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-secondary-soft bg-brand-secondary-soft px-3 py-1.5">
              <span className="text-[12px] font-bold text-brand-secondary-dark">
                {TYPE_LABELS[type]}
              </span>
              <span className="text-[11px] text-ink-3">(tidak bisa diubah)</span>
            </div>
          )}

          {/* ── Label ── */}
          <div className="mb-4">
            <label
              htmlFor="pm-label"
              className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3"
            >
              Label (Nama) <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id="pm-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={TYPE_LABEL_SUGGESTIONS[type]}
              maxLength={50}
              autoComplete="off"
              className="v2-input"
              style={{ '--ac': 'var(--lavender)', '--ac-tint': 'var(--lavender-tint)' }}
            />
            {errors.label && (
              <p className="mt-1 text-[12px] font-medium text-[var(--danger)]">{errors.label}</p>
            )}
          </div>

          {/* ── E-wallet field ── */}
          {isEwallet && (
            <div className="mb-4">
              <label
                htmlFor="pm-phone"
                className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3"
              >
                Nomor HP <span className="text-[var(--danger)]">*</span>
              </label>
              <input
                id="pm-phone"
                type="text"
                inputMode="numeric"
                value={phone}
                onChange={onPhoneChange}
                placeholder="mis. 08123456789 atau 628123456789"
                maxLength={15}
                autoComplete="tel"
                className="v2-input font-mono"
                style={{ '--ac': 'var(--lavender)', '--ac-tint': 'var(--lavender-tint)' }}
              />
              {errors.phone ? (
                <p className="mt-1 text-[12px] font-medium text-[var(--danger)]">{errors.phone}</p>
              ) : (
                <p className="mt-1 text-[11px] text-ink-3">
                  Angka saja — mis. 08123456789 atau 628123456789
                </p>
              )}
            </div>
          )}

          {/* ── Jadikan Utama checkbox ── */}
          <label className="mb-6 flex cursor-pointer items-center gap-3">
            <div
              role="checkbox"
              aria-checked={isPrimary}
              tabIndex={0}
              onClick={() => setIsPrimary((v) => !v)}
              onKeyDown={(e) => e.key === ' ' && setIsPrimary((v) => !v)}
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-[5px] border-2 transition-colors ${
                isPrimary
                  ? 'border-brand-secondary bg-brand-secondary'
                  : 'border-line bg-surface'
              }`}
            >
              {isPrimary && <Check size={11} strokeWidth={3} className="text-white" />}
            </div>
            <span className="text-[13px] font-semibold text-ink-1">
              Jadikan Metode Utama
            </span>
          </label>

          {/* ── Consent note (compliance: PRD §8 + PRD §⚖️) ── */}
          <div className="mb-5 rounded-[12px] bg-brand-secondary-soft/50 px-3.5 py-3">
            <p className="text-[11px] font-medium leading-relaxed text-brand-secondary-dark">
              Detail akun disimpan hanya untuk memudahkan pembayaran antaranggota grup.
              Anggota yang bergabung di grup yang sama dapat melihat informasi ini (nomor tersembunyi kecuali 4 digit terakhir).
            </p>
          </div>

          {/* ── Buttons ── */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex h-12 flex-1 items-center justify-center rounded-[14px] border border-line bg-surface text-[14px] font-bold text-ink-2 transition-colors hover:bg-gray-soft disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-brand-secondary text-[14px] font-bold text-white transition-colors hover:bg-brand-secondary-dark disabled:opacity-50"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Check size={15} strokeWidth={2.5} />
              )}
              Simpan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

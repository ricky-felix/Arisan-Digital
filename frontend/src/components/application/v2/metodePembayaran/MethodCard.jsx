import { Wallet, Check } from '../icons';
import { TYPE_LABELS, EWALLET_TYPES } from './data';

/**
 * MethodCard — displays a single saved payment method as a list card.
 *
 * Props:
 *   method      {Object}   - payment method object (v1 shape from API)
 *   onEdit      {Function} - called when the edit button is clicked
 *   onDelete    {Function} - called when the delete button is clicked
 *   onSetPrimary{Function} - called when the "Utama" radio is clicked
 */
export default function MethodCard({ method, onEdit, onDelete, onSetPrimary }) {
  const { type, label, phone, is_primary } = method;

  // Detail line: e-wallet shows the phone number; QRIS shows nothing until Phase 4.
  const isEwallet = EWALLET_TYPES.includes(type);

  const detailLine = isEwallet ? phone || '—' : null;

  const typeLabel = TYPE_LABELS[type] ?? type;

  return (
    <div
      className={`relative flex items-start gap-3 rounded-[16px] border px-4 py-4 transition-colors ${
        is_primary
          ? 'border-brand-secondary bg-brand-secondary-tint'
          : 'border-line bg-surface'
      }`}
    >
      {/* Type icon */}
      <div
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${
          is_primary
            ? 'bg-brand-secondary text-white'
            : 'bg-brand-secondary-soft text-brand-secondary-dark'
        }`}
        aria-hidden="true"
      >
        <Wallet size={18} strokeWidth={2} />
      </div>

      {/* Method info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold leading-tight text-ink-1">{label}</span>
          {is_primary && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <Check size={9} strokeWidth={3} />
              Utama
            </span>
          )}
        </div>

        <p className="mt-0.5 text-[12px] font-medium text-ink-3">
          {typeLabel}
          {detailLine && (
            <>
              {' · '}
              <span className="font-mono tracking-wide">{detailLine}</span>
            </>
          )}
        </p>

      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Set as primary radio — only if not already primary */}
        {!is_primary && (
          <button
            type="button"
            aria-label={`Jadikan ${label} metode utama`}
            onClick={() => onSetPrimary(method)}
            className="grid h-8 w-8 place-items-center rounded-[10px] text-ink-3 transition-colors hover:bg-brand-secondary-soft hover:text-brand-secondary-dark"
            title="Jadikan metode utama"
          >
            {/* Radio outline icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
        )}

        {/* Edit */}
        <button
          type="button"
          aria-label={`Edit ${label}`}
          onClick={() => onEdit(method)}
          className="grid h-8 w-8 place-items-center rounded-[10px] text-ink-3 transition-colors hover:bg-gray-soft hover:text-ink-1"
        >
          {/* Pencil icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {/* Delete */}
        <button
          type="button"
          aria-label={`Hapus ${label}`}
          onClick={() => onDelete(method)}
          className="grid h-8 w-8 place-items-center rounded-[10px] text-ink-3 transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
        >
          {/* Trash icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

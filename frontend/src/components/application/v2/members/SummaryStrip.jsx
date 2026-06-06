/**
 * SummaryStrip — three-stat card: paid count, unpaid count, total collected.
 *
 * summary-strip:  mx-5, bg-surface, rounded-[14px], shadow-card, grid grid-cols-3, text-center
 * Desktop (right-col parent overrides margin to 0 mb-4 via wrapper): mx-0 mb-4
 * ss-item:        p-3 (12px 8px)
 * ss-item + item: border-l border-line-soft
 * ss-val:         text-[18px] font-extrabold text-ink-1 tracking-[-0.02em]
 * ss-lbl:         text-[9px] font-bold text-ink-3 uppercase tracking-[0.04em] mt-0.5
 */
export default function SummaryStrip() {
  return (
    <div className="mx-5 grid grid-cols-3 rounded-[14px] bg-surface text-center shadow-card lg:mx-0 lg:mb-4">
      <div className="px-2 py-3">
        <div className="text-[18px] font-extrabold tracking-[-0.02em] text-brand-primary-hover">8</div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-ink-3">Lunas</div>
      </div>
      <div className="border-l border-line-soft px-2 py-3">
        <div className="text-[18px] font-extrabold tracking-[-0.02em] text-error">4</div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-ink-3">Belum</div>
      </div>
      <div className="border-l border-line-soft px-2 py-3">
        <div className="text-[18px] font-extrabold tracking-[-0.02em] text-ink-1">Rp 1,6jt</div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-ink-3">Terkumpul</div>
      </div>
    </div>
  );
}

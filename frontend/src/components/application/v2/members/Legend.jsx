/**
 * Legend — three colour-dot labels explaining orbit avatar ring colours.
 *
 * legend-row: flex gap-3 items-center justify-center py-2 px-5
 * lg-item:    flex items-center gap-1.25 text-[10px] font-bold text-ink-2
 * lg-dot:     10×10 rounded-full; colour per status
 *   paid    → bg-brand-primary   (#10b981)
 *   unpaid  → bg-error           (#ef4444)
 *   giliran → bg-[#f59e0b]  (brand-accent)
 */
export default function Legend() {
  return (
    <div className="flex items-center justify-center gap-3 px-5 py-2">
      <div className="flex items-center gap-1.25 text-[10px] font-bold text-ink-2">
        <div className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
        Giliran
      </div>
      <div className="flex items-center gap-1.25 text-[10px] font-bold text-ink-2">
        <div className="h-2.5 w-2.5 rounded-full bg-brand-primary" />
        Sudah bayar
      </div>
      <div className="flex items-center gap-1.25 text-[10px] font-bold text-ink-2">
        <div className="h-2.5 w-2.5 rounded-full bg-error" />
        Belum bayar
      </div>
    </div>
  );
}

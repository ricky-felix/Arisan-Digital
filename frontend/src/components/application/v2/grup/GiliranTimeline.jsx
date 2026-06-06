/**
 * GiliranTimeline — "Urutan Giliran" horizontally-scrollable numbered turn order.
 *
 * State → visual mapping:
 *   done     → bg-brand-primary (solid green circle, white number)
 *   current  → bg-brand-primary-hover with ring (brand-primary-soft), white number
 *   upcoming → bg-line-soft, ink-3 number
 */

const NUM_CLASS = {
  done:     "bg-brand-primary text-white",
  current:  "bg-brand-primary-hover text-white shadow-[0_0_0_3px_var(--color-brand-primary-soft)]",
  upcoming: "bg-line-soft text-ink-3",
};

export default function GiliranTimeline({ items }) {
  return (
    <div className="w-full">
      <div className="mb-2.5 text-[13px] font-extrabold tracking-[-0.01em] text-ink-1">
        Urutan Giliran
      </div>

      {/* Scrollable row — hide scrollbar cross-browser */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((g) => (
          <div key={g.n} className="flex w-13 shrink-0 flex-col items-center gap-1">
            <div className={`grid h-9 w-9 place-items-center rounded-full text-[11px] font-extrabold ${NUM_CLASS[g.state] ?? NUM_CLASS.upcoming}`}>
              {g.n}
            </div>
            <div className="text-center text-[8px] font-bold leading-[1.3] text-ink-3">
              {g.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

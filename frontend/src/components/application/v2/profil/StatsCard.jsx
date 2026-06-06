/**
 * StatsCard — three-up stat card that floats over the hero's bottom edge.
 *
 * stats shape: Array<{ num: string|number, modifier: string, label: string }>
 *   modifier – color key for the number: "em" | "lv" | "neutral"
 */
const DEFAULT_STATS = [
  { num: 3,  modifier: "em",      label: "Arisan"    },
  { num: 3,  modifier: "lv",      label: "Patungan"  },
  { num: 18, modifier: "neutral", label: "Transaksi" },
];

const NUM_COLOR = {
  em: "text-brand-primary-hover",
  lv: "text-brand-secondary-dark",
  neutral: "text-ink-1",
};

export default function StatsCard({ stats = DEFAULT_STATS }) {
  return (
    <div className="relative z-20 -mt-9 mb-5 shrink-0 px-5 min-[481px]:mx-auto min-[481px]:max-w-[600px] lg:static lg:mx-0 lg:-mt-12 lg:mb-4 lg:w-full lg:max-w-none lg:px-0">
      <div className="grid grid-cols-3 overflow-hidden rounded-card bg-surface text-center shadow-card-lg divide-x divide-line-soft">
        {stats.map(({ num, modifier, label }) => (
          <div className="flex flex-col items-center gap-1 px-2 pt-4 pb-3.5" key={label}>
            <div className={`text-2xl font-extrabold leading-none tracking-[-0.03em] ${NUM_COLOR[modifier] ?? "text-ink-1"}`}>
              {num}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-ink-3">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

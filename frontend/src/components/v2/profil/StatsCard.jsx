/**
 * StatsCard
 *
 * Renders the `.stats-float-wrap > .stats-card` block with three stat items.
 *
 * Accepts an optional `stats` array so callers can supply real data later.
 * Falls back to the static placeholder values from the original page.
 *
 * stats shape: Array<{ num: string|number, modifier: string, label: string }>
 *   modifier – the BEM-style modifier appended to "stat-num" (e.g. "em", "lv", "neutral")
 */
const DEFAULT_STATS = [
  { num: 3,  modifier: "em",      label: "Arisan"    },
  { num: 3,  modifier: "lv",      label: "Patungan"  },
  { num: 18, modifier: "neutral", label: "Transaksi" },
];

export default function StatsCard({ stats = DEFAULT_STATS }) {
  return (
    <div className="stats-float-wrap">
      <div className="stats-card">
        {stats.map(({ num, modifier, label }) => (
          <div className="stat-item" key={label}>
            <div className={`stat-num ${modifier}`}>{num}</div>
            <div className="stat-lbl">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Users, AlertCircle } from "../icons";

/**
 * GroupHero — gradient hero banner with decorative blob, status badges,
 * group name, collected line, and stat row.
 *
 * The gradient fill lives in the `.group-hero` custom class (returned as
 * CUSTOM_CSS_KEPT); everything else is Tailwind.
 */
export default function GroupHero({ group, stats }) {
  return (
    <div className="group-hero relative overflow-hidden rounded-[20px] p-5">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -top-7.5 -right-7.5 h-35 w-35 rounded-full bg-white/8" />

      {/* Badge row */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1.25 rounded-full border border-white/25 bg-white/20 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.06em] text-white">
          <Users size={9} stroke="white" strokeWidth={2.5} />
          {group.status}
        </span>
        {group.urgent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(239,68,68,0.85)] px-2.5 py-1 text-[9px] font-extrabold text-white">
            <AlertCircle size={8} stroke="white" strokeWidth={2.5} />
            {group.urgent}
          </span>
        )}
      </div>

      {/* Group name */}
      <div className="mb-1 text-[24px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
        {group.title} {group.emoji}
      </div>

      {/* Collected line */}
      <div className="mb-4 text-[12px] font-semibold text-white/80">{group.collectedText}</div>

      {/* Stat row */}
      <div className="flex gap-4">
        {stats.map((s) => (
          <div className="text-center" key={s.lbl}>
            <div className="text-[18px] font-extrabold leading-none tracking-[-0.02em] text-white">{s.val}</div>
            <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-white/70">{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

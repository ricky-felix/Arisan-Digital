/**
 * MemberList — scrollable roster of all group members with status badges.
 *
 * Desktop (lg): the parent orbit-right-col renders this inside a 2-col card grid.
 * The grid behaviour is controlled by the parent wrapper classes on the card div
 * so that nth-child border rules work without a wrapper context.
 *
 * CSS classes kept (animations / complex nth-child selectors handled via Tailwind
 * peer/group workarounds are not worth the complexity — these are purely layout):
 *   None — all rules converted below.
 */
export default function MemberList({ members, onSelect }) {
  return (
    /* full-list-section: pt-4 px-5 — desktop (right-col) overrides to p-0 via parent */
    <div className="px-5 pt-4 lg:p-0">

      {/* fl-title: text-[13px]/800/ink-1/tracking-[-0.01em] mb-[10px]
          Desktop: text-[15px] mb-[14px] */}
      <div className="mb-2.5 text-[13px] font-extrabold tracking-[-0.01em] text-ink-1 lg:mb-3.5 lg:text-[15px]">
        Semua Anggota
      </div>

      {/* member-card: bg-surface rounded-card shadow-card overflow-hidden
          Desktop (right-col): grid grid-cols-2 */}
      <div className="overflow-hidden rounded-card bg-surface shadow-card lg:grid lg:grid-cols-2">
        {members.map((m, i) => (
          /* mem-row: flex items-center gap-[11px] px-3.5 py-2.5 cursor-pointer transition-colors hover:bg-gray-soft
             Divider: border-t border-line-soft on all rows after first (mobile).
             Desktop: border-t none on consecutive rows; odd rows get border-r;
                      rows from index 3+ (n+3) get border-t back.
             Encoding with peer-based nth-child isn't feasible in Tailwind; we use
             inline conditional classes via index arithmetic instead. */
          <div
            key={m.initials}
            className={[
              "flex cursor-pointer items-center gap-2.75 px-3.5 py-2.5 transition-colors hover:bg-gray-soft",
              // Mobile divider: all rows except first get a top border
              i > 0 ? "border-t border-line-soft" : "",
              // Desktop: strip the mobile top border from consecutive rows,
              // add right border to odd-index rows, restore top border from 3rd row on
              // (i%2===0 → odd child in 1-based counting → right border)
              i % 2 === 0 ? "lg:border-r lg:border-line-soft" : "",
              // Rows 2+ on desktop: no top border; rows 4+ (i >= 2 in 0-based = n+3 in CSS): top border
              i > 0 && i < 2 ? "lg:border-t-0" : "",
              i >= 2 ? "lg:border-t lg:border-line-soft" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => onSelect(i)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && onSelect(i)}
          >
            {/* mem-av-s: 34×34 circle, grid place-items-center, text-[11px] font-extrabold text-white shrink-0 */}
            <div
              className="grid h-8.5 w-8.5 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-white"
              style={{ background: m.color }}
            >
              {m.initials}
            </div>

            {/* mem-info: flex-1 */}
            <div className="min-w-0 flex-1">
              {/* mem-name: text-[13px] font-bold text-ink-1 */}
              <div className="text-[13px] font-bold text-ink-1">{m.name}</div>
              {/* mem-sub: text-[10px] text-ink-3 font-medium mt-px */}
              <div className="mt-px text-[10px] font-medium text-ink-3">{m.sub}</div>
            </div>

            {/* mem-badge: inline-flex items-center gap-[3px] px-2 py-[3px] rounded-full text-[10px] font-extrabold
                paid:    bg-brand-primary-soft text-brand-primary-hover
                unpaid:  bg-[#fee2e2] text-error
                giliran: bg-[#fef3c7] text-[#92400e] */}
            <span className={[
              "inline-flex shrink-0 items-center gap-0.75 rounded-full px-2 py-0.75 text-[10px] font-extrabold",
              m.status === "paid"
                ? "bg-brand-primary-soft text-brand-primary-hover"
                : m.status === "unpaid"
                ? "bg-error-light text-error"
                : "bg-[#fef3c7] text-[#92400e]",
            ].join(" ")}>
              {m.status === "giliran" ? "Giliran" : m.status === "paid" ? "Lunas" : "Belum"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

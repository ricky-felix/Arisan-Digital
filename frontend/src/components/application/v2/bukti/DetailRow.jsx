// ── DetailRow ────────────────────────────────────────────────────────────────
// Renders a single receipt detail row (label + value pair) inside the receipt body.
//
// Props:
//   label       {string}        – Left-side label text.
//   children    {ReactNode}     – Right-side value content.
//   last        {boolean}       – When true omits the bottom border.
//   valueClass  {string}        – Extra Tailwind class(es) appended to the value span.
//   valueStyle  {CSSProperties} – Inline styles for the value span.

export default function DetailRow({ label, children, last = false, valueClass = "", valueStyle }) {
  return (
    <div
      className={`flex items-start justify-between gap-3 py-[14px]${
        last ? "" : " border-b border-line-soft"
      }`}
    >
      <span className="shrink-0 min-w-[76px] pt-px text-[11px] font-semibold text-ink-3">
        {label}
      </span>
      <span
        className={`text-[13px] font-bold text-ink-1 text-right leading-[1.55]${
          valueClass ? " " + valueClass : ""
        }`}
        style={valueStyle}
      >
        {children}
      </span>
    </div>
  );
}

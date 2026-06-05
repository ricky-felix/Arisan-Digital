// ── DetailRow ────────────────────────────────────────────────────────────────
// Renders a single .bukti-row (label + value pair) inside the receipt body.
//
// Props:
//   label       {string}        – Left-side label text.
//   children    {ReactNode}     – Right-side value content.
//   last        {boolean}       – When true adds the .bukti-row--last modifier.
//   valueClass  {string}        – Extra class(es) appended to .bukti-row-val.
//   valueStyle  {CSSProperties} – Inline styles for the value span.

export default function DetailRow({ label, children, last = false, valueClass = "", valueStyle }) {
  const rowClass = "bukti-row" + (last ? " bukti-row--last" : "");
  const valClass  = "bukti-row-val" + (valueClass ? " " + valueClass : "");

  return (
    <div className={rowClass}>
      <span className="bukti-row-label">{label}</span>
      <span className={valClass} style={valueStyle}>
        {children}
      </span>
    </div>
  );
}

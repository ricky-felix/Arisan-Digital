// PanelRow — one `.panel-row` button inside a WalletCard panel.
//
// Props:
//   icon        — JSX node rendered inside `.pr-icon`
//   iconClass   — className modifier appended to `.pr-icon` (e.g. "em", "lv", "teal", "grey")
//   name        — string for `.pr-name`
//   meta        — string for `.pr-meta`
//   fillClass   — className modifier for `.pr-fill` (e.g. "em", "lv", "teal", "grey")
//   fillWidth   — CSS width string for the fill bar (e.g. "67%")
//   amount      — string for `.pr-amount`
//   amountClass — className modifier for `.pr-amount` (e.g. "em", "lv", "teal", "neutral")
//   badge       — { text: string, className: string } for `.pr-badge`
//   rowClass    — extra className appended to `.panel-row` (e.g. "urgent-arisan", "settled")
//   onClick     — click handler
export default function PanelRow({
  icon,
  iconClass,
  name,
  meta,
  fillClass,
  fillWidth,
  amount,
  amountClass,
  badge,
  rowClass,
  onClick,
}) {
  const rowClassName = ["panel-row", rowClass].filter(Boolean).join(" ");
  const iconClassName = ["pr-icon", iconClass].filter(Boolean).join(" ");
  const fillClassName = ["pr-fill", fillClass].filter(Boolean).join(" ");
  const amountClassName = ["pr-amount", amountClass].filter(Boolean).join(" ");

  return (
    <button type="button" className={rowClassName} onClick={onClick}>
      <div className={iconClassName}>{icon}</div>
      <div className="pr-info">
        <div className="pr-name">{name}</div>
        <div className="pr-meta">{meta}</div>
        <div className="pr-bar">
          <div className={fillClassName} style={{ width: fillWidth }} />
        </div>
      </div>
      <div className="pr-right">
        <span className={amountClassName}>{amount}</span>
        {badge && (
          <span className={["pr-badge", badge.className].filter(Boolean).join(" ")}>
            {badge.text}
          </span>
        )}
      </div>
    </button>
  );
}

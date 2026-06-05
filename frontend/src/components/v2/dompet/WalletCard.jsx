// WalletCard — collapsible card shell used for each wallet module (Arisan,
// Patungan, Dompet Grup).
//
// Props:
//   variant    — className modifier for `.module-card` (e.g. "arisan", "patungan", "dompet")
//   icon       — JSX node rendered inside `.module-card-icon`
//   label      — string for `.module-card-label`
//   name       — string for `.module-card-name`
//   desc       — string for `.module-card-desc`
//   stats      — array of { label, val, sub } for the two `.module-card-stat` cells
//   due        — { dotClass?: string, text: string, amount: string } for `.card-due-strip`
//   open       — boolean controlling the `.open` modifier and `aria-expanded`
//   onToggle   — click/keyboard handler to flip open state
//   children   — contents rendered inside `.panel-rows` (PanelRow elements)
import { ChevronDown } from "../icons";

export default function WalletCard({
  variant,
  icon,
  label,
  name,
  desc,
  stats,
  due,
  open,
  onToggle,
  children,
}) {
  const dotClassName = ["card-due-dot", due.dotClass].filter(Boolean).join(" ");

  return (
    <div className={`wallet-card${open ? " open" : ""}`}>
      <div
        className={`module-card ${variant}`}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
      >
        <div className="module-card-header">
          <div className="mch-left">
            <div className="module-card-icon">{icon}</div>
            <span className="module-card-label">{label}</span>
          </div>
          <div className="module-card-arrow" aria-hidden="true">
            <ChevronDown size={14} stroke="white" strokeWidth={2.5} />
          </div>
        </div>

        <div className="module-card-body">
          <div className="module-card-name">{name}</div>
          <div className="module-card-desc">{desc}</div>
        </div>

        <div className="module-card-stats">
          {stats.map((stat, i) => (
            <div key={i} className="module-card-stat">
              <div className="mc-stat-label">{stat.label}</div>
              <div className="mc-stat-val">{stat.val}</div>
              <div className="mc-stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="card-due-strip">
          <span className={dotClassName} />
          <span className="card-due-text">{due.text}</span>
          <span className="card-due-amount">{due.amount}</span>
        </div>
      </div>

      <div className="card-panel">
        <div className="panel-rows">{children}</div>
      </div>
    </div>
  );
}

/**
 * MenuSection
 *
 * Wraps a group of MenuRow items with an optional section-group-label and a
 * `.menu-card` container.
 *
 * Props:
 *   title    {string}      – optional label rendered as `.section-group-label`
 *                            above the card; omit (or pass undefined/null) to
 *                            skip the label element entirely (mirrors the
 *                            Keluar section which has no label).
 *   children {ReactNode}   – one or more <MenuRow /> components
 */
export default function MenuSection({ title, children }) {
  return (
    <div>
      {title && <div className="section-group-label">{title}</div>}
      <div className="menu-card">
        {children}
      </div>
    </div>
  );
}

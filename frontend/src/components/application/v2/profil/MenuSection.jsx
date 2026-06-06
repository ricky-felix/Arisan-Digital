/**
 * MenuSection — optional uppercase label + a rounded card wrapping MenuRow items.
 * Rows are separated by `divide-y` so MenuRow itself needs no border logic.
 *
 * Props:
 *   title    {string}    – optional section label; omit to skip it (Keluar section)
 *   children {ReactNode} – one or more <MenuRow /> components
 */
export default function MenuSection({ title, children }) {
  return (
    <div>
      {title && (
        <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-3">
          {title}
        </div>
      )}
      <div className="overflow-hidden rounded-card bg-surface shadow-card divide-y divide-line-soft">
        {children}
      </div>
    </div>
  );
}

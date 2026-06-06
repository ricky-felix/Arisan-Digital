/**
 * ProgressIuran — "Progres Iuran Bulan Ini" labelled progress bar with meta row.
 *
 * The gradient fill lives in the `.prog-fill` custom class (returned as
 * CUSTOM_CSS_KEPT); everything else is Tailwind.
 */
export default function ProgressIuran({ progress }) {
  return (
    <div className="w-full">
      {/* Label + percentage */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-extrabold text-ink-1">{progress.label}</span>
        <span className="text-[12px] font-extrabold text-brand-primary-hover">{progress.pct}%</span>
      </div>

      {/* Track */}
      <div className="mb-1.25 h-3 overflow-hidden rounded-full bg-line-soft">
        <div className="prog-fill h-full rounded-full" style={{ width: `${progress.pct}%` }} />
      </div>

      {/* Meta row */}
      <div className="flex justify-between text-[10px] font-semibold text-ink-3">
        <span>{progress.left}</span>
        <span>{progress.right}</span>
      </div>
    </div>
  );
}

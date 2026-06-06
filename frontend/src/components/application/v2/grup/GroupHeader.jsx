import { ChevronLeft } from "../icons";

/** Sticky top bar: full-bleed surface, content aligned to the shared column. */
export default function GroupHeader({ title, sub, onBack }) {
  return (
    <div className="sticky top-0 z-10 w-full border-b border-line-soft bg-surface">
      <div className="mx-auto flex w-full max-w-140 items-center gap-3 px-5 py-3.5 lg:max-w-300 lg:px-8">
        <button
          type="button"
          aria-label="Kembali"
          onClick={onBack}
          className="grid h-8.5 w-8.5 shrink-0 cursor-pointer place-items-center rounded-[10px] bg-gray-soft text-ink-1"
        >
          <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-base font-extrabold tracking-[-0.02em] text-ink-1">{title}</div>
          <div className="mt-px text-[11px] font-medium text-ink-2">{sub}</div>
        </div>
      </div>
    </div>
  );
}

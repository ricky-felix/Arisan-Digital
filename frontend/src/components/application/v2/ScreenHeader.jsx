import { ChevronLeft } from "./icons";

/**
 * ScreenHeader — the standard v2 sub-page navbar/header.
 *
 * THE container pattern (use this on every sub-page, don't hand-roll a header):
 * a full-width sticky bar (surface + blur + bottom hairline) whose inner content
 * is aligned to a centered 1200px band — `mx-auto max-w-[1200px] px-5 lg:px-8`,
 * the same band the Profil hero uses. The band keeps the back button + title at a
 * consistent slight inset on every screen and caps the inset on wide desktops,
 * independent of each page's (usually narrower) content-column width.
 *
 * Props:
 *   title    {string}      – screen title, rendered as the page <h1>
 *   sub      {string}      – optional second line under the title (e.g. a count)
 *   onBack   {() => void}  – back handler; omit to render no back button
 *   children {ReactNode}   – optional right-aligned slot (save button, spinner…)
 */
export default function ScreenHeader({ title, sub, onBack, children }) {
  return (
    <div className="sticky top-0 z-30 bg-surface/95 shadow-[0_1px_0_0_var(--color-line-soft)] backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-300 items-center gap-3 px-5 py-3 lg:px-8">
        {onBack && (
          <button
            type="button"
            aria-label="Kembali"
            onClick={onBack}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-gray-soft text-ink-2 transition-colors hover:bg-line active:bg-line"
          >
            <ChevronLeft size={17} strokeWidth={2.5} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-extrabold leading-none tracking-[-0.02em] text-ink-1">
            {title}
          </h1>
          {sub && <p className="mt-1 truncate text-[12px] font-medium text-ink-2">{sub}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

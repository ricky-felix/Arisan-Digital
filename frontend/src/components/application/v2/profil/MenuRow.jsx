import { ChevronRight } from "../icons";

/**
 * MenuRow — one tappable row inside a menu card.
 *
 * Props:
 *   icon      {JSX.Element}  – icon rendered inside the colored tile
 *   tileClass {string}       – tile color key: "em" | "lv" | "gray" | "warn" | ""
 *   label     {string}       – primary row label
 *   sub       {string}       – optional secondary label
 *   danger    {boolean}      – red treatment + no trailing chevron (Keluar row)
 *   onClick   {() => void}   – click handler
 */
const TILE = {
  em: "bg-brand-primary-soft text-brand-primary-hover",
  lv: "bg-brand-secondary-soft text-brand-secondary-dark",
  gray: "bg-gray-soft text-ink-2",
  warn: "bg-[#fff7ed] text-[#c2410c]",
  "": "",
};

export default function MenuRow({ icon, tileClass = "", label, sub, danger = false, onClick }) {
  const tile = danger ? "bg-error-light text-error" : TILE[tileClass] ?? "";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-h-14 items-center gap-3.5 px-4 py-3 text-left transition-colors hover:bg-gray-soft"
    >
      <div className={`grid h-9.5 w-9.5 shrink-0 place-items-center rounded-[11px] ${tile}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className={`text-sm font-semibold leading-tight ${danger ? "text-error" : "text-ink-1"}`}>
          {label}
        </div>
        {sub && <div className="mt-0.5 text-[11px] font-medium leading-[1.3] text-ink-3">{sub}</div>}
      </div>
      {!danger && <ChevronRight className="shrink-0 text-ink-3" size={14} strokeWidth={2.5} />}
    </button>
  );
}

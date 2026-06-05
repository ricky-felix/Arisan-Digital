import { ChevronRight } from "../icons";

/**
 * MenuRow
 *
 * Renders one `.menu-row` button inside a menu card.
 *
 * Props:
 *   icon      {JSX.Element}  – icon element rendered inside the tile
 *   tileClass {string}       – BEM modifier appended to "menu-icon-tile" (e.g. "em", "lv", "gray")
 *                              Pass "" or omit for no modifier (used on the Keluar/danger row).
 *   label     {string}       – primary row label
 *   sub       {string}       – optional secondary/sub label; omitted when not provided
 *   danger    {boolean}      – when true, adds the "danger" class and hides the trailing chevron
 *   onClick   {() => void}   – click handler
 */
export default function MenuRow({ icon, tileClass = "", label, sub, danger = false, onClick }) {
  const tileClassName = tileClass
    ? `menu-icon-tile ${tileClass}`
    : "menu-icon-tile";

  return (
    <button
      type="button"
      className={danger ? "menu-row danger" : "menu-row"}
      onClick={onClick}
    >
      <div className={tileClassName}>
        {icon}
      </div>
      <div className="menu-row-body">
        <div className="menu-row-label">{label}</div>
        {sub && <div className="menu-row-sub">{sub}</div>}
      </div>
      {/* The Keluar (danger) row has no trailing chevron in the original */}
      {!danger && (
        <ChevronRight
          className="text-ink-3 shrink-0"
          size={14}
          strokeWidth={2.5}
        />
      )}
    </button>
  );
}

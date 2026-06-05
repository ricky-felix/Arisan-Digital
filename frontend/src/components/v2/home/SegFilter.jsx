import { Fragment, useState } from "react";
import { ChevronDown, Check } from "../icons";

/**
 * SegFilter — segmented filter for the home deck.
 *
 * Two filter dimensions are offered:
 *   Jenis  — semua / arisan / patungan   (by type)
 *   Status — tenggat / selesai           (near-or-past deadline / completed)
 *
 * Responsive presentation:
 *   ≥1024px (desktop) — a grouped segmented pill, type and status split by a
 *                       divider, every option visible at once.
 *   <1024px (mobile)  — a compact collapsible chip showing the current filter
 *                       that opens a grouped dropdown menu.
 *
 * Props:
 *   value    string                     — currently active filter
 *   onChange (value: string) => void    — called when a filter is chosen
 */
const GROUPS = [
  {
    label: "Jenis",
    options: [
      { v: "semua", label: "Semua" },
      { v: "arisan", label: "Arisan" },
      { v: "patungan", label: "Patungan" },
    ],
  },
  {
    label: "Status",
    options: [
      { v: "tenggat", label: "Jatuh Tempo" },
      { v: "selesai", label: "Selesai" },
    ],
  },
];

const ALL = GROUPS.flatMap((g) => g.options);

export default function SegFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const current = ALL.find((o) => o.v === value) || ALL[0];

  function pick(v) {
    onChange(v);
    setOpen(false);
  }

  return (
    <div className="seg-row">

      {/* Desktop: grouped segmented pill */}
      <div className="seg-wrap seg-grouped">
        {GROUPS.map((g, gi) => (
          <Fragment key={g.label}>
            {gi > 0 && <span className="seg-divider" aria-hidden="true" />}
            {g.options.map((o) => (
              <button
                key={o.v}
                type="button"
                className={`seg-btn${value === o.v ? " active" : ""}`}
                onClick={() => onChange(o.v)}
              >
                {o.label}
              </button>
            ))}
          </Fragment>
        ))}
      </div>

      {/* Mobile: collapsible dropdown */}
      <div className="seg-collapse">
        <button
          type="button"
          className={`seg-trigger${open ? " open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {current.label}
          <ChevronDown size={14} stroke="currentColor" strokeWidth={2.5} className="seg-trigger-chevron" />
        </button>

        {open && (
          <>
            <div className="seg-menu-backdrop" onClick={() => setOpen(false)} />
            <div className="seg-menu" role="listbox">
              {GROUPS.map((g) => (
                <div className="seg-menu-section" key={g.label}>
                  <div className="seg-menu-group">{g.label}</div>
                  {g.options.map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      role="option"
                      aria-selected={value === o.v}
                      className={`seg-menu-item${value === o.v ? " active" : ""}`}
                      onClick={() => pick(o.v)}
                    >
                      {o.label}
                      {value === o.v && <Check size={14} stroke="currentColor" strokeWidth={2.5} />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

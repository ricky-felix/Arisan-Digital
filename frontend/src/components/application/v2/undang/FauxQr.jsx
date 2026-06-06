// FauxQr — a decorative, deterministic QR-style graphic.
// Looks convincingly like a scannable code without pulling in a QR library
// (this is mock UI for the MVP invite screen). Pattern is stable per render.

const SIZE = 23; // modules per side

// The three 7×7 "finder" squares (top-left, top-right, bottom-left).
function inFinderRegion(r, c) {
  const inBox = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
  return inBox(0, 0) || inBox(0, SIZE - 7) || inBox(SIZE - 7, 0);
}

// Filled cells of a finder pattern: outer ring + solid 3×3 centre.
function finderOn(r, c) {
  const local = (r0, c0) => {
    const rr = r - r0;
    const cc = c - c0;
    if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true; // outer ring
    if (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) return true; // inner block
    return false;
  };
  if (r < 7 && c < 7) return local(0, 0);
  if (r < 7 && c >= SIZE - 7) return local(0, SIZE - 7);
  if (r >= SIZE - 7 && c < 7) return local(SIZE - 7, 0);
  return false;
}

// Deterministic ~45% fill for the data region.
function dataOn(r, c) {
  const h = (r * 73856093) ^ (c * 19349663) ^ ((r + c) * 83492791);
  return (h & 7) > 3;
}

/**
 * FauxQr — decorative QR-style SVG graphic.
 *
 * Props:
 *   size      {number}  – rendered width/height in px (default 196)
 *   fillColor {string}  – SVG rect fill color (default "currentColor")
 *                         Pass "#312e81" for patungan variant, or use
 *                         a CSS class/var token such as "var(--color-ink-1)".
 */
export default function FauxQr({ size = 196, fillColor = "var(--color-ink-1)" }) {
  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const on = inFinderRegion(r, c) ? finderOn(r, c) : dataOn(r, c);
      if (on) {
        cells.push(
          <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} rx={0.2} fill={fillColor} />
        );
      }
    }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Kode QR undangan"
      shapeRendering="crispEdges"
    >
      {cells}
    </svg>
  );
}

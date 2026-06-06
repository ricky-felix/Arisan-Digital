// ── Variant-driven values for BuktiTransfer ─────────────────────────────────
// Returns all the display values that differ between ?type=arisan and
// the default (patungan) view.

export function getBuktiVariant(isArisan) {
  return {
    headerGradient: isArisan
      ? "linear-gradient(165deg, #059669 0%, #10b981 45%, #34d399 100%)"
      : "linear-gradient(165deg, #4c1d95 0%, #6d28d9 50%, #8b5cf6 100%)",

    primaryBtnBg:      isArisan ? "#059669"          : "#6d28d9",
    primaryBtnShadow:  isArisan ? "rgba(5,150,105,.35)" : "rgba(109,40,217,.35)",

    secondaryBtnBg:     isArisan ? "#ecfdf5" : "#f5f3ff",
    secondaryBtnBorder: isArisan ? "#a7f3d0" : "#ddd6fe",
    secondaryBtnColor:  isArisan ? "#065f46" : "#5b21b6",

    accentColor: isArisan ? "#059669" : "#6d28d9",

    amount:    "Rp 200.000",
    amountSub: isArisan
      ? "Arisan · Arisan Kompleks Putaran 3"
      : "Bagianmu · Patungan Tiket Konser",

    rowKe:    isArisan ? "Dompet Grup\nArisan Kompleks" : "Ari Nugraha",
    rowUntuk: isArisan ? "Iuran Arisan Kompleks\nPutaran 3" : "Patungan —\nTiket Konser",
    rowLabel: isArisan ? "Jumlah"  : "Bagianmu",
    rowJenis: isArisan ? "Arisan"  : "Patungan",
  };
}

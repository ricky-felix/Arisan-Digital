// ── ReceiptActions ───────────────────────────────────────────────────────────
// Action button strip: "Bagikan Bukti" (primary) and "Simpan sebagai Gambar" (secondary).
// Fixed to viewport bottom on mobile, static inside the bill column on desktop.
//
// Props:
//   primaryBtnBg      {string}   – background color for the primary button.
//   primaryBtnShadow  {string}   – box-shadow color string for the primary button.
//   secondaryBtnBg    {string}   – background for the secondary button.
//   secondaryBtnBorder {string}  – border color for the secondary button.
//   secondaryBtnColor  {string}  – text/icon color for the secondary button.
//   onShare           {function} – Click handler for "Bagikan Bukti".
//   onSave            {function} – Click handler for "Simpan sebagai Gambar".

import { Share, ImageProof } from "../icons";

export default function ReceiptActions({
  primaryBtnBg,
  primaryBtnShadow,
  secondaryBtnBg,
  secondaryBtnBorder,
  secondaryBtnColor,
  onShare,
  onSave,
}) {
  return (
    /*
      Mobile: fixed bottom bar with gradient fade, full-width, centered to 480px
        column at ≥481px (via left-1/2 -translate-x-1/2).
      Desktop (≥1024px): static, transparent bg, padding adjusted.
    */
    <div
      className={[
        /* mobile: fixed */
        "fixed bottom-0 left-0 right-0 z-50",
        "flex flex-col gap-2 px-4 pt-2.5 pb-6.5",
        "[background:linear-gradient(to_top,var(--color-app-bg)_72%,transparent)]",
        /* tablet ≥481px: center-align to the 480px column */
        "min-[481px]:left-1/2 min-[481px]:-translate-x-1/2 min-[481px]:w-[min(480px,100%)]",
        /* desktop ≥1024px: back to static, no gradient */
        "lg:static lg:translate-x-0 lg:w-auto lg:bg-transparent lg:[background:none] lg:px-4 lg:pt-4 lg:pb-2",
      ].join(" ")}
    >
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border-none px-4 py-3.75 text-[15px] font-extrabold tracking-[-0.01em] text-white transition-[transform,opacity] duration-100 active:scale-[.98]"
        style={{
          background: primaryBtnBg,
          boxShadow: `0 4px 16px ${primaryBtnShadow}`,
        }}
        onClick={onShare}
      >
        <Share size={16} stroke="currentColor" strokeWidth={2} />
        Bagikan Bukti
      </button>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border-[1.5px] border-solid px-4 py-3 text-[14px] font-bold tracking-[-0.01em] transition-opacity duration-150 active:scale-[.98]"
        style={{
          background: secondaryBtnBg,
          borderColor: secondaryBtnBorder,
          color: secondaryBtnColor,
        }}
        onClick={onSave}
      >
        <ImageProof size={15} stroke="currentColor" strokeWidth={2.5} />
        Simpan sebagai Gambar
      </button>
    </div>
  );
}

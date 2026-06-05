// ── ReceiptActions ───────────────────────────────────────────────────────────
// The .bukti-actions row: "Bagikan Bukti" (primary) and
// "Simpan sebagai Gambar" (secondary) buttons.
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
    <div className="bukti-actions">
      <button
        type="button"
        className="bukti-btn-primary"
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
        className="bukti-btn-secondary"
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

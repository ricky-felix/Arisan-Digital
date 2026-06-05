// ── ReceiptCard ──────────────────────────────────────────────────────────────
// The entire .bukti-paper receipt card: gradient banner, perforated divider,
// detail rows, reference sub-card, and branded footer.
//
// Props:
//   headerGradient {string} – CSS gradient string for the banner background.
//   amount         {string} – Formatted amount string, e.g. "Rp 200.000".
//   amountSub      {string} – Subtitle shown under the amount in the hero area.
//   rowKe          {string} – "Ke" row value; may contain "\n" for line breaks.
//   rowUntuk       {string} – "Untuk" row value; may contain "\n" for line breaks.
//   rowLabel       {string} – Label for the amount row ("Jumlah" or "Bagianmu").
//   rowJenis       {string} – Jenis value in the reference sub-card.
//   accentColor    {string} – CSS color for accented values (amount, method, ref).

import { Check } from "../icons";
import DetailRow from "./DetailRow";

// Splits a string on "\n" and injects <br /> between lines.
function MultiLine({ text }) {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <span key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

export default function ReceiptCard({
  headerGradient,
  amount,
  amountSub,
  rowKe,
  rowUntuk,
  rowLabel,
  rowJenis,
  accentColor,
}) {
  return (
    <div className="bukti-paper">

      {/* 2a. Gradient banner */}
      <div className="bukti-banner" style={{ background: headerGradient }}>
        {/* Decorative blobs */}
        <div className="bukti-blob bukti-blob-1" />
        <div className="bukti-blob bukti-blob-2" />

        {/* Brand row */}
        <div className="bukti-brand-row">
          <div className="bukti-logo">
            <span className="bukti-logo-letter">A</span>
          </div>
          <div>
            <div className="bukti-wordmark">Arisan Digital</div>
            <div className="bukti-wordmark-sub">Platform Keuangan Sosial</div>
          </div>
          <div className="bukti-type-chip">Bukti Transfer</div>
        </div>

        {/* 2b. Success hero */}
        <div className="bukti-success-hero">
          {/* Check ring */}
          <div className="bukti-check-ring">
            <Check size={26} stroke="white" strokeWidth={3} />
          </div>
          <div className="bukti-success-label">Pembayaran Berhasil</div>
          <div className="bukti-success-amount">{amount}</div>
          <div className="bukti-success-sub">{amountSub}</div>
        </div>
      </div>

      {/* 2c. Perforated ticket divider */}
      <div className="bukti-perforate">
        <div className="bukti-hole" />
        <div className="bukti-perforate-line" />
        <div className="bukti-hole" />
      </div>

      {/* 2d. Detail rows */}
      <div className="bukti-body">

        <DetailRow label="Dari">
          Ricky Felix
        </DetailRow>

        <DetailRow label="Ke">
          <MultiLine text={rowKe} />
        </DetailRow>

        <DetailRow label="Untuk">
          <MultiLine text={rowUntuk} />
        </DetailRow>

        <DetailRow
          label={rowLabel}
          valueClass="bukti-row-val--large"
          valueStyle={{ color: accentColor }}
        >
          {amount}
        </DetailRow>

        <DetailRow label="Tanggal">
          5 Jun 2026, 09:41 WIB
        </DetailRow>

        <DetailRow label="Metode" valueStyle={{ color: accentColor }}>
          GoPay
        </DetailRow>

        <DetailRow label="Status" last>
          <span className="bukti-status-badge">
            <Check size={9} stroke="currentColor" strokeWidth={3} />
            Berhasil
          </span>
        </DetailRow>

      </div>{/* /bukti-body */}

      {/* 2e. Reference sub-card */}
      <div className="bukti-meta-block">
        <div>
          <div className="bukti-meta-label">No. Referensi</div>
          <div className="bukti-meta-val" style={{ color: accentColor }}>
            TRX-AD-20260605-0042
          </div>
        </div>
        <div>
          <div className="bukti-meta-label">Jenis</div>
          <div className="bukti-meta-val">{rowJenis}</div>
        </div>
      </div>

      {/* Branded footer inside card */}
      <div className="bukti-footer">
        <div className="bukti-footer-logo">A</div>
        <span className="bukti-footer-text">Dibuat dengan Arisan Digital</span>
      </div>

    </div>
  );
}

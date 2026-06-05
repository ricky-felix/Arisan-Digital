import { useNavigate, useSearchParams } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { ChevronLeft, Share } from "../../../components/v2/icons";
import { getBuktiVariant } from "../../../components/v2/bukti/variants";
import ReceiptCard from "../../../components/v2/bukti/ReceiptCard";
import ReceiptActions from "../../../components/v2/bukti/ReceiptActions";

export default function BuktiTransfer() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();

  // Variant: ?type=arisan → emerald/arisan, default → lavender/patungan
  const isArisan = params.get("type") === "arisan";

  const {
    headerGradient,
    primaryBtnBg,
    primaryBtnShadow,
    secondaryBtnBg,
    secondaryBtnBorder,
    secondaryBtnColor,
    accentColor,
    amount,
    amountSub,
    rowKe,
    rowUntuk,
    rowLabel,
    rowJenis,
  } = getBuktiVariant(isArisan);

  return (
    <div className="v2-screen v2-bukti">
      {/*
        v2-inner is intentionally NOT used here — this screen has its own
        centered narrow-column layout that constrains header + card + buttons
        together inside a max-480px column, sitting on a full-bleed bg-app-bg.
      */}
      <div className="bukti-scroll-area">

        {/* ── 1. Full-width sticky header bar (consistent with other pages) ── */}
        <div className="bukti-nav">
          <button
            type="button"
            className="bukti-nav-btn"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>
          <span className="bukti-nav-title">Bukti Transfer</span>
          <button
            type="button"
            className="bukti-nav-btn"
            onClick={() => toast("Bukti transfer dibagikan")}
            aria-label="Bagikan bukti transfer"
          >
            <Share size={16} stroke="currentColor" strokeWidth={2} />
          </button>
        </div>

        {/* ── Bill column ── */}
        <div className="bukti-col">

          {/* ── 2. Receipt card ── */}
          <ReceiptCard
            headerGradient={headerGradient}
            amount={amount}
            amountSub={amountSub}
            rowKe={rowKe}
            rowUntuk={rowUntuk}
            rowLabel={rowLabel}
            rowJenis={rowJenis}
            accentColor={accentColor}
          />

          {/* ── 3. Action buttons ── */}
          <ReceiptActions
            primaryBtnBg={primaryBtnBg}
            primaryBtnShadow={primaryBtnShadow}
            secondaryBtnBg={secondaryBtnBg}
            secondaryBtnBorder={secondaryBtnBorder}
            secondaryBtnColor={secondaryBtnColor}
            onShare={() => toast("Bukti dikirim ke grup")}
            onSave={() => toast("Tersimpan ke galeri")}
          />

          {/* Bottom spacer */}
          <div className="h-8" />

        </div>{/* /bukti-col */}
      </div>{/* /bukti-scroll-area */}
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { ChevronLeft, Share } from "../../../components/application/v2/icons";
import { getBuktiVariant } from "../../../components/application/v2/bukti/variants";
import ReceiptCard from "../../../components/application/v2/bukti/ReceiptCard";
import ReceiptActions from "../../../components/application/v2/bukti/ReceiptActions";

export default function BuktiTransfer() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();

  // Variant: ?type=arisan → emerald/arisan, default → lavender/patungan
  const isArisan = params.get("type") === "arisan";

  // Reference number — randomly generated per receipt via UUID. Lazy-initialized
  // so it stays stable across re-renders. Prefix encodes the product domain:
  // ADA = Arisan Digital Arisan, ADP = Arisan Digital Patungan. (TODO: replace
  // with the real transaction ID once the payment backend returns one.)
  const [refNo] = useState(
    () => `TRX-${isArisan ? "ADA" : "ADP"}-${crypto.randomUUID().split("-")[0].toUpperCase()}`,
  );

  // Copy the reference number to the clipboard with a confirmation toast.
  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(refNo);
      toast("No. referensi disalin");
    } catch {
      toast("Gagal menyalin no. referensi");
    }
  };

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
    <div className="v2-screen">
      {/*
        v2-inner is intentionally NOT used here — this screen owns its own
        full-bleed scroll area with a centered 480px column.
      */}

      {/*
        bukti-scroll-area:
          w-full min-h-svh bg-app-bg overflow-y-auto overflow-x-hidden
          flex flex-col items-center pb-30 scrollbar-none
          lg:pb-12
      */}
      <div
        className={[
          "flex w-full min-h-svh flex-col items-center overflow-x-hidden overflow-y-auto",
          "bg-app-bg pb-30",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "lg:pb-12",
        ].join(" ")}
      >

        {/*
          bukti-nav:
            w-full sticky top-0 z-10 min-h-14 flex items-center gap-3
            bg-surface border-b border-line-soft flex-shrink-0 px-5
            min-[481px]:px-5  (tablet: same, from @media 481px rule)
            lg:sticky lg:top-0 lg:z-10 lg:min-h-14
            lg:px-[max(clamp(24px,5vw,64px),calc(50%-600px))]
        */}
        <div
          className={[
            "sticky top-0 z-10 flex w-full min-h-14 shrink-0 items-center gap-3",
            "bg-surface border-b border-line-soft px-5",
            "min-[481px]:px-5",
            "lg:px-[max(clamp(24px,5vw,64px),calc(50%-600px))]",
          ].join(" ")}
        >
          {/* bukti-nav-btn: w-8.5 h-8.5 rounded-[10px] bg-gray-soft grid place-items-center text-ink-1 cursor-pointer transition-colors hover:bg-line */}
          <button
            type="button"
            className="grid h-8.5 w-8.5 shrink-0 cursor-pointer place-items-center rounded-[10px] bg-gray-soft text-ink-1 transition-colors hover:bg-line"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>

          {/* bukti-nav-title: flex-1 text-[17px] font-extrabold text-ink-1 tracking-[-0.02em] */}
          <span className="flex-1 text-[17px] font-extrabold tracking-[-0.02em] text-ink-1">
            Bukti Transfer
          </span>

          <button
            type="button"
            className="grid h-8.5 w-8.5 shrink-0 cursor-pointer place-items-center rounded-[10px] bg-gray-soft text-ink-1 transition-colors hover:bg-line"
            onClick={() => toast("Bukti transfer dibagikan")}
            aria-label="Bagikan bukti transfer"
          >
            <Share size={16} stroke="currentColor" strokeWidth={2} />
          </button>
        </div>

        {/*
          bukti-col:
            w-full max-w-120 flex flex-col
            lg:max-w-160 lg:mx-auto
        */}
        <div className="flex w-full max-w-120 flex-col lg:mx-auto">

          <ReceiptCard
            headerGradient={headerGradient}
            amount={amount}
            amountSub={amountSub}
            rowKe={rowKe}
            rowUntuk={rowUntuk}
            rowLabel={rowLabel}
            rowJenis={rowJenis}
            refNo={refNo}
            onCopyRef={copyRef}
            accentColor={accentColor}
          />

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

        </div>
      </div>
    </div>
  );
}

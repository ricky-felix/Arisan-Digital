import { Check, Bell, WalletRounded } from "../icons";

/**
 * SuggestBar — quick-reply chip row at the bottom of the notification feed.
 *
 * Props:
 *   onMarkRead    () => void   — "Tandai semua dibaca"
 *   onRemind      () => void   — "Ingatkan yang belum bayar"
 *   onOpenWallet  () => void   — "Buka Dompet"
 */
export default function SuggestBar({ onMarkRead, onRemind, onOpenWallet }) {
  return (
    <div className="suggest-bar">
      <button type="button" className="suggest-chip" onClick={onMarkRead}>
        <Check size={13} strokeWidth={2.5} />
        Tandai semua dibaca
      </button>
      <button type="button" className="suggest-chip lv" onClick={onRemind}>
        <Bell size={13} strokeWidth={2.2} />
        Ingatkan yang belum bayar
      </button>
      <button type="button" className="suggest-chip" onClick={onOpenWallet}>
        <WalletRounded size={13} strokeWidth={2.2} />
        Buka Dompet
      </button>
    </div>
  );
}

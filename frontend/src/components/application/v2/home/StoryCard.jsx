import {
  Users,
  Split,
  Check,
  Card,
  Send,
  AlertTriangle,
  ImageProof,
  AlertCircle,
  ChevronRight,
} from "../icons";
import CardBlobs from "./CardBlobs";

/**
 * StoryCard — renders a single card in the home deck carousel.
 *
 * Props:
 *   card      object    — card data object from ALL_CARDS
 *   isPaid    boolean   — whether this card has been marked as paid
 *   cardClass string    — positional class: "card-active" | "card-prev" | "card-next" | "card-hidden"
 *   onCta     () => void — called when the CTA button is pressed
 *   onOpen    () => void — called when the card body is tapped (open group detail / members)
 */
export default function StoryCard({ card, isPaid, cardClass, onCta, onOpen }) {
  const isActive = cardClass === "card-active";

  // Only the small group label (eyebrow) opens the group — not the whole card.
  const openable = isActive && !!onOpen;
  const cardBg = card.settled
    ? "card-settled"
    : card.urgent
    ? "card-urgent"
    : card.type === "patungan"
    ? "card-patungan"
    : "card-arisan";

  return (
    <div className={`story-card ${cardBg} ${cardClass}`}>
      <CardBlobs />

      {/* Paid overlay */}
      {isPaid && (
        <div className="paid-overlay show">
          <div className="paid-check">
            <Check size={30} stroke="white" strokeWidth={3} />
          </div>
          <div className="paid-label">Iuran Lunas!</div>
          <div className="paid-sub">{card.amount} via GoPay</div>
        </div>
      )}

      {/* Chips — alert/status chip(s) always sit ABOVE the type chip */}
      <div className="card-chips">
        {card.urgent && (
          <span className="urgent-badge">
            <AlertCircle size={9} stroke="currentColor" strokeWidth={2.5} />
            {card.urgent}
          </span>
        )}
        {card.settled && (
          <span className="status-badge">
            <Check size={9} stroke="white" strokeWidth={2.5} />
            Selesai
          </span>
        )}
        {/* Type chip — always shown, regardless of status */}
        <div className="card-badge">
          {card.type === "patungan"
            ? <Split size={9} stroke="white" strokeWidth={2.5} />
            : <Users size={9} stroke="white" strokeWidth={2.5} />}
          {card.type === "patungan" ? "Patungan" : "Arisan"}
        </div>
      </div>

      {/* Amount hero hierarchy — the eyebrow (group label) is the only
          tap target that opens the group's members. */}
      {openable ? (
        <button type="button" className="card-eyebrow openable" onClick={onOpen}>
          <span>{card.eyebrow}</span>
          <ChevronRight size={13} stroke="currentColor" strokeWidth={2.5} />
        </button>
      ) : (
        <div className="card-eyebrow">{card.eyebrow}</div>
      )}
      <div className="card-hero-amount">{card.amount}</div>
      <div className="card-due-line">{card.due}</div>

      <div className="progress-track">
        <div className="progress-fill-white" style={{ width: `${card.progress}%` }} />
      </div>
      <div className="progress-labels">
        <span>{card.progressLabel[0]}</span>
        <span>{card.progressLabel[1]}</span>
      </div>

      {/* CTA */}
      {card.settled ? (
        <button
          type="button"
          className={`settled-cta ${card.ctaVariant}`}
          onClick={onCta}
        >
          <ImageProof size={16} stroke="white" strokeWidth={2.5} />
          <span>
            {card.ctaLabel}
            <span className="settled-cta-hint">{card.ctaHint}</span>
          </span>
        </button>
      ) : (
        <button
          type="button"
          className={`card-cta ${card.urgent ? "urgent-cta" : card.type === "patungan" ? "patungan-cta" : "arisan-cta"}`}
          onClick={onCta}
        >
          {card.ctaType === "pay" && <Card size={16} stroke="currentColor" strokeWidth={2.5} />}
          {card.ctaType === "remind" && <Send size={16} stroke="currentColor" strokeWidth={2.5} />}
          {card.ctaType === "collect" && <AlertTriangle size={16} stroke="currentColor" strokeWidth={2.5} />}
          {card.ctaLabel}
        </button>
      )}
    </div>
  );
}

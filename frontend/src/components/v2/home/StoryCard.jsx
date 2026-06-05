import { useMemo } from "react";
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

/** Generate a random set of drifting background blobs (3–6 of them). */
function makeBlobs() {
  const count = 3 + Math.floor(Math.random() * 4); // 3..6
  return Array.from({ length: count }, (_, i) => ({
    key: i,
    size: Math.round(90 + Math.random() * 130), // 90..220px
    top: Math.round(-12 + Math.random() * 92),   // % within (and slightly past) the card
    left: Math.round(-15 + Math.random() * 95),
    opacity: (0.03 + Math.random() * 0.06).toFixed(3),
    duration: Math.round(12 + Math.random() * 8), // 12..20s
    delay: Math.round(Math.random() * 12),        // staggered starts
    anim: i % 2 === 0 ? "blob-drift-1" : "blob-drift-2",
  }));
}

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

  // Computed once per card instance so the blobs stay put instead of jumping each render.
  const blobs = useMemo(() => makeBlobs(), []);

  return (
    <div className={`story-card ${cardBg} ${cardClass}`}>
      {blobs.map((b) => (
        <div
          key={b.key}
          className="card-blob"
          style={{
            width: b.size,
            height: b.size,
            top: `${b.top}%`,
            left: `${b.left}%`,
            background: `rgba(255,255,255,${b.opacity})`,
            animation: `${b.anim} ${b.duration}s ease-in-out -${b.delay}s infinite`,
          }}
        />
      ))}

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

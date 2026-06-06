import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../styles/app-v2.css";
import PaySheet from "../../../components/application/v2/PaySheet";
import ComposeSheet from "../../../components/application/v2/ComposeSheet";
import CoachMarks from "../../../components/application/v2/CoachMarks";
import { useToast } from "../../../context/ToastContext";

// First-run coach-mark gate. Defaults to "seen" if storage is unavailable so a
// private-mode visitor is never trapped, and skips the dev /screens/* capture
// routes so headless screenshots stay deterministic.
const COACH_KEY = "arisan.v2.coachSeen";
import { ChevronLeft, ChevronRight } from "../../../components/application/v2/icons";
import { ALL_CARDS } from "../../../components/application/v2/home/data";
import StoryTopBar from "../../../components/application/v2/home/StoryTopBar";
import SegFilter from "../../../components/application/v2/home/SegFilter";
import StoryCard from "../../../components/application/v2/home/StoryCard";
import EmptyCard from "../../../components/application/v2/home/EmptyCard";

export default function HomeDeck({ cards = ALL_CARDS }) {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [filter, setFilter] = useState("semua");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [paidCards, setPaidCards] = useState({});
  const [paySheet, setPaySheet] = useState({ open: false, card: null });
  const [composeOpen, setComposeOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(() => {
    if (location.pathname.startsWith("/screens")) return false;
    try {
      return localStorage.getItem(COACH_KEY) !== "1";
    } catch {
      return false;
    }
  });

  function closeCoach() {
    try {
      localStorage.setItem(COACH_KEY, "1");
    } catch {
      /* private mode — flag just won't persist */
    }
    setCoachOpen(false);
  }

  // Filtered visible cards — by type (arisan/patungan) or by status
  // (tenggat = nearing/passed deadline, selesai = completed).
  const visibleCards = cards.filter(c => {
    switch (filter) {
      case "arisan":
      case "patungan":
        return c.type === filter;
      case "tenggat":
        return !c.settled && (c.status === "soon" || c.status === "overdue");
      case "selesai":
        return !!c.settled;
      default:
        return true; // "semua"
    }
  });

  // Clamp index when filter changes
  useEffect(() => {
    setCurrentIdx(0);
  }, [filter]);

  const safeIdx = Math.min(currentIdx, Math.max(visibleCards.length - 1, 0));

  function prevCard() {
    setCurrentIdx(i => Math.max(0, i - 1));
  }
  function nextCard() {
    setCurrentIdx(i => Math.min(visibleCards.length - 1, i + 1));
  }

  function getCardClass(idx) {
    if (idx === safeIdx) return "card-active";
    if (idx === safeIdx - 1) return "card-prev";
    if (idx === safeIdx + 1) return "card-next";
    return "card-hidden";
  }

  function openPaySheet(card) {
    setPaySheet({ open: true, card });
  }
  function closePaySheet() {
    setPaySheet({ open: false, card: null });
  }
  function handlePaid() {
    if (paySheet.card) {
      setPaidCards(p => ({ ...p, [paySheet.card.id]: true }));
    }
  }

  function fireReminder(card) {
    const msg = card.ctaType === "collect"
      ? `Tagihan dikirim ke ${card.reminderCount} orang`
      : `Pengingat terkirim ke ${card.reminderCount} teman`;
    toast(msg);
  }

  function handleCta(card) {
    if (card.ctaType === "pay") {
      openPaySheet(card);
    } else if (card.ctaType === "remind" || card.ctaType === "collect") {
      fireReminder(card);
    } else if (card.ctaType === "proof") {
      navigate(`/app/bukti?type=${card.type}`);
    }
  }

  // Background color drives the screen bg (visible behind the card deck on
  // mobile) — mirrors the card gradient so settled/urgent/type stay consistent.
  // With no cards (empty filter / no tagihan) there's no domain to mirror, so
  // fall back to the emerald→lavender brand gradient (the "no single domain /
  // Arisan Digital itself" mark, same as the compose-pill icon).
  const activeCard = visibleCards[safeIdx];
  const bgCardColor = visibleCards.length === 0
    ? "linear-gradient(165deg, #059669 0%, #10b981 45%, #a78bfa 100%)" // profile-banner gradient
    : activeCard?.settled
    ? "#374151"
    : activeCard?.urgent
    ? "#7f1d1d"
    : activeCard?.type === "patungan"
    ? "#4c1d95"
    : "#065f46";

  return (
    <div className="v2-screen v2-home min-h-svh" style={{ background: bgCardColor }}>
      <div className="v2-inner" style={{ background: "transparent" }}>

        {/* Story segments */}
        <div className="story-bar">
          {visibleCards.map((c, i) => (
            <div
              key={c.id}
              className={`story-seg${i === safeIdx ? " active" : i < safeIdx ? " past" : ""}`}
            />
          ))}
        </div>

        <StoryTopBar
          onList={() => navigate("/app/dompet")}
          onNotif={() => navigate("/app/notifikasi")}
          onProfile={() => navigate("/app/profil")}
        />

        <SegFilter value={filter} onChange={setFilter} />

        {/* Deck */}
        <div className="deck-container">
          {/* Nav zones (mobile tap areas) */}
          <div className="nav-prev" onClick={prevCard} aria-label="Kartu sebelumnya" role="button" tabIndex={-1} onKeyDown={e => e.key === "Enter" && prevCard()} />
          <div className="nav-next" onClick={nextCard} aria-label="Kartu berikutnya" role="button" tabIndex={-1} onKeyDown={e => e.key === "Enter" && nextCard()} />

          {/* Desktop arrow buttons — visible only at >=1024px via CSS */}
          <button
            type="button"
            className="deck-arrow arrow-prev"
            onClick={prevCard}
            disabled={safeIdx === 0}
            aria-label="Kartu sebelumnya"
          >
            <ChevronLeft size={22} stroke="currentColor" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            className="deck-arrow arrow-next"
            onClick={nextCard}
            disabled={safeIdx === visibleCards.length - 1}
            aria-label="Kartu berikutnya"
          >
            <ChevronRight size={22} stroke="currentColor" strokeWidth={2.5} />
          </button>

          {visibleCards.length === 0 ? (
            cards.length === 0 ? (
              // Account genuinely empty (no arisan/patungan) — welcoming card.
              <EmptyCard onCta={() => setComposeOpen(true)} />
            ) : (
              // A filter is active but yields nothing while other cards exist.
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-text">Tidak ada item di filter ini</div>
              </div>
            )
          ) : (
            visibleCards.map((card, idx) => (
              <StoryCard
                key={card.id}
                card={card}
                isPaid={!!paidCards[card.id]}
                cardClass={getCardClass(idx)}
                onCta={() => handleCta(card)}
                onOpen={() => navigate("/app/grup")}
              />
            ))
          )}
        </div>

        {/* Swipe hint */}
        {visibleCards.length > 1 && (
          <div className="swipe-hint">
            <ChevronLeft size={13} stroke="currentColor" strokeWidth={2.5} />
            geser untuk berpindah
            <ChevronRight size={13} stroke="currentColor" strokeWidth={2.5} />
          </div>
        )}

        {/* Dimmer when compose open */}
        <div
          className={`dimmer${composeOpen ? " active" : ""}`}
          onClick={() => setComposeOpen(false)}
        />

        {/* Compose pill */}
        <ComposeSheet
          open={composeOpen}
          onOpen={() => setComposeOpen(true)}
          onClose={() => setComposeOpen(false)}
        />

        {/* First-run guided tour — overlays the deck, shares its coordinates */}
        {coachOpen && <CoachMarks onDone={closeCoach} />}

      </div>

      {/* Pay sheet (portal-like, fixed) */}
      {paySheet.open && paySheet.card && (
        <PaySheet
          open={paySheet.open}
          onClose={closePaySheet}
          amount={paySheet.card.amount}
          label={paySheet.card.eyebrow}
          destName={paySheet.card.destName}
          destType={paySheet.card.destType}
          onPaid={handlePaid}
          onDest={() => { closePaySheet(); navigate("/app/grup"); }}
        />
      )}
    </div>
  );
}

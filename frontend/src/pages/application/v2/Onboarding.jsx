import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";

// localStorage key — HomeDeck also reads "arisan.v2.coachSeen" to show coach
// marks; the onboarding flag is a separate key so they can be cleared
// independently.
const ONBOARDING_KEY = "arisan.v2.onboardingSeen";

const SLIDES = [
  {
    // Slide 1 — What is arisan
    gradient: "linear-gradient(165deg, #059669 0%, #10b981 45%, #34d399 100%)",
    emoji: "🎉",
    title: "Kelola Arisan Bersama",
    body: "Atur giliran, catat iuran, dan kirim pengingat otomatis — semuanya tanpa grup WhatsApp yang berantakan.",
    bullets: [
      "Undian giliran transparan",
      "Pengingat iuran otomatis",
      "Status bayar real-time",
    ],
    accent: "#059669",
  },
  {
    // Slide 2 — What is patungan
    gradient: "linear-gradient(165deg, #3b0764 0%, #7c3aed 55%, #a78bfa 100%)",
    emoji: "🧾",
    title: "Patungan Tanpa Ribet",
    body: "Bagi tagihan bersama teman untuk trip, hotel, atau tiket konser — dan pantau siapa yang sudah transfer.",
    bullets: [
      "Bagi tagihan secara adil",
      "Bukti transfer digital",
      "Tagih dengan satu ketukan",
    ],
    accent: "#7c3aed",
  },
  {
    // Slide 3 — Ready to go
    gradient: "linear-gradient(165deg, #059669 0%, #10b981 45%, #a78bfa 100%)",
    emoji: "🚀",
    title: "Siap Mulai?",
    body: "Buat grup atau bergabung lewat link undangan. Tidak perlu daftar akun — cukup buka dan langsung pakai.",
    bullets: [
      "Tanpa download WebApp",
      "Tanpa buat akun",
      "Berbagi lewat link/QR",
    ],
    accent: "#10b981",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const finish = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // private mode — continue anyway
    }
    navigate("/app");
  }, [navigate]);

  const goNext = useCallback(() => {
    if (current < SLIDES.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      finish();
    }
  }, [current, finish]);

  const goPrev = useCallback(() => {
    if (current > 0) setCurrent((c) => c - 1);
  }, [current]);

  // Swipe detection
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    // Only act on horizontal swipes (dx > 40, dy < 60)
    if (Math.abs(dx) > 40 && dy < 60) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div
      className="v2-screen"
      style={{ background: slide.gradient, transition: "background .5s ease" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="v2-inner"
        style={{ background: "transparent", overflow: "hidden" }}
      >

        {/* Skip button */}
        <div className="absolute top-4 right-5 z-20">
          <button
            type="button"
            onClick={finish}
            className="rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-[12px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            Lewati
          </button>
        </div>

        {/* Dot indicators */}
        <div className="absolute top-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1} dari ${SLIDES.length}`}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-white"
                  : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Decorative blobs */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-20"
          style={{ background: "white" }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-10"
          style={{ background: "white" }}
        />

        {/* Slide content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 pb-32 pt-24">
          {/* Emoji hero */}
          <div
            className="mb-7 flex h-24 w-24 items-center justify-center rounded-[28px] text-5xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
          >
            {slide.emoji}
          </div>

          {/* Title */}
          <h1 className="mb-3 text-center text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.15)]">
            {slide.title}
          </h1>

          {/* Body */}
          <p className="mb-8 max-w-[300px] text-center text-[15px] font-medium leading-relaxed text-white/85">
            {slide.body}
          </p>

          {/* Bullet list */}
          <div
            className="w-full max-w-[300px] rounded-[18px] px-5 py-4"
            style={{ background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)" }}
          >
            {slide.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.3)" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-[13px] font-semibold text-white">{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom action row */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-4 px-6 pb-10 pt-4">
          {/* Prev — hidden on first slide */}
          {current > 0 ? (
            <button
              type="button"
              aria-label="Slide sebelumnya"
              onClick={goPrev}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          ) : (
            <div className="h-12 w-12 shrink-0" />
          )}

          {/* Next / Mulai */}
          <button
            type="button"
            onClick={goNext}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-[16px] text-[16px] font-extrabold shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-transform active:scale-[0.97]"
            style={{ background: "white", color: slide.accent }}
          >
            {isLast ? (
              <>
                Mulai Sekarang
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </>
            ) : (
              <>
                Selanjutnya
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

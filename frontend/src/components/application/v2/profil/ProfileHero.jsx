import { ChevronLeft, Calendar } from "../icons";

/**
 * ProfileHero — gradient hero with decorative blobs, a back/edit top bar, and
 * the centered avatar + identity block.
 *
 * The gradient fill and the desktop full-bleed padding live in the `.profil-hero`
 * custom class (app-v2.css); everything else is Tailwind.
 *
 * Props:
 *   name / phone / joined {string}   – identity text
 *   onBack / onEdit       {() => void}
 */
export default function ProfileHero({ name, phone, joined, onBack, onEdit }) {
  return (
    <div className="profil-hero relative shrink-0 overflow-hidden px-5 pb-14">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/8" />
      <div className="pointer-events-none absolute -left-12.5 bottom-5 h-45 w-45 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-15 top-12.5 h-20 w-20 rounded-full bg-white/6" />

      {/* Top bar: back arrow left, edit button right */}
      <div className="relative z-10 flex items-center justify-between pb-5 pt-3.5 lg:pb-6 lg:pt-4.5">
        <button
          type="button"
          aria-label="Kembali"
          onClick={onBack}
          className="grid h-10 w-10 place-items-center rounded-[14px] bg-white/18 text-white backdrop-blur-[6px] transition-colors active:bg-white/30"
        >
          <ChevronLeft size={17} stroke="white" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-white/28 bg-white/18 px-4 py-2 text-xs font-bold tracking-[0.01em] text-white backdrop-blur-[6px] transition-colors"
        >
          Edit Profil
        </button>
      </div>

      {/* Avatar + identity */}
      <div className="relative z-5 mx-auto flex max-w-[620px] flex-col items-center pt-1">
        <div className="mb-3.5 grid h-20 w-20 place-items-center rounded-full border-[3px] border-white/55 bg-white/22 text-[28px] font-extrabold text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-[6px] lg:h-24 lg:w-24 lg:text-[32px]">
          RF
        </div>
        <div className="mb-1.5 text-[22px] font-extrabold leading-none tracking-[-0.03em] text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.12)] lg:text-[26px]">
          {name}
        </div>
        <div className="mb-1.25 text-[13px] font-semibold text-white/85">{phone}</div>
        <div className="inline-flex items-center gap-1.25 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-bold tracking-[0.01em] text-white/90 backdrop-blur-xs">
          <Calendar size={11} strokeWidth={2.5} />
          {joined}
        </div>
      </div>
    </div>
  );
}

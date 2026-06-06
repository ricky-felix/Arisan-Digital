import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { ChevronLeft, Share, Send, Check, Users, Split } from "../../../components/application/v2/icons";
import FauxQr from "../../../components/application/v2/undang/FauxQr";
import { INVITE } from "../../../components/application/v2/undang/data";

/**
 * Undang — the group owner's "share invite link" screen.
 * Shows a QR code, the join link with copy, WhatsApp share, and who's joined.
 *
 * Migration: all v2-undang custom CSS replaced with Tailwind v4 utilities.
 * The QR fill color is passed as a prop to FauxQr to avoid needing the
 * `.v2-undang .qr-svg rect` parent-scoped rule.
 *
 * The group-icon gradient cannot be expressed as a Tailwind utility
 * (two-stop directional gradient with specific hex values), so it is applied
 * via inline `style`. No CSS was written.
 */
export default function Undang() {
  const navigate = useNavigate();
  const toast = useToast();
  const { group, link, joined, pending } = INVITE;
  const isArisan = group.type === "arisan";
  const [copied, setCopied] = useState(false);

  const fullLink = `https://${link}`;

  // Gradient values for the group icon tile — differ by group type.
  // Kept as inline style because Tailwind can't express arbitrary two-stop
  // diagonal gradients without a custom `bg-[…]` that loses semantic clarity.
  const groupIconGradient = isArisan
    ? "linear-gradient(145deg, #059669, #34d399)"
    : "linear-gradient(145deg, #7c3aed, #a78bfa)";

  // QR module fill: ink-1 for arisan, deep-indigo for patungan.
  const qrFill = isArisan ? "var(--color-ink-1)" : "#312e81";

  // Badge + copy-button variant classes differ by group type.
  const badgeCls = isArisan
    ? "bg-brand-primary-soft text-brand-primary-hover"
    : "bg-brand-secondary-soft text-brand-secondary-dark";

  const copyCls = isArisan ? "bg-brand-primary" : "bg-brand-secondary-dark";

  function copyLink() {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullLink).catch(() => {});
    }
    setCopied(true);
    toast("Link undangan disalin ✓");
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWa() {
    const text = encodeURIComponent(
      `Yuk gabung ${group.typeLabel} "${group.name}" di Arisan Digital: ${fullLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="v2-screen">
      {/*
        Scroll container — replaces .undang-scroll:
        full-width, min-height covers full viewport, app-bg fill,
        vertical scroll with hidden scrollbar, centered column children.
      */}
      <div className="w-full min-h-svh bg-app-bg overflow-y-auto overflow-x-hidden flex flex-col items-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Sticky nav bar — replaces .undang-nav */}
        <div className="w-full min-h-14 flex items-center gap-3 px-5 bg-surface border-b border-line-soft sticky top-0 z-10 lg:px-[max(clamp(24px,5vw,64px),calc(50%-600px))]">
          <button
            type="button"
            aria-label="Kembali"
            onClick={() => navigate(-1)}
            className="w-8.5 h-8.5 rounded-[10px] bg-gray-soft grid place-items-center shrink-0 cursor-pointer text-ink-1 transition-colors hover:bg-line"
          >
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>

          {/* Title — replaces .undang-nav-title */}
          <span className="flex-1 text-[17px] font-extrabold text-ink-1 tracking-[-0.02em]">
            Undang Anggota
          </span>

          <button
            type="button"
            aria-label="Bagikan undangan"
            onClick={shareWa}
            className="w-8.5 h-8.5 rounded-[10px] bg-gray-soft grid place-items-center shrink-0 cursor-pointer text-ink-1 transition-colors hover:bg-line"
          >
            <Share size={16} stroke="currentColor" strokeWidth={2} />
          </button>
        </div>

        {/*
          Centered content column — replaces .undang-col:
          full-width, capped at 460px, 16px side padding, 40px bottom,
          flex column with 14px gap.
        */}
        <div className="w-full max-w-115 px-4 pt-4 pb-10 flex flex-col gap-3.5">

          {/* Group being shared — replaces .undang-group */}
          <div className="flex items-center gap-3 bg-surface border border-line-soft rounded-card px-3.5 py-3">
            {/* Icon tile — replaces .undang-group-icon (gradient via inline style) */}
            <div
              className="w-10 h-10 rounded-lg shrink-0 grid place-items-center text-white"
              style={{ background: groupIconGradient }}
            >
              {isArisan
                ? <Users size={18} stroke="white" strokeWidth={2} />
                : <Split size={18} stroke="white" strokeWidth={2} />}
            </div>

            <div>
              {/* .undang-group-name */}
              <div className="text-[15px] font-extrabold text-ink-1">{group.name}</div>
              {/* .undang-group-meta */}
              <div className="text-xs text-ink-2 mt-px">
                {group.typeLabel} · {group.members}/{group.capacity} anggota
              </div>
            </div>

            {/* Type badge — replaces .undang-type-badge (+ patungan variant) */}
            <span className={`ml-auto text-[10px] font-extrabold uppercase tracking-[0.05em] px-2.5 py-1 rounded-full ${badgeCls}`}>
              {group.typeLabel}
            </span>
          </div>

          {/*
            QR card — replaces .undang-qr-card.
            Shadow is a one-off value, kept as arbitrary.
          */}
          <div className="bg-surface border border-line-soft rounded-[20px] p-6 flex flex-col items-center gap-3.5 shadow-[0_4px_24px_rgba(17,24,39,0.06)]">
            {/* QR frame — replaces .undang-qr-frame */}
            <div className="p-3.5 rounded-card bg-white border border-line">
              {/*
                FauxQr now accepts fillColor so the parent-scoped
                `.v2-undang .qr-svg rect` rule is no longer needed.
              */}
              <FauxQr size={196} fillColor={qrFill} />
            </div>

            {/* Hint text — replaces .undang-qr-hint */}
            <div className="text-xs text-ink-2 text-center">
              Scan untuk gabung ke <strong className="text-ink-1">{group.name}</strong>
            </div>
          </div>

          {/* Copy-link row — replaces .undang-link-row */}
          <div className="flex items-center gap-2 bg-gray-soft rounded-lg pl-3.5 pr-1.5 py-1.5">
            {/* Link text — replaces .undang-link-text */}
            <div className="flex-1 min-w-0 text-[13px] font-semibold text-ink-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {link}
            </div>
            {/*
              Copy button — replaces .undang-copy (+ .done + patungan variants).
              done state swaps to brand-primary-hover (emerald-dark); both cases
              override the base copyCls via explicit class priority.
            */}
            <button
              type="button"
              onClick={copyLink}
              className={`shrink-0 ${copied ? "bg-brand-primary-hover" : copyCls} text-white text-[13px] font-bold px-4 py-2 rounded-[9px] inline-flex items-center gap-1.25 cursor-pointer transition-colors`}
            >
              {copied
                ? <><Check size={14} stroke="currentColor" strokeWidth={3} /> Tersalin</>
                : "Salin"}
            </button>
          </div>

          {/*
            WhatsApp share button — replaces .undang-share-wa.
            #25d366 is WhatsApp green — not a theme token, kept as arbitrary value.
          */}
          <button
            type="button"
            onClick={shareWa}
            className="w-full bg-[#25d366] text-white text-[15px] font-extrabold py-3.5 rounded-[14px] inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send size={16} stroke="white" strokeWidth={2.2} />
            Bagikan ke WhatsApp
          </button>

          {/* Section label — replaces .undang-section-label */}
          <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-ink-3 mt-1.5">
            Sudah gabung · {joined.length}{pending ? ` · ${pending} menunggu` : ""}
          </div>

          {/*
            Members list — replaces .undang-members.
            divide-y replaces the + .undang-member border-top and .undang-pending
            border-top rules in a single declarative class.
          */}
          <div className="bg-surface border border-line-soft rounded-card overflow-hidden divide-y divide-line-soft">
            {joined.map(m => (
              <div className="flex items-center gap-3 px-3.5 py-3" key={m.initials}>
                {/* Avatar — replaces .undang-av; color set inline from data */}
                <div
                  className="w-9.5 h-9.5 rounded-full shrink-0 grid place-items-center text-white text-[13px] font-bold"
                  style={{ background: m.color }}
                >
                  {m.initials}
                </div>

                {/* Member info — replaces .undang-member-info */}
                <div className="flex-1 min-w-0">
                  {/* .undang-member-name */}
                  <div className="text-sm font-bold text-ink-1">{m.name}</div>
                  {/* .undang-member-role */}
                  <div className="text-[11px] text-ink-2">{m.role}</div>
                </div>

                {/* Admin badge — replaces .undang-admin-badge */}
                {m.role === "Admin" && (
                  <span className="text-[10px] font-extrabold px-2.25 py-0.75 rounded-full bg-brand-primary-soft text-brand-primary-hover">
                    Admin
                  </span>
                )}
              </div>
            ))}

            {/* Pending row — replaces .undang-pending (border-top from divide-y) */}
            {pending > 0 && (
              <div className="px-3.5 py-3 text-xs text-ink-3 font-semibold">
                {pending} undangan menunggu dibuka
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

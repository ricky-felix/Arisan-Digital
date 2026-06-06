import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { ChevronLeft, ChevronRight, Split, QrJoin } from "../../../components/application/v2/icons";
import { useToast } from "../../../context/ToastContext";
import { createBill, hasCreatedSomething, useAuth, useAccountPrompt } from "../v1/mockData";
import { formatRupiah } from "../../../utils/formatRupiah";

const CATEGORIES = [
  { id: "makanan", label: "Makanan", emoji: "🍽" },
  { id: "transport", label: "Transport", emoji: "🚗" },
  { id: "penginapan", label: "Penginapan", emoji: "🏨" },
  { id: "utilitas", label: "Utilitas", emoji: "⚡" },
  { id: "hiburan", label: "Hiburan", emoji: "🎬" },
  { id: "lainnya", label: "Lainnya", emoji: "···" },
];

/**
 * BuatPatungan — v2 create-patungan (split bill) flow, single step.
 * Participants are not enumerated here: people join later via the invite
 * link / QR (the Undang screen) and the total is split among whoever
 * joins. Creation only captures the bill's details. Lavender-themed
 * sibling of BuatArisan with the same responsive centered column.
 *
 * Tailwind migration: all v2-buat-prefixed classes replaced with Tailwind
 * utilities. Accent palette hardcoded to lavender (brand-secondary) since
 * this screen is always the "patungan" variant. Hero gradient uses an inline
 * style; decorative blobs are real <div> nodes; footer padding uses an inline
 * style for env(safe-area-inset-bottom) — no custom CSS classes needed.
 */
export default function BuatPatungan() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAnonymous } = useAuth();
  const { promptRegister } = useAccountPrompt();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "makanan", total: "" });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const totalNum = Number(form.total) || 0;
  const cat = CATEGORIES.find((c) => c.id === form.category);
  const canSubmit = form.title.trim() && totalNum > 0;

  const submit = async () => {
    if (!canSubmit || saving) return;
    const firstTime = !hasCreatedSomething();
    setSaving(true);
    try {
      await createBill({
        title: form.title.trim(),
        category: form.category,
        total: totalNum,
        method: "equal", // split evenly among participants who join
        participants: [{ name: "Saya" }], // you pay first; others join via invite
      });
      toast("Tagihan dibuat! Undang peserta sekarang.", "success");
      navigate("/app/undang");
      if (firstTime && isAnonymous) {
        promptRegister("Tagihan pertamamu sudah dibuat 🎉 Daftar gratis agar tidak hilang.");
      }
    } catch (err) {
      toast(err.message || "Gagal membuat tagihan", "error");
      setSaving(false);
    }
  };

  return (
    <div className="v2-screen">
      {/* Full-bleed scrollable column — hides native scrollbar */}
      <div className="flex w-full flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative min-h-svh bg-app-bg">

        {/* Sticky header — full-width surface, content padded to centered column */}
        <div className="sticky top-0 z-10 flex w-full shrink-0 min-h-14 items-center gap-3 border-b border-line-soft bg-surface px-[max(20px,calc(50%-240px))] lg:px-[max(20px,calc(50%-280px))]">
          <button
            className="grid h-8.5 w-8.5 shrink-0 cursor-pointer place-items-center rounded-[10px] border-none bg-gray-soft text-ink-1 transition-colors hover:bg-line"
            onClick={() => navigate("/app")}
            aria-label="Kembali"
            type="button"
          >
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>
          <span className="flex-1 text-[17px] font-extrabold tracking-[-0.02em] text-ink-1">
            Buat Patungan
          </span>
        </div>

        {/* Body — centered content column */}
        <div className="mx-auto flex w-full max-w-120 flex-1 flex-col gap-3.5 px-4 pb-6 pt-4 lg:max-w-140 lg:gap-4 lg:pt-6">

          {/*
            Live preview hero — lavender gradient with two decorative blob circles.
            The gradient is inline because it uses the lavender accent and differs
            from the emerald sibling. Blobs replace the ::before/::after pseudo-
            elements so no custom CSS is needed here.
          */}
          <div
            className="relative overflow-hidden rounded-card px-5 py-5 text-white shadow-[0_8px_24px_rgba(17,24,39,.12)]"
            style={{ background: "linear-gradient(145deg,#7c3aed 0%,#8b5cf6 60%,#a78bfa 100%)" }}
          >
            {/* Blob top-right */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-30 w-30 rounded-full bg-white/12" />
            {/* Blob bottom-center-right */}
            <div className="pointer-events-none absolute -bottom-9 right-11 h-22.5 w-22.5 rounded-full bg-white/8" />

            <div className="relative mb-3.5 grid h-10.5 w-10.5 place-items-center rounded-lg bg-white/20 backdrop-blur-[6px]">
              <Split size={22} stroke="white" strokeWidth={2} />
            </div>
            <div className="relative overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold tracking-[0.01em] opacity-90">
              {cat?.emoji} {form.title.trim() || "Tagihan Patungan"}
            </div>
            <div className="relative mt-0.5 text-[32px] font-extrabold tracking-[-0.03em] lg:text-[36px]">
              {totalNum > 0 ? formatRupiah(totalNum) : "Rp 0"}
            </div>
            <div className="relative mt-1 text-xs opacity-85">
              Dibagi rata ke peserta yang bergabung
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-card border border-line-soft bg-surface p-4 shadow-[0_1px_2px_rgba(17,24,39,.04),0_1px_1px_rgba(17,24,39,.03)]">

            {/* Judul */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-ink-1">Judul</label>
              <input className="v2-input" placeholder="Contoh: Makan malam Restoran Padang" value={form.title} onChange={set("title")} autoFocus />
            </div>

            {/* Kategori — 3-column grid of pill buttons */}
            <div className="mt-3.5 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-ink-1">Kategori</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                    className={
                      "flex cursor-pointer flex-col items-center gap-1.25 rounded-lg border-[1.5px] py-3 px-1 font-[inherit] text-xs font-semibold transition-all " +
                      (form.category === c.id
                        ? "border-brand-secondary bg-brand-secondary-tint text-brand-secondary-dark"
                        : "border-line bg-app-bg text-ink-2")
                    }
                  >
                    <span className="text-xl leading-none">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Tagihan */}
            <div className="mt-3.5 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-ink-1">Total Tagihan</label>
              {/* Amount input with Rp prefix */}
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-bold text-ink-3">
                  Rp
                </span>
                <input className="v2-input pl-10.5! text-lg! font-bold!" type="number" inputMode="numeric" placeholder="480000" value={form.total} onChange={set("total")} />
              </div>
            </div>
          </div>

          {/* Participants-join-via-invite note — lavender tint */}
          <div className="flex items-start gap-2.5 rounded-lg bg-brand-secondary-tint px-3.5 py-3.25 text-[12.5px] font-medium leading-[1.45] text-brand-secondary-dark">
            <QrJoin size={18} stroke="currentColor" strokeWidth={2} className="mt-px shrink-0" />
            <span>Peserta bergabung lewat <strong className="font-extrabold">link undangan</strong> atau <strong className="font-extrabold">QR</strong>, lalu total dibagi rata otomatis. Kamu yang membayar dulu.</span>
          </div>

        </div>

        {/*
          Sticky action footer.
          The gradient fade (bg-app-bg → transparent) is applied via an inline
          style because it uses env(safe-area-inset-bottom) together with calc()
          in the padding, which Tailwind cannot express without a custom class.
          bg-linear-to-t from-app-bg is used for the visual fade; safe-area
          bottom padding uses CSS directly so notch devices are respected.
        */}
        <div
          className="sticky bottom-0 flex w-full shrink-0 gap-2.5 bg-linear-to-t from-app-bg to-transparent pt-3.5"
          style={{
            padding: "14px max(16px, calc(50% - 240px + 16px)) calc(16px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <button
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] border-none bg-brand-secondary p-4 text-[15px] font-extrabold tracking-[-0.01em] text-white shadow-[0_10px_22px_var(--color-brand-secondary-tint)] transition-[filter,transform] hover:not-disabled:brightness-105 active:not-disabled:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            disabled={!canSubmit || saving}
            onClick={submit}
            type="button"
          >
            {saving ? "Menyimpan…" : "Buat & Undang"}
            {!saving && <ChevronRight size={18} stroke="white" strokeWidth={2.5} />}
          </button>
        </div>

      </div>
    </div>
  );
}

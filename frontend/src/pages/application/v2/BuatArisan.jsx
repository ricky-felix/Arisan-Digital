import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { ChevronRight, Users, QrJoin } from "../../../components/application/v2/icons";
import ScreenHeader from "../../../components/application/v2/ScreenHeader";
import { useToast } from "../../../context/ToastContext";
import { useCreateGroup } from "../../../hooks/useCreateGroup";
// C4: hasCreatedSomething import removed (firstTime logic no longer needed).
import { useAccountPrompt } from "../../../context/AccountPromptContext";
// C4: useAuth removed from BuatArisan — isAnonymous no longer used.
import { formatRupiah } from "../../../utils/formatRupiah";

// Arisan group categories — emerald-accented picker (mirrors the patungan
// category grid). `id` is persisted; `emoji` + `label` are display-only.
const CATEGORIES = [
  { id: "keluarga", label: "Keluarga", emoji: "👨‍👩‍👧" },
  { id: "kantor", label: "Kantor", emoji: "💼" },
  { id: "teman", label: "Teman", emoji: "🧑‍🤝‍🧑" },
  { id: "komunitas", label: "Komunitas", emoji: "🤝" },
  { id: "sekolah", label: "Sekolah", emoji: "🎓" },
  { id: "lainnya", label: "Lainnya", emoji: "···" },
];

/**
 * BuatArisan — v2 create-arisan flow, single step.
 * Members are not enumerated here: people join later via the invite
 * link / QR (the Undang screen), so creation only captures the arisan's
 * details. On submit we create the group and route straight to the
 * invite screen so the owner can share it. Layout is responsive — the
 * content centers in a column that widens on desktop.
 *
 * Tailwind migration: all v2-buat-prefixed classes replaced with Tailwind
 * utilities. The hero gradient (linear-gradient) is applied via a style
 * prop; decorative blobs that were ::before/::after pseudo-elements are
 * now real <div> nodes with pointer-events-none.
 *
 * The hero gradient uses an inline style (linear-gradient) and decorative
 * blobs are real <div> nodes, so no custom CSS classes are needed.
 */
export default function BuatArisan() {
  const navigate = useNavigate();
  const toast = useToast();
  // C4: promptRegister is a no-op (AccountPromptContext neutralised — all
  // users are authenticated, no deferred registration nudge needed).
  const { promptRegister } = useAccountPrompt();
  const { saving, createGroup } = useCreateGroup();
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "keluarga",
    amount: "",
    frequency: "monthly",
    method: "manual",
    startDate: new Date().toISOString().slice(0, 10),
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const amountNum = Number(form.amount) || 0;
  const canSubmit = form.name.trim() && amountNum > 0;

  const submit = async () => {
    if (!canSubmit || saving) return;

    // TODO(wave2-auth): Supabase session token required for createGroup.
    const group = await createGroup({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      amount: amountNum,
      frequency: form.frequency,
      method: form.method,
      startDate: form.startDate,
    });

    if (group) {
      toast("Arisan dibuat! Undang anggota sekarang.", "success");
      // Navigate to Undang with the new group id so the invite link is auto-created.
      navigate(group.id ? `/app/undang/${group.id}` : "/app/undang");
      // C4: promptRegister is a no-op — user is always authenticated now.
    } else {
      toast("Gagal membuat arisan. Coba lagi.", "error");
    }
  };

  return (
    <div className="v2-screen">
      <div className="v2-inner" style={{ overflowY: "auto" }}>

        <ScreenHeader title="Buat Arisan" onBack={() => navigate("/app")} />

        {/* ── Content column ── */}
        <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-3.5 px-5 pb-6 pt-4 lg:max-w-[600px] lg:gap-4 lg:px-6">

          {/*
            Live preview hero — emerald gradient with two decorative blob circles.
            The gradient is inline because it uses the emerald accent and differs
            from the lavender sibling. Blobs replace the ::before/::after pseudo-
            elements so no custom CSS is needed here.
          */}
          <div
            className="relative overflow-hidden rounded-card px-5 py-5 text-white shadow-[0_8px_24px_rgba(17,24,39,.12)]"
            style={{ background: "linear-gradient(145deg,#059669 0%,#10b981 60%,#34d399 100%)" }}
          >
            {/* Blob top-right */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-30 w-30 rounded-full bg-white/12" />
            {/* Blob bottom-center-right */}
            <div className="pointer-events-none absolute -bottom-9 right-11 h-22.5 w-22.5 rounded-full bg-white/8" />

            <div className="relative mb-3.5 grid h-10.5 w-10.5 place-items-center rounded-lg bg-white/20 backdrop-blur-[6px]">
              <Users size={22} stroke="white" strokeWidth={2} />
            </div>
            <div className="relative overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold tracking-[0.01em] opacity-90">
              {form.name.trim() || "Arisan Baru"}
            </div>
            <div className="relative mt-0.5 text-[32px] font-extrabold tracking-[-0.03em] lg:text-[36px]">
              {amountNum > 0 ? formatRupiah(amountNum) : "Rp 0"}
            </div>
            <div className="relative mt-1 text-xs opacity-85">
              Arisan {form.frequency === "weekly" ? "Mingguan" : "Bulanan"} · Giliran {form.method === "random" ? "Acak" : "Urut"}
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-card border border-line-soft bg-surface p-4 shadow-[0_1px_2px_rgba(17,24,39,.04),0_1px_1px_rgba(17,24,39,.03)]">

            {/* Nama Arisan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-ink-1">Nama Arisan</label>
              <input className="v2-input" placeholder="Contoh: Arisan Kantor Lt. 3" value={form.name} onChange={set("name")} autoFocus />
            </div>

            {/* Deskripsi */}
            <div className="mt-3.5 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-ink-1">
                Deskripsi <span className="font-medium text-ink-3">(opsional)</span>
              </label>
              <input className="v2-input" placeholder="Contoh: Arisan rekan kerja" value={form.description} onChange={set("description")} />
            </div>

            {/* Kategori — emerald-accented emoji grid (mirrors patungan) */}
            <div className="mt-3.5 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-ink-1">Kategori</label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => {
                  const active = form.category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                      className={
                        "flex cursor-pointer flex-col items-center gap-1 rounded-[10px] border px-1 py-2.5 font-[inherit] text-[12px] font-bold transition-colors " +
                        (active
                          ? "border-brand-primary bg-brand-primary-tint text-brand-primary-hover"
                          : "border-line bg-surface text-ink-2 hover:bg-gray-soft")
                      }
                    >
                      <span className="text-[18px] leading-none">{c.emoji}</span>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Iuran per Ronde — Rp prefix absolutely positioned inside the input */}
            <div className="mt-3.5 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-ink-1">Iuran per Ronde</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-bold text-ink-3">
                  Rp
                </span>
                {/* v2-input kept; pl/text/font overrides via Tailwind important modifier */}
                <input className="v2-input pl-10.5! text-lg! font-bold!" type="number" inputMode="numeric" placeholder="500000" value={form.amount} onChange={set("amount")} />
              </div>
            </div>

            {/* Frekuensi + Metode Giliran side by side */}
            <div className="mt-3.5 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-ink-1">Frekuensi</label>
                <Seg
                  value={form.frequency}
                  onChange={(v) => setForm((f) => ({ ...f, frequency: v }))}
                  options={[{ v: "monthly", l: "Bulanan" }, { v: "weekly", l: "Mingguan" }]}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-ink-1">Metode Giliran</label>
                <Seg
                  value={form.method}
                  onChange={(v) => setForm((f) => ({ ...f, method: v }))}
                  options={[{ v: "manual", l: "Urut" }, { v: "random", l: "Acak" }]}
                />
              </div>
            </div>

            {/* Tanggal Mulai */}
            <div className="mt-3.5 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-ink-1">Tanggal Mulai</label>
              <input className="v2-input" type="date" value={form.startDate} onChange={set("startDate")} />
            </div>
          </div>

          {/* Members-join-via-invite note — emerald tint background */}
          <div className="flex items-start gap-2.5 rounded-lg bg-brand-primary-tint px-3.5 py-3.25 text-[12.5px] font-medium leading-[1.45] text-brand-primary-hover">
            <QrJoin size={18} stroke="currentColor" strokeWidth={2} className="mt-px shrink-0" />
            <span>
              Anggota bergabung lewat <strong className="font-extrabold">link undangan</strong> atau <strong className="font-extrabold">QR</strong> setelah arisan dibuat. Kamu jadi admin &amp; anggota pertama.
            </span>
          </div>

        </div>

        {/* ── Sticky action footer — aligned to the content column ── */}
        <div
          className="sticky bottom-0 mx-auto flex w-full max-w-[480px] shrink-0 gap-2.5 bg-linear-to-t from-app-bg to-transparent px-5 pt-3.5 lg:max-w-[600px] lg:px-6"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-[14px] border-none bg-brand-primary p-4 text-[15px] font-extrabold tracking-[-0.01em] text-white shadow-[0_10px_22px_var(--color-brand-primary-tint)] transition-[filter,transform] hover:not-disabled:brightness-105 active:not-disabled:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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

/**
 * Seg — inline segmented control for binary options.
 * Active option gets surface background + subtle shadow lift.
 */
function Seg({ value, onChange, options }) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-gray-soft p-0.75">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={
            "flex-1 cursor-pointer rounded-[9px] border-none py-2.25 font-[inherit] text-[13px] font-bold transition-all " +
            (value === o.v
              ? "bg-surface text-ink-1 shadow-[0_1px_3px_rgba(0,0,0,.1)]"
              : "bg-transparent text-ink-2")
          }
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

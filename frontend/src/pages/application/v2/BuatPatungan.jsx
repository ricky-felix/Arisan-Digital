import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { ChevronLeft, ChevronRight, Split, QrJoin } from "../../../components/v2/icons";
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
    <div className="v2-screen v2-buat lv">
      <div className="buat-scroll">

        {/* Header */}
        <div className="buat-nav">
          <button className="buat-nav-btn" onClick={() => navigate("/app")} aria-label="Kembali" type="button">
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>
          <span className="buat-nav-title">Buat Patungan</span>
        </div>

        <div className="buat-body">

          {/* Live preview hero */}
          <div className="buat-hero">
            <div className="buat-hero-icon">
              <Split size={22} stroke="white" strokeWidth={2} />
            </div>
            <div className="buat-hero-eyebrow">
              {cat?.emoji} {form.title.trim() || "Tagihan Patungan"}
            </div>
            <div className="buat-hero-amount">{totalNum > 0 ? formatRupiah(totalNum) : "Rp 0"}</div>
            <div className="buat-hero-sub">Dibagi rata ke peserta yang bergabung</div>
          </div>

          {/* Detail */}
          <div className="buat-card">
            <div className="field">
              <label className="field-label">Judul</label>
              <input className="v2-input" placeholder="Contoh: Makan malam Restoran Padang" value={form.title} onChange={set("title")} autoFocus />
            </div>

            <div className="field">
              <label className="field-label">Kategori</label>
              <div className="cat-grid">
                {CATEGORIES.map((c) => (
                  <button key={c.id} type="button"
                    className={`cat-opt${form.category === c.id ? " active" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, category: c.id }))}>
                    <span className="cat-emoji">{c.emoji}</span>{c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">Total Tagihan</label>
              <div className="amount-wrap">
                <span className="amount-prefix">Rp</span>
                <input className="v2-input" type="number" inputMode="numeric" placeholder="480000" value={form.total} onChange={set("total")} />
              </div>
            </div>
          </div>

          {/* Participants-join-via-invite note */}
          <div className="buat-note">
            <QrJoin size={18} stroke="currentColor" strokeWidth={2} />
            <span>Peserta bergabung lewat <strong>link undangan</strong> atau <strong>QR</strong>, lalu total dibagi rata otomatis. Kamu yang membayar dulu.</span>
          </div>

        </div>

        {/* Sticky action */}
        <div className="buat-footer">
          <button className="buat-submit" disabled={!canSubmit || saving} onClick={submit} type="button">
            {saving ? "Menyimpan…" : "Buat & Undang"}
            {!saving && <ChevronRight size={18} stroke="white" strokeWidth={2.5} />}
          </button>
        </div>

      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { ChevronLeft, ChevronRight, Users, QrJoin } from "../../../components/v2/icons";
import { useToast } from "../../../context/ToastContext";
import { createGroup, hasCreatedSomething, useAuth, useAccountPrompt } from "../v1/mockData";
import { formatRupiah } from "../../../utils/formatRupiah";

/**
 * BuatArisan — v2 create-arisan flow, single step.
 * Members are not enumerated here: people join later via the invite
 * link / QR (the Undang screen), so creation only captures the arisan's
 * details. On submit we create the group and route straight to the
 * invite screen so the owner can share it. Layout is responsive — the
 * content centers in a column that widens on desktop.
 */
export default function BuatArisan() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAnonymous } = useAuth();
  const { promptRegister } = useAccountPrompt();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
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
    const firstTime = !hasCreatedSomething();
    setSaving(true);
    try {
      await createGroup({
        name: form.name.trim(),
        description: form.description.trim(),
        amount: amountNum,
        frequency: form.frequency,
        method: form.method,
        startDate: form.startDate,
        members: [], // members join via the invite link / QR
      });
      toast("Arisan dibuat! Undang anggota sekarang.", "success");
      navigate("/app/undang");
      if (firstTime && isAnonymous) {
        promptRegister("Arisan pertamamu sudah dibuat 🎉 Daftar gratis agar tidak hilang.");
      }
    } catch (err) {
      toast(err.message || "Gagal membuat arisan", "error");
      setSaving(false);
    }
  };

  return (
    <div className="v2-screen v2-buat em">
      <div className="buat-scroll">

        {/* Header */}
        <div className="buat-nav">
          <button className="buat-nav-btn" onClick={() => navigate("/app")} aria-label="Kembali" type="button">
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>
          <span className="buat-nav-title">Buat Arisan</span>
        </div>

        <div className="buat-body">

          {/* Live preview hero */}
          <div className="buat-hero">
            <div className="buat-hero-icon">
              <Users size={22} stroke="white" strokeWidth={2} />
            </div>
            <div className="buat-hero-eyebrow">{form.name.trim() || "Arisan Baru"}</div>
            <div className="buat-hero-amount">{amountNum > 0 ? formatRupiah(amountNum) : "Rp 0"}</div>
            <div className="buat-hero-sub">
              Iuran {form.frequency === "weekly" ? "Mingguan" : "Bulanan"} · Giliran {form.method === "random" ? "Acak" : "Urut"}
            </div>
          </div>

          {/* Detail */}
          <div className="buat-card">
            <div className="field">
              <label className="field-label">Nama Arisan</label>
              <input className="v2-input" placeholder="Contoh: Arisan Kantor Lt. 3" value={form.name} onChange={set("name")} autoFocus />
            </div>

            <div className="field">
              <label className="field-label">Deskripsi <span className="opt">(opsional)</span></label>
              <input className="v2-input" placeholder="Contoh: Arisan rekan kerja" value={form.description} onChange={set("description")} />
            </div>

            <div className="field">
              <label className="field-label">Iuran per Ronde</label>
              <div className="amount-wrap">
                <span className="amount-prefix">Rp</span>
                <input className="v2-input" type="number" inputMode="numeric" placeholder="500000" value={form.amount} onChange={set("amount")} />
              </div>
            </div>

            <div className="field">
              <div className="field-row2">
                <div className="subfield">
                  <label className="field-label">Frekuensi</label>
                  <Seg value={form.frequency} onChange={(v) => setForm((f) => ({ ...f, frequency: v }))}
                    options={[{ v: "monthly", l: "Bulanan" }, { v: "weekly", l: "Mingguan" }]} />
                </div>
                <div className="subfield">
                  <label className="field-label">Metode Giliran</label>
                  <Seg value={form.method} onChange={(v) => setForm((f) => ({ ...f, method: v }))}
                    options={[{ v: "manual", l: "Urut" }, { v: "random", l: "Acak" }]} />
                </div>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Tanggal Mulai</label>
              <input className="v2-input" type="date" value={form.startDate} onChange={set("startDate")} />
            </div>
          </div>

          {/* Members-join-via-invite note */}
          <div className="buat-note">
            <QrJoin size={18} stroke="currentColor" strokeWidth={2} />
            <span>Anggota bergabung lewat <strong>link undangan</strong> atau <strong>QR</strong> setelah arisan dibuat. Kamu jadi admin &amp; anggota pertama.</span>
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

function Seg({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.v} type="button" className={`seg-opt${value === o.v ? " active" : ""}`} onClick={() => onChange(o.v)}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

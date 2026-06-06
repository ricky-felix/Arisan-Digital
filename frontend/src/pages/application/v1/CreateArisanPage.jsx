import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/application/AppLayout";
import Icon from "../../../components/application/Icon";
import { useToast } from "../../../context/ToastContext";
import { createGroup, hasCreatedSomething, useAuth, useAccountPrompt } from "./mockData";
import { formatRupiah } from "../../../utils/formatRupiah";

export default function CreateArisanPage() {
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
  const [members, setMembers] = useState([""]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMember = (i, v) => setMembers((m) => m.map((x, j) => (j === i ? v : x)));
  const addMember = () => setMembers((m) => [...m, ""]);
  const removeMember = (i) => setMembers((m) => m.filter((_, j) => j !== i));

  const namedMembers = members.map((m) => m.trim()).filter(Boolean);
  const totalMembers = namedMembers.length + 1; // +1 = you
  const amountNum = Number(form.amount) || 0;
  const canSubmit = form.name.trim() && amountNum > 0 && namedMembers.length >= 1;

  const submit = async () => {
    if (!canSubmit || saving) return;
    const firstTime = !hasCreatedSomething();
    setSaving(true);
    try {
      const id = await createGroup({
        name: form.name.trim(),
        description: form.description.trim(),
        amount: amountNum,
        frequency: form.frequency,
        method: form.method,
        startDate: form.startDate,
        members: namedMembers,
      });
      toast("Arisan berhasil dibuat!", "success");
      navigate(`/app/arisan/${id}`);
      if (firstTime && isAnonymous) {
        promptRegister("Arisan pertamamu sudah dibuat 🎉 Daftar gratis agar tidak hilang.");
      }
    } catch (err) {
      toast(err.message || "Gagal membuat arisan", "error");
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Buat Arisan">
      <div className="app-scroll" style={{ padding: "16px 16px 32px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
        <button className="app-btn btn-secondary" style={{ marginBottom: 16, padding: "6px 12px", fontSize: 13 }} onClick={() => navigate("/app/arisan")}>
          <Icon name="chevron-left" size={16} /> Kembali
        </button>

        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Buat Arisan Baru</h1>
        <p style={{ color: "var(--ink-2)", fontSize: 13, marginBottom: 20 }}>
          Anda otomatis menjadi anggota pertama &amp; admin grup ini.
        </p>

        {/* Details */}
        <div className="app-card" style={{ padding: 16, marginBottom: 16 }}>
          <Field label="Nama Arisan">
            <input className="app-input" placeholder="Contoh: Arisan Kantor Lt. 3" value={form.name} onChange={set("name")} />
          </Field>
          <Field label="Deskripsi (opsional)">
            <input className="app-input" placeholder="Contoh: Arisan rekan kerja" value={form.description} onChange={set("description")} />
          </Field>
          <Field label="Iuran Arisan per Ronde">
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-2)", fontSize: 14 }}>Rp</span>
              <input className="app-input" type="number" inputMode="numeric" placeholder="500000" value={form.amount} onChange={set("amount")} style={{ paddingLeft: 38 }} />
            </div>
            {amountNum > 0 && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{formatRupiah(amountNum)} / ronde</div>}
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Frekuensi">
              <Segmented value={form.frequency} onChange={(v) => setForm((f) => ({ ...f, frequency: v }))}
                options={[{ v: "monthly", l: "Bulanan" }, { v: "weekly", l: "Mingguan" }]} />
            </Field>
            <Field label="Metode Giliran">
              <Segmented value={form.method} onChange={(v) => setForm((f) => ({ ...f, method: v }))}
                options={[{ v: "manual", l: "Urut" }, { v: "random", l: "Acak" }]} />
            </Field>
          </div>

          <Field label="Tanggal Mulai">
            <input className="app-input" type="date" value={form.startDate} onChange={set("startDate")} />
          </Field>
        </div>

        {/* Members */}
        <div className="app-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Anggota Lain</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Total {totalMembers} anggota · {totalMembers} ronde</div>
            </div>
            <button className="app-btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }} onClick={addMember}>
              <Icon name="plus" size={14} /> Tambah
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--emerald-tint)", borderRadius: 10, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--emerald)", color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>1</div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>Saya (admin)</div>
          </div>

          {members.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--gray-soft)", color: "var(--ink-2)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 2}</div>
              <input className="app-input" placeholder={`Nama anggota ${i + 2}`} value={m} onChange={(e) => setMember(i, e.target.value)} style={{ flex: 1 }} />
              {members.length > 1 && (
                <button className="app-icon-btn" style={{ border: 0, background: "var(--gray-soft)", flexShrink: 0 }} onClick={() => removeMember(i)}>
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button className="app-btn btn-primary btn-block btn-lg" disabled={!canSubmit || saving} style={{ opacity: !canSubmit || saving ? 0.5 : 1 }} onClick={submit}>
          {saving ? "Menyimpan…" : "Buat Arisan"} <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </AppLayout>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", background: "var(--gray-soft)", borderRadius: 10, padding: 3, gap: 2 }}>
      {options.map((o) => (
        <button key={o.v} onClick={() => onChange(o.v)}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: 13, fontWeight: 600,
            background: value === o.v ? "#fff" : "none",
            color: value === o.v ? "var(--ink-1)" : "var(--ink-2)",
            boxShadow: value === o.v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}

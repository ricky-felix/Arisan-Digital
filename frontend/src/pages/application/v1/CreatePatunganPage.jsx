import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../components/application/AppLayout";
import Icon from "../../../components/application/Icon";
import { useToast } from "../../../context/ToastContext";
import { createBill, computeEqualSplit, hasCreatedSomething, useAuth, useAccountPrompt } from "./mockData";
import { formatRupiah } from "../../../utils/formatRupiah";

const CATEGORIES = [
  { id: "makanan", label: "Makanan", emoji: "🍽" },
  { id: "transport", label: "Transport", emoji: "🚗" },
  { id: "penginapan", label: "Penginapan", emoji: "🏨" },
  { id: "utilitas", label: "Utilitas", emoji: "⚡" },
  { id: "hiburan", label: "Hiburan", emoji: "🎬" },
  { id: "lainnya", label: "Lainnya", emoji: "···" },
];

export default function CreatePatunganPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { isAnonymous } = useAuth();
  const { promptRegister } = useAccountPrompt();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", category: "makanan", total: "", method: "equal" });
  // The payer (you) is always first; the rest are other participants.
  const [others, setOthers] = useState([""]);
  const [exact, setExact] = useState({}); // name -> amount for 'exact' method

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setOther = (i, v) => setOthers((m) => m.map((x, j) => (j === i ? v : x)));
  const addOther = () => setOthers((m) => [...m, ""]);
  const removeOther = (i) => setOthers((m) => m.filter((_, j) => j !== i));

  const totalNum = Number(form.total) || 0;
  const names = ["Saya", ...others.map((o) => o.trim()).filter(Boolean)];
  const preview = form.method === "equal" ? computeEqualSplit(totalNum, names) : names.map((n) => ({ name: n, amount: Number(exact[n]) || 0 }));
  const exactSum = preview.reduce((s, p) => s + p.amount, 0);
  const canSubmit = form.title.trim() && totalNum > 0 && names.length >= 2 && (form.method === "equal" || exactSum === totalNum);

  const submit = async () => {
    if (!canSubmit || saving) return;
    const firstTime = !hasCreatedSomething();
    setSaving(true);
    try {
      const participants = form.method === "exact"
        ? names.map((n) => ({ name: n, amount: Number(exact[n]) || 0 }))
        : names.map((n) => ({ name: n }));
      const id = await createBill({
        title: form.title.trim(),
        category: form.category,
        total: totalNum,
        method: form.method,
        participants,
      });
      toast("Tagihan patungan dibuat!", "success");
      navigate(`/app/patungan/${id}`);
      if (firstTime && isAnonymous) {
        promptRegister("Tagihan pertamamu sudah dibuat 🎉 Daftar gratis agar tidak hilang.");
      }
    } catch (err) {
      toast(err.message || "Gagal membuat tagihan", "error");
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Buat Tagihan">
      <div className="app-scroll" style={{ padding: "16px 16px 32px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
        <button className="app-btn btn-secondary" style={{ marginBottom: 16, padding: "6px 12px", fontSize: 13 }} onClick={() => navigate("/app/patungan")}>
          <Icon name="chevron-left" size={16} /> Kembali
        </button>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Buat Tagihan Patungan</h1>
        <p style={{ color: "var(--ink-2)", fontSize: 13, marginBottom: 20 }}>Anda yang membayar dulu, lalu bagi ke peserta lain.</p>

        <div className="app-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Judul</label>
            <input className="app-input" placeholder="Contoh: Makan malam Restoran Padang" value={form.title} onChange={set("title")} />
          </div>

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Kategori</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                style={{
                  padding: "10px 4px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                  border: form.category === c.id ? "1.5px solid var(--lavender-dark)" : "1px solid var(--line)",
                  background: form.category === c.id ? "var(--lavender-tint)" : "#fff",
                  color: form.category === c.id ? "var(--lavender-dark)" : "var(--ink-2)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}>
                <span style={{ fontSize: 18 }}>{c.emoji}</span>{c.label}
              </button>
            ))}
          </div>

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Total Tagihan</label>
          <div style={{ position: "relative", marginBottom: 4 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-2)", fontSize: 14 }}>Rp</span>
            <input className="app-input" type="number" inputMode="numeric" placeholder="480000" value={form.total} onChange={set("total")} style={{ paddingLeft: 38 }} />
          </div>
          {totalNum > 0 && <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{formatRupiah(totalNum)}</div>}
        </div>

        {/* Participants */}
        <div className="app-card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Peserta ({names.length})</div>
            <button className="app-btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }} onClick={addOther}>
              <Icon name="plus" size={14} /> Tambah
            </button>
          </div>

          {/* Split method */}
          <div style={{ display: "flex", background: "var(--gray-soft)", borderRadius: 10, padding: 3, gap: 2, marginBottom: 12 }}>
            {[{ v: "equal", l: "Sama Rata" }, { v: "exact", l: "Nominal Pas" }].map((o) => (
              <button key={o.v} onClick={() => setForm((f) => ({ ...f, method: o.v }))}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                  background: form.method === o.v ? "#fff" : "none", color: form.method === o.v ? "var(--ink-1)" : "var(--ink-2)",
                  boxShadow: form.method === o.v ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}>{o.l}</button>
            ))}
          </div>

          {/* You row */}
          <Row name="Saya" badge="pembayar" method={form.method} amount={preview[0]?.amount}
            exactVal={exact["Saya"]} onExact={(v) => setExact((e) => ({ ...e, Saya: v }))} />

          {others.map((o, i) => {
            const nm = o.trim();
            const amt = preview.find((p) => p.name === nm)?.amount;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <input className="app-input" placeholder={`Nama peserta ${i + 2}`} value={o} onChange={(e) => setOther(i, e.target.value)} style={{ flex: 1 }} />
                {form.method === "exact" ? (
                  <input className="app-input" type="number" placeholder="0" value={exact[nm] || ""} onChange={(e) => setExact((ex) => ({ ...ex, [nm]: e.target.value }))} style={{ width: 110 }} />
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 600, width: 110, textAlign: "right", color: "var(--ink-2)" }}>{nm ? formatRupiah(amt || 0) : "—"}</span>
                )}
                <button className="app-icon-btn" style={{ border: 0, background: "var(--gray-soft)", flexShrink: 0 }} onClick={() => removeOther(i)}>
                  <Icon name="x" size={14} />
                </button>
              </div>
            );
          })}

          {form.method === "exact" && totalNum > 0 && (
            <div style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: exactSum === totalNum ? "var(--emerald-dark)" : "#b91c1c" }}>
              Terbagi {formatRupiah(exactSum)} dari {formatRupiah(totalNum)}
              {exactSum !== totalNum && " — harus pas"}
            </div>
          )}
        </div>

        <button className="btn-violet app-btn btn-block btn-lg" disabled={!canSubmit || saving} style={{ opacity: !canSubmit || saving ? 0.5 : 1 }} onClick={submit}>
          {saving ? "Menyimpan…" : "Buat Tagihan"} <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </AppLayout>
  );
}

function Row({ name, badge, method, amount, exactVal, onExact }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--lavender-tint)", borderRadius: 10 }}>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
        {name} {badge && <span className="app-badge" style={{ fontSize: 10, background: "var(--lavender-dark)", color: "#fff", marginLeft: 4 }}>{badge}</span>}
      </div>
      {method === "exact" ? (
        <input className="app-input" type="number" placeholder="0" value={exactVal || ""} onChange={(e) => onExact(e.target.value)} style={{ width: 110 }} />
      ) : (
        <span style={{ fontSize: 13, fontWeight: 600, width: 110, textAlign: "right", color: "var(--ink-2)" }}>{formatRupiah(amount || 0)}</span>
      )}
    </div>
  );
}

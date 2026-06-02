import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/application/AppLayout";
import GroupListCard from "../../components/application/GroupListCard";
import GroupSearchBar from "../../components/application/GroupSearchBar";
import CreateJoinButtons from "../../components/application/CreateJoinButtons";
import Icon from "../../components/application/Icon";
import { listGroups } from "../../lib/data";
import { useToast } from "../../context/ToastContext";

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "admin", label: "Sebagai Admin" },
  { id: "member", label: "Sebagai Anggota" },
];

export function ArisanPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    let alive = true;
    listGroups()
      .then((g) => alive && setGroups(g))
      .catch((e) => alive && toast(e.message || "Gagal memuat", "error"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [toast]);

  const filtered = groups
    .filter((g) => (filter === "all" ? true : filter === "admin" ? g.isAdmin : !g.isAdmin))
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    toast("Fitur gabung via kode akan tersedia segera.", "warn");
    setShowJoinSheet(false);
    setJoinCode("");
  };

  return (
    <AppLayout title="Arisan Saya">
      <div className="app-scroll" style={{ padding: "16px 16px 24px" }}>
        <div className="hidden md:flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-module-arisan app-badge" style={{ padding: "3px 10px" }}><Icon name="users" size={11}/> Arisan</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Arisan Saya</h1>
            <p style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 4 }}>{groups.length} grup arisan aktif</p>
          </div>
          <button className="app-btn btn-primary" onClick={() => navigate("/app/arisan/buat")}>
            <Icon name="plus" size={16} /> Buat Arisan
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <GroupSearchBar value={search} onChange={setSearch} />
        </div>

        <div className="md:hidden mb-4">
          <CreateJoinButtons onBuat={() => navigate("/app/arisan/buat")} onGabung={() => setShowJoinSheet(true)} />
        </div>

        <div className="app-chips mb-4">
          {FILTERS.map((f) => (
            <button key={f.id} className={`app-chip ${filter === f.id ? "on" : ""}`} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="app-card" style={{ padding: 40, textAlign: "center", color: "var(--ink-2)" }}>Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="app-card app-empty">
            <div className="illus"><Icon name="users" size={36} /></div>
            <h3>{groups.length === 0 ? "Belum ada arisan" : "Tidak ada grup"}</h3>
            <p>{groups.length === 0 ? "Buat grup arisan pertama Anda untuk mulai menabung bersama." : "Coba ubah filter atau buat grup baru."}</p>
            <button className="app-btn btn-primary mt-2" onClick={() => navigate("/app/arisan/buat")}>
              <Icon name="plus" size={16}/> Buat Arisan
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 400px), 1fr))", gap: 12 }}>
            {filtered.map((g) => (
              <GroupListCard key={g.id} group={g} onClick={() => navigate(`/app/arisan/${g.id}`)} />
            ))}
          </div>
        )}
      </div>

      {showJoinSheet && (
        <div className="app-sheet-backdrop" onClick={() => setShowJoinSheet(false)}>
          <div className="app-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="grabber" style={{ width: 36, height: 4, borderRadius: 999, background: "var(--line)", margin: "8px auto 12px" }} />
            <div style={{ padding: "4px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>Gabung Arisan</div>
              <button className="app-icon-btn" style={{ border: 0, background: "var(--gray-soft)" }} onClick={() => setShowJoinSheet(false)}><Icon name="x" size={16} /></button>
            </div>
            <div style={{ padding: "0 20px 24px" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Kode Undangan</label>
              <input className="app-input" placeholder="Contoh: SARI-K3X9" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} style={{ marginBottom: 12 }} />
              <button className="app-btn btn-primary btn-block" onClick={handleJoin}>Gabung <Icon name="chevron-right" size={16} /></button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default ArisanPage;

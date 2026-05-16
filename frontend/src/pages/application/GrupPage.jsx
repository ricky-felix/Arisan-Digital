import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/application/AppLayout";
import GroupListCard from "../../components/application/GroupListCard";
import GroupSearchBar from "../../components/application/GroupSearchBar";
import CreateJoinButtons from "../../components/application/CreateJoinButtons";
import Icon from "../../components/application/Icon";
import { groups as mockGroups } from "../../data/appMockData";
import { useToast } from "../../context/ToastContext";

const FILTERS = [
  { id: "all",    label: "Semua" },
  { id: "admin",  label: "Sebagai Admin" },
  { id: "member", label: "Sebagai Anggota" },
];

export function GrupPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const filtered = mockGroups
    .filter(g => filter === "all" ? true : filter === "admin" ? g.isAdmin : !g.isAdmin)
    .filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  const handleJoin = () => {
    if (!joinCode.trim()) return;
    toast("Berhasil bergabung ke grup!", "success");
    setShowJoinSheet(false);
    setJoinCode("");
  };

  return (
    <AppLayout title="Grup Saya">
      <div className="app-scroll" style={{ padding: "16px 16px 24px" }}>
        {/* Desktop heading */}
        <div className="hidden md:flex justify-between items-end mb-6">
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Grup Saya</h1>
            <p style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 4 }}>{mockGroups.length} grup aktif</p>
          </div>
          <button className="app-btn btn-primary" onClick={() => navigate("/app/buat-arisan")}>
            <Icon name="plus" size={16} /> Buat Grup
          </button>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 12 }}>
          <GroupSearchBar value={search} onChange={setSearch} />
        </div>

        {/* Create/Join buttons (mobile) */}
        <div className="md:hidden mb-4">
          <CreateJoinButtons
            onBuat={() => navigate("/app/buat-arisan")}
            onGabung={() => setShowJoinSheet(true)}
          />
        </div>

        {/* Filter chips */}
        <div className="app-chips mb-4">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`app-chip ${filter === f.id ? "on" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Groups grid */}
        {filtered.length === 0 ? (
          <div className="app-card app-empty">
            <div className="illus"><Icon name="users" size={36} /></div>
            <h3>Tidak ada grup</h3>
            <p>Coba ubah filter atau buat grup baru.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 400px), 1fr))", gap: 12 }}>
            {filtered.map(g => (
              <GroupListCard
                key={g.id}
                group={g}
                onClick={() => navigate(`/app/grup/${g.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Join bottom sheet */}
      {showJoinSheet && (
        <div className="app-sheet-backdrop" onClick={() => setShowJoinSheet(false)}>
          <div className="app-sheet" onClick={e => e.stopPropagation()}>
            <div className="grabber" style={{ width: 36, height: 4, borderRadius: 999, background: "var(--line)", margin: "8px auto 12px" }} />
            <div style={{ padding: "4px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>Gabung Arisan</div>
              <button className="app-icon-btn" style={{ border: 0, background: "var(--gray-soft)" }} onClick={() => setShowJoinSheet(false)}>
                <Icon name="x" size={16} />
              </button>
            </div>
            <div style={{ padding: "0 20px 24px" }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Kode Undangan</label>
              <input
                className="app-input"
                placeholder="Contoh: SARI-K3X9"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                style={{ marginBottom: 12 }}
              />
              <button className="app-btn btn-primary btn-block" onClick={handleJoin}>
                Gabung <Icon name="chevron-right" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default GrupPage;

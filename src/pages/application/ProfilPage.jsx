import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../components/application/AppLayout";
import ConfirmDialog from "../../components/application/ConfirmDialog";
import Icon from "../../components/application/Icon";
import Avatar from "../../components/application/Avatar";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { me as mockMe } from "../../data/appMockData";

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 26, borderRadius: 999, border: "none", cursor: "pointer",
        background: on ? "var(--emerald)" : "var(--line)",
        position: "relative", flexShrink: 0, transition: "background 0.2s",
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: on ? 20 : 3,
        width: 20, height: 20, borderRadius: 999,
        background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function SettingRow({ ico, label, sub, iconBg, iconColor, children, onClick }) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        width: onClick ? "100%" : undefined, textAlign: onClick ? "left" : undefined,
        background: "none", border: "none", cursor: onClick ? "pointer" : "default",
        fontFamily: "inherit",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: iconBg || "var(--lavender-tint)",
        color: iconColor || "var(--lavender)",
        display: "grid", placeItems: "center",
      }}>
        <Icon name={ico} size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: iconColor === "var(--danger)" ? "var(--danger)" : "var(--ink-1)" }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </Wrapper>
  );
}

function SettingsGroup({ children }) {
  return (
    <div className="app-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16, display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--line-soft)", marginLeft: 64 }} />;
}

export function ProfilPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { profile, signOut } = useAuth();
  const [notifPrefs, setNotifPrefs] = useState({ bill: true, conf: true, marketing: false });
  const [lang, setLang] = useState("ID");
  const [logoutOpen, setLogoutOpen] = useState(false);

  const displayName = profile?.full_name || mockMe.name;
  const email = profile?.email || mockMe.email;
  const phone = mockMe.phone;
  const joined = mockMe.joined;

  const handleSignOut = async () => {
    setLogoutOpen(false);
    try {
      await signOut();
      navigate("/login");
    } catch {
      toast("Gagal keluar, coba lagi", "error");
    }
  };

  return (
    <AppLayout title="Profil & Pengaturan">
      <div className="app-scroll" style={{ padding: "16px 16px 40px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
        <div className="hidden md:block mb-6">
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>Profil & Pengaturan</h1>
        </div>

        {/* Profile card */}
        <div className="app-card" style={{ padding: 18, display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
          <Avatar name={displayName} size="xl" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{displayName}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
              <span style={{ fontSize: 13, color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="phone" size={12} /> {phone}
              </span>
              <span style={{ fontSize: 13, color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="mail" size={12} /> {email}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>Bergabung sejak {joined}</div>
          </div>
          <button className="app-btn btn-secondary" style={{ padding: "8px 12px", fontSize: 12, flexShrink: 0 }}>
            <Icon name="edit" size={14} /> Edit
          </button>
        </div>

        {/* Notifications */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px 4px" }}>Notifikasi</div>
        <SettingsGroup>
          <SettingRow ico="bell" label="Tagihan baru" sub="Pemberitahuan saat ada tagihan iuran">
            <Toggle on={notifPrefs.bill} onChange={v => setNotifPrefs(p => ({ ...p, bill: v }))} />
          </SettingRow>
          <Divider />
          <SettingRow ico="check-circle" label="Konfirmasi pembayaran" sub="Saat admin mengkonfirmasi/menolak bukti" iconBg="var(--emerald-tint)" iconColor="var(--emerald-dark)">
            <Toggle on={notifPrefs.conf} onChange={v => setNotifPrefs(p => ({ ...p, conf: v }))} />
          </SettingRow>
          <Divider />
          <SettingRow ico="sparkles" label="Promo & info" sub="Update fitur dan penawaran" iconBg="var(--lavender-soft)" iconColor="var(--lavender)">
            <Toggle on={notifPrefs.marketing} onChange={v => setNotifPrefs(p => ({ ...p, marketing: v }))} />
          </SettingRow>
        </SettingsGroup>

        {/* Language */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px 4px" }}>Bahasa</div>
        <SettingsGroup>
          <SettingRow ico="globe" label="Bahasa Aplikasi" sub={lang === "ID" ? "Bahasa Indonesia" : "English"} iconBg="var(--lavender-tint)" iconColor="var(--lavender)">
            <div style={{ display: "flex", background: "var(--gray-soft)", borderRadius: 8, padding: 3, gap: 2 }}>
              {["ID", "EN"].map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 12, fontWeight: 600,
                    background: lang === l ? "#fff" : "none",
                    color: lang === l ? "var(--ink-1)" : "var(--ink-2)",
                    boxShadow: lang === l ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </SettingRow>
        </SettingsGroup>

        {/* Account */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px 4px" }}>Akun</div>
        <SettingsGroup>
          <SettingRow ico="lock" label="Ubah Kata Sandi" sub="Terakhir diubah 3 bulan lalu" onClick={() => {}}>
            <Icon name="chevron-right" size={16} style={{ color: "var(--ink-3)" }} />
          </SettingRow>
          <Divider />
          <SettingRow
            ico="phone" label="Verifikasi Nomor HP" sub="Terverifikasi"
            iconBg="var(--emerald-tint)" iconColor="var(--emerald-dark)"
            onClick={() => {}}
          >
            <Icon name="chevron-right" size={16} style={{ color: "var(--ink-3)" }} />
          </SettingRow>
          <Divider />
          <SettingRow
            ico="logout" label="Keluar" sub="Keluar dari akun ini"
            iconBg="var(--danger-soft)" iconColor="var(--danger)"
            onClick={() => setLogoutOpen(true)}
          >
            <Icon name="chevron-right" size={16} style={{ color: "var(--ink-3)" }} />
          </SettingRow>
        </SettingsGroup>

        {/* About */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px 4px" }}>Tentang</div>
        <SettingsGroup>
          <SettingRow ico="info" label="Versi Aplikasi" sub="v2.4.1 · Build 1042" iconBg="var(--gray-soft)" iconColor="var(--ink-2)" />
          <Divider />
          <SettingRow ico="link" label="Syarat & Ketentuan" iconBg="var(--gray-soft)" iconColor="var(--ink-2)" onClick={() => {}}>
            <Icon name="chevron-right" size={16} style={{ color: "var(--ink-3)" }} />
          </SettingRow>
          <Divider />
          <SettingRow ico="lock" label="Kebijakan Privasi" iconBg="var(--gray-soft)" iconColor="var(--ink-2)" onClick={() => {}}>
            <Icon name="chevron-right" size={16} style={{ color: "var(--ink-3)" }} />
          </SettingRow>
        </SettingsGroup>

        <div style={{ textAlign: "center", padding: "8px 0 20px", fontSize: 12, color: "var(--ink-3)" }}>
          Arisan Digital · Dibuat untuk komunitas Indonesia 🇮🇩
        </div>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Keluar dari akun?"
        message="Anda akan keluar dan perlu masuk lagi untuk mengakses arisan."
        confirmText="Keluar"
        danger
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleSignOut}
      />
    </AppLayout>
  );
}

export default ProfilPage;

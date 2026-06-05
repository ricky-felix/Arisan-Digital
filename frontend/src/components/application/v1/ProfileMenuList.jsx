import { useState } from "react";
import Icon from "../Icon";

const SettingLink = ({ ico, label, sub, gray, iconColor, onClick }) => (
  <div
    className="app-setting-row cursor-pointer hover:bg-[var(--app-bg)]"
    onClick={onClick}
    role="button"
    tabIndex={0}
  >
    <div
      className="ico"
      style={
        iconColor === "green"
          ? { background: "var(--emerald-soft)", color: "var(--emerald-dark)" }
          : gray
          ? { background: "var(--gray-soft)", color: "var(--ink-2)" }
          : {}
      }
    >
      <Icon name={ico} size={16} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{sub}</div>}
    </div>
    <Icon name="chevron-right" size={16} style={{ color: "var(--ink-3)" }} />
  </div>
);

const Toggle = ({ label, sub, on, onChange }) => (
  <div className="app-setting-row">
    <div className="ico"><Icon name="bell" size={16} /></div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{sub}</div>}
    </div>
    <button className={`app-tgl ${on ? "on" : ""}`} onClick={() => onChange(!on)} aria-label={label} />
  </div>
);

export default function ProfileMenuList({ onSignOut }) {
  const [notifs, setNotifs] = useState({ bill: true, conf: true, marketing: false });
  const [lang, setLang] = useState("ID");

  return (
    <div>
      {/* Notifications */}
      <div className="app-eyebrow" style={{ margin: "16px 0 8px" }}>Notifikasi</div>
      <div className="app-settings-group" style={{ marginBottom: 16 }}>
        <Toggle label="Tagihan baru" sub="Pemberitahuan saat ada tagihan iuran" on={notifs.bill} onChange={v => setNotifs(p => ({ ...p, bill: v }))} />
        <Toggle label="Konfirmasi pembayaran" sub="Saat admin mengkonfirmasi/menolak bukti" on={notifs.conf} onChange={v => setNotifs(p => ({ ...p, conf: v }))} />
        <Toggle label="Promo & info" sub="Update fitur dan penawaran" on={notifs.marketing} onChange={v => setNotifs(p => ({ ...p, marketing: v }))} />
      </div>

      {/* Language */}
      <div className="app-eyebrow" style={{ margin: "16px 0 8px" }}>Bahasa</div>
      <div className="app-settings-group" style={{ marginBottom: 16 }}>
        <div className="app-setting-row">
          <div className="ico violet"><Icon name="globe" size={16} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Bahasa Aplikasi</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)" }}>{lang === "ID" ? "Bahasa Indonesia" : "English"}</div>
          </div>
          <div className="app-segmented">
            <button className={lang === "ID" ? "on" : ""} onClick={() => setLang("ID")}>ID</button>
            <button className={lang === "EN" ? "on" : ""} onClick={() => setLang("EN")}>EN</button>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="app-eyebrow" style={{ margin: "16px 0 8px" }}>Akun</div>
      <div className="app-settings-group" style={{ marginBottom: 16 }}>
        <SettingLink ico="lock" label="Ubah Kata Sandi" sub="Terakhir diubah 3 bulan lalu" />
        <SettingLink ico="phone" label="Verifikasi Nomor HP" sub="Terverifikasi" iconColor="green" />
        <div
          className="app-setting-row cursor-pointer"
          onClick={onSignOut}
          role="button"
          tabIndex={0}
        >
          <div className="ico" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
            <Icon name="logout" size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--danger)" }}>Keluar</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)" }}>Keluar dari akun ini</div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="app-eyebrow" style={{ margin: "16px 0 8px" }}>Tentang</div>
      <div className="app-settings-group" style={{ marginBottom: 16 }}>
        <SettingLink ico="info" label="Versi Aplikasi" sub="v2.4.1 · Build 1042" gray />
        <SettingLink ico="link" label="Syarat & Ketentuan" gray />
        <SettingLink ico="lock" label="Kebijakan Privasi" gray />
      </div>
    </div>
  );
}

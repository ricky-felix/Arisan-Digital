import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import {
  UserSingle,
  Card,
  Lock,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
} from "../../../components/v2/icons";
import ProfileHero from "../../../components/v2/profil/ProfileHero";
import StatsCard from "../../../components/v2/profil/StatsCard";
import MenuRow from "../../../components/v2/profil/MenuRow";
import MenuSection from "../../../components/v2/profil/MenuSection";

export default function Profil() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      /* ignore — return to landing regardless */
    }
    navigate("/");
  };

  return (
    <div className="v2-screen v2-profil">
      <div className="v2-inner" style={{ overflowY: "auto", background: "var(--app-bg)" }}>

        <ProfileHero
          name="Ricky Felix"
          phone="+62 812 3456 7890"
          joined="Bergabung sejak Januari 2024"
          onBack={() => navigate("/app")}
          onEdit={() => toast("Edit profil — segera hadir")}
        />

        {/* Desktop two-column layout: stats+identity left, menu sections right */}
        <div className="profil-desktop-layout">

          <StatsCard />

          {/* Menu sections */}
          <div className="sections-wrap">

            {/* Akun */}
            <MenuSection title="Akun">
              <MenuRow
                icon={<UserSingle size={17} strokeWidth={2} />}
                tileClass="em"
                label="Edit Profil"
                sub="Nama, foto, nomor HP"
                onClick={() => toast("Edit profil — segera hadir")}
              />
              <MenuRow
                icon={<Card size={17} strokeWidth={2} />}
                tileClass="lv"
                label="Metode Pembayaran"
                sub="Dompet grup & transfer langsung"
                onClick={() => toast("Metode pembayaran — segera hadir")}
              />
              <MenuRow
                icon={<Lock size={17} strokeWidth={2} />}
                tileClass="em"
                label="Keamanan & PIN"
                sub="Ubah PIN, sidik jari"
                onClick={() => toast("Keamanan — segera hadir")}
              />
            </MenuSection>

            {/* Aplikasi */}
            <MenuSection title="Aplikasi">
              <MenuRow
                icon={<Bell size={17} strokeWidth={2} />}
                tileClass="lv"
                label="Notifikasi"
                sub="Pengingat iuran & tagihan"
                onClick={() => navigate("/app/notifikasi")}
              />
              <MenuRow
                icon={<Globe size={17} strokeWidth={2} />}
                tileClass="gray"
                label="Bahasa"
                sub="Bahasa Indonesia"
                onClick={() => toast("Bahasa: Bahasa Indonesia")}
              />
              <MenuRow
                icon={<HelpCircle size={17} strokeWidth={2} />}
                tileClass="gray"
                label="Bantuan"
                sub="FAQ & hubungi kami"
                onClick={() => toast("Bantuan — segera hadir")}
              />
            </MenuSection>

            {/* Keluar — no section label, no trailing chevron */}
            <MenuSection>
              <MenuRow
                icon={<LogOut size={17} strokeWidth={2} />}
                tileClass=""
                label="Keluar"
                danger
                onClick={handleLogout}
              />
            </MenuSection>

            <div className="version-footer">Arisan Digital v1.0.0</div>
          </div>

        </div>{/* end profil-desktop-layout */}

      </div>
    </div>
  );
}

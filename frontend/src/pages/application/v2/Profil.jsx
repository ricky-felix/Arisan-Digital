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
  Replay,
  LogOut,
} from "../../../components/application/v2/icons";
import ProfileHero from "../../../components/application/v2/profil/ProfileHero";
import StatsCard from "../../../components/application/v2/profil/StatsCard";
import MenuRow from "../../../components/application/v2/profil/MenuRow";
import MenuSection from "../../../components/application/v2/profil/MenuSection";

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

  // Clear the coach-mark flag (same key HomeDeck reads) then jump to the deck
  // so the guided tour replays from the top.
  const handleReplayTutorial = () => {
    try {
      localStorage.removeItem("arisan.v2.coachSeen");
    } catch {
      /* private mode — nothing to clear */
    }
    navigate("/app");
  };

  return (
    <div className="v2-screen">
      <div className="v2-inner" style={{ overflowY: "auto" }}>

        <ProfileHero
          name="Ricky Felix"
          phone="+62 812 3456 7890"
          joined="Bergabung sejak Januari 2024"
          onBack={() => navigate("/app")}
          onEdit={() => toast("Edit profil — segera hadir")}
        />

        {/* Past phone width the content collapses to a single centered column.
            Explicit lg:w-[620px] (not just max-w) so the column keeps a definite
            width as a flex child of .v2-inner — with mx-auto, a content-sized
            flex item would otherwise shrink and never reach 620px. */}
        <div className="lg:mx-auto lg:flex lg:w-[620px] lg:max-w-[620px] lg:flex-col lg:pb-12">

          <StatsCard />

          {/* Menu sections */}
          <div className="flex flex-col gap-5 px-5 pb-8 min-[481px]:mx-auto min-[481px]:max-w-[600px] min-[481px]:px-6 lg:mx-0 lg:w-full lg:max-w-none lg:px-0">

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

            {/* WebApp */}
            <MenuSection title="WebApp">
              <MenuRow
                icon={<Bell size={17} strokeWidth={2} />}
                tileClass="lv"
                label="Notifikasi"
                sub="Pengingat iuran arisan & tagihan"
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
              <MenuRow
                icon={<Replay size={17} strokeWidth={2} />}
                tileClass="em"
                label="Lihat Ulang Tutorial"
                sub="Putar ulang panduan beranda"
                onClick={handleReplayTutorial}
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

            <div className="mt-1 pb-2 text-center text-[11px] font-medium text-ink-3">
              Arisan Digital v1.0.0
            </div>
          </div>

        </div>{/* end centered content column */}

      </div>
    </div>
  );
}

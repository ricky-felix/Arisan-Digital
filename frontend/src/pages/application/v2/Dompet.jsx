import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { ChevronLeft, Users, Home, Split, Wallet } from "../../../components/application/v2/icons";
import WalletCard from "../../../components/application/v2/dompet/WalletCard";
import PanelRow from "../../../components/application/v2/dompet/PanelRow";
import { ARISAN_CARD, PATUNGAN_CARD, DOMPET_CARD } from "../../../components/application/v2/dompet/data";

export default function Dompet() {
  const navigate = useNavigate();
  const [open, setOpen] = useState({ arisan: true, patungan: false, dompet: false });

  function toggle(key) {
    setOpen(s => ({ ...s, [key]: !s[key] }));
  }

  return (
    <div className="v2-screen v2-dompet">
      <div className="v2-inner overflow-y-auto">

        {/* Header */}
        <div className="ov-header">
          <button className="back-btn" aria-label="Kembali" type="button" onClick={() => navigate("/app")}>
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>
          <span className="ov-title">Dompet Saya</span>
        </div>

        {/* ── Wallet cards grid (single column on mobile, multi-column on desktop) ── */}
        <div className="wallet-cards-grid">

          {/* ── Arisan card ── */}
          <WalletCard
            {...ARISAN_CARD}
            icon={<Users size={18} stroke="white" strokeWidth={2} />}
            open={open.arisan}
            onToggle={() => toggle("arisan")}
          >
            {/* Keluarga Sari — urgent */}
            <PanelRow
              icon={<Users size={18} stroke="var(--emerald-dark)" strokeWidth={2} />}
              iconClass="em"
              name="Keluarga Sari"
              meta="12 anggota · 8/12 bayar · Giliran: Budi S."
              fillClass="em"
              fillWidth="67%"
              amount="Rp 200k"
              amountClass="em"
              badge={{ text: "2 hari lagi", className: "urgent" }}
              rowClass="urgent-arisan"
              onClick={() => navigate("/app/anggota")}
            />
            {/* Arisan Kantor */}
            <PanelRow
              icon={<Users size={18} stroke="var(--emerald-dark)" strokeWidth={2} />}
              iconClass="em"
              name="Arisan Kantor"
              meta="8 anggota · 2/8 putaran · Rp 150k/bln"
              fillClass="em"
              fillWidth="25%"
              amount="Rp 150k"
              amountClass="em"
              badge={{ text: "15 Jun", className: "em" }}
            />
            {/* Arisan RT 05 */}
            <PanelRow
              icon={<Home size={18} stroke="var(--emerald-dark)" strokeWidth={2} />}
              iconClass="em"
              name="Arisan RT 05"
              meta="20 anggota · 3/20 putaran · Rp 50k/mgg"
              fillClass="em"
              fillWidth="15%"
              amount="Rp 50k"
              amountClass="em"
              badge={{ text: "Minggu ini", className: "em" }}
            />
          </WalletCard>

          {/* ── Patungan card ── */}
          <WalletCard
            {...PATUNGAN_CARD}
            icon={<Split size={18} stroke="white" strokeWidth={2} />}
            open={open.patungan}
            onToggle={() => toggle("patungan")}
          >
            <PanelRow
              icon="🍽"
              iconClass="lv"
              name="Makan Bali"
              meta="6 orang · 3 belum bayar · Rp 90k/orang"
              fillClass="lv"
              fillWidth="60%"
              amount="Rp 540k"
              amountClass="lv"
              badge={{ text: "60%", className: "lv" }}
            />
            <PanelRow
              icon="🏨"
              iconClass="lv"
              name="Hotel Bromo"
              meta="4 orang · 3 belum bayar · Deadline 8 Jun"
              fillClass="lv"
              fillWidth="25%"
              amount="Rp 1,2jt"
              amountClass="lv"
              badge={{ text: "Urgent", className: "urgent" }}
              rowClass="urgent-patungan"
            />
            <PanelRow
              icon="🎬"
              iconClass="grey"
              name="Tiket Konser"
              meta="4 orang · Semua sudah bayar"
              fillClass="grey"
              fillWidth="100%"
              amount="Rp 800k"
              amountClass="neutral"
              badge={{ text: "Selesai", className: "settled" }}
              rowClass="settled"
            />
          </WalletCard>

          {/* ── Dompet Grup card ── */}
          <WalletCard
            {...DOMPET_CARD}
            icon={<Wallet size={18} stroke="white" strokeWidth={2} />}
            open={open.dompet}
            onToggle={() => toggle("dompet")}
          >
            <PanelRow
              icon={<Wallet size={18} stroke="#0f766e" strokeWidth={2} />}
              iconClass="teal"
              name="Dompet Keluarga Sari"
              meta="Terkumpul Rp 1.600.000 dari Rp 2.400.000 · Cair 10 Jun ke Budi S."
              fillClass="teal"
              fillWidth="67%"
              amount="Rp 1,6jt"
              amountClass="teal"
              badge={{ text: "67%", className: "teal" }}
              onClick={() => navigate("/app/anggota")}
            />
          </WalletCard>

        </div>{/* end wallet-cards-grid */}

        <div className="h-8" />
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import PaySheet from "../../../components/v2/PaySheet";
import { useToast } from "../../../context/ToastContext";
import { ChevronLeft, Users, Split, Check, Clock } from "../../../components/v2/icons";
import NotifBubble    from "../../../components/v2/notifikasi/NotifBubble";
import GroupLabel     from "../../../components/v2/notifikasi/GroupLabel";
import ReminderButton from "../../../components/v2/notifikasi/ReminderButton";
import SuggestBar     from "../../../components/v2/notifikasi/SuggestBar";

// Renders the correct 8×8 icon for an arisan/patungan tag badge.
const TagIcon = ({ type }) =>
  type === "arisan"
    ? <Users size={8} stroke="currentColor" strokeWidth={2.5} />
    : <Split size={8} stroke="currentColor" strokeWidth={2.5} />;

export default function Notifikasi() {
  const navigate = useNavigate();
  const toast = useToast();
  const [paySheet, setPaySheet] = useState({ open: false });
  const [sentReminders, setSentReminders] = useState({});
  const [paidBtns, setPaidBtns] = useState({});

  function openPaySheet() {
    setPaySheet({ open: true });
  }
  function closePaySheet() {
    setPaySheet({ open: false });
  }
  function handlePaid() {
    setPaidBtns(p => ({ ...p, bayarNotif: true }));
  }

  function fireReminder(key, msg) {
    setSentReminders(p => ({ ...p, [key]: true }));
    toast(msg + " ✓");
  }

  return (
    <div className="v2-screen v2-notifikasi">
      <div className="v2-inner bg-app-bg overflow-y-auto">

        {/* Header */}
        <div className="notif-header">
          <button className="back-btn" aria-label="Kembali" type="button" onClick={() => navigate("/app")}>
            <ChevronLeft size={16} />
          </button>
          <span className="notif-title">Notifikasi</span>
        </div>

        {/* Helper legend */}
        <div className="notif-legend">
          <div className="nl-inner">
            <span className="nl-item">
              <span className="nl-swatch left" />
              Kiri: kabar masuk
            </span>
            <span className="nl-item">
              Kanan: perlu tindakanmu
              <span className="nl-swatch right" />
            </span>
          </div>
        </div>

        {/* ── Hari ini ── */}
        <GroupLabel icon={<Clock size={10} strokeWidth={2.5} />}>Hari ini</GroupLabel>

        <div className="convo-wrap">
          {/* LEFT — Budi sudah bayar */}
          <NotifBubble side="incoming" avatar="BS">
            <div className="bub-card arisan unread">
              <div className="bub-tag arisan">
                <TagIcon type="arisan" />
                Arisan · Keluarga Sari
              </div>
              <div className="bub-text">
                <strong>Budi Setiawan</strong> sudah bayar iuran{" "}
                <span className="check">Rp 200.000</span>. Dia dapat giliran putaran ke-6.
              </div>
              <div className="bub-actions">
                <button type="button" className="ba-btn ghost" onClick={() => navigate("/app/anggota")}>
                  Lihat
                </button>
              </div>
              <div className="bub-time">09:23 · barusan</div>
            </div>
          </NotifBubble>

          {/* RIGHT — Iuran jatuh tempo */}
          <NotifBubble side="outgoing">
            <div className="bub-card arisan unread">
              <div className="bub-tag arisan">
                <TagIcon type="arisan" />
                Arisan · Keluarga Sari
              </div>
              <div className="bub-text">
                Iuran <strong>Arisan Keluarga Sari</strong> jatuh tempo{" "}
                <strong>2 hari lagi</strong>.
                <span className="bub-amount em">Rp 200.000</span>
                Budi sedang menunggu giliran.
              </div>
              <div className="bub-actions">
                <ReminderButton
                  sent={paidBtns.bayarNotif}
                  onClick={openPaySheet}
                  idleLabel="Bayar Sekarang"
                  sentLabel="Lunas"
                  variant="em"
                />
              </div>
              <div className="bub-time">08:00 · pengingat otomatis</div>
            </div>
          </NotifBubble>

          {/* LEFT — Rina sudah transfer */}
          <NotifBubble side="incoming" avatar="RA">
            <div className="bub-card patungan">
              <div className="bub-tag patungan">
                <TagIcon type="patungan" />
                Patungan · Makan Bali
              </div>
              <div className="bub-text">
                <strong>Rina Amalia</strong> sudah transfer{" "}
                <span className="check">Rp 90.000</span> untuk Makan Bali.
              </div>
              <div className="bub-time">08:47</div>
            </div>
          </NotifBubble>

          {/* RIGHT — Sari belum bayar */}
          <NotifBubble side="outgoing">
            <div className="bub-card patungan unread-lv">
              <div className="bub-tag patungan">
                <TagIcon type="patungan" />
                Patungan · Makan Bali
              </div>
              <div className="bub-text">
                <strong>Sari Indah</strong> belum bayar patungan Makan Bali.
                <span className="bub-amount lv">Rp 90.000 belum masuk</span>
              </div>
              <div className="bub-actions">
                <ReminderButton
                  sent={sentReminders.ingatkanSari}
                  onClick={() => fireReminder("ingatkanSari", "Pengingat terkirim ke Sari")}
                  idleLabel="Ingatkan"
                  sentLabel="Terkirim"
                  variant="lv"
                />
              </div>
              <div className="bub-time">08:15</div>
            </div>
          </NotifBubble>
        </div>

        {/* ── Kemarin ── */}
        <GroupLabel spaced>Kemarin</GroupLabel>

        <div className="convo-wrap">
          {/* LEFT — Dian bayar via GoPay */}
          <NotifBubble side="incoming" avatar="DK">
            <div className="bub-card arisan">
              <div className="bub-tag arisan">Arisan · Keluarga Sari</div>
              <div className="bub-text">
                <strong>Dian Kusuma</strong> bayar via GoPay{" "}
                <span className="check">Rp 200.000</span>. Total 8 dari 12 sudah lunas.
              </div>
              <div className="bub-time">Kemarin, 18:05</div>
            </div>
          </NotifBubble>

          {/* RIGHT — 3 orang belum bayar Hotel Bromo */}
          <NotifBubble side="outgoing">
            <div className="bub-card patungan">
              <div className="bub-tag patungan">Patungan · Hotel Bromo</div>
              <div className="bub-text">
                <strong>3 orang</strong> belum bayar Hotel Bromo.
                <span className="bub-amount lv">Rp 900.000 belum masuk</span>
              </div>
              <div className="bub-actions">
                <ReminderButton
                  sent={sentReminders.tagihBromo}
                  onClick={() => fireReminder("tagihBromo", "Tagihan dikirim ke 3 orang")}
                  idleLabel="Tagih Sisanya"
                  sentLabel="Terkirim"
                  variant="lv"
                />
              </div>
              <div className="bub-time">Kemarin, 17:50</div>
            </div>
          </NotifBubble>

          {/* LEFT — Tiket Konser selesai */}
          <NotifBubble
            side="incoming"
            avatar={<Check size={14} stroke="var(--emerald-dark)" strokeWidth={2.5} />}
          >
            <div className="bub-card patungan">
              <div className="bub-tag patungan">Patungan · Tiket Konser</div>
              <div className="bub-text">
                Tiket Konser sudah lunas — semua sudah bayar.{" "}
                <span className="check">4/4 orang selesai</span>.
              </div>
              <div className="bub-time">Kemarin, 14:22</div>
            </div>
          </NotifBubble>
        </div>

        {/* ── Minggu ini ── */}
        <GroupLabel spaced>Minggu ini</GroupLabel>

        <div className="convo-wrap">
          {/* LEFT — Anggi bergabung */}
          <NotifBubble side="incoming" avatar="AN">
            <div className="bub-card arisan">
              <div className="bub-tag arisan">Arisan · Kantor</div>
              <div className="bub-text">
                <strong>Anggi</strong> bergabung ke Arisan Kantor. Sekarang ada 8 anggota.
              </div>
              <div className="bub-time">Senin, 14:10</div>
            </div>
          </NotifBubble>

          <div className="tail-bub">
            <div className="tail-pill">Itu semua notifikasi terbaru</div>
          </div>
        </div>

        {/* Quick-reply chips */}
        <SuggestBar
          onMarkRead={() => toast("Semua notifikasi ditandai dibaca ✓")}
          onRemind={() => toast("Pengingat dikirim ke yang belum bayar ✓")}
          onOpenWallet={() => navigate("/app/dompet")}
        />

      </div>

      {/* Pay sheet */}
      <PaySheet
        open={paySheet.open}
        onClose={closePaySheet}
        amount="Rp 200.000"
        label="Iuran Arisan Keluarga Sari"
        destName="Dompet Grup Keluarga Sari"
        destType="arisan"
        onPaid={handlePaid}
      />
    </div>
  );
}

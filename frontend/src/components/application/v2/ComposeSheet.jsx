import { useNavigate } from "react-router-dom";
import { Plus, X, Users, Split, QrJoin } from "./icons";

/**
 * ComposeSheet — "MULAI DENGAN APA?" create chooser pill
 * Appears as a floating pill at the bottom of HomeDeck.
 * Props:
 *   open     boolean
 *   onOpen   () => void
 *   onClose  () => void
 */
export default function ComposeSheet({ open, onOpen, onClose }) {
  const navigate = useNavigate();

  return (
    <div className="v2-home compose-outer">
      <div className={`compose-pill${open ? " open" : ""}`}>

        {/* Collapsed pill row */}
        <div className="pill-collapsed" onClick={onOpen} role="button" aria-label="Mulai sesuatu baru" tabIndex={0}
          onKeyDown={e => (e.key === "Enter" || e.key === " ") && onOpen()}>
          <div className="pill-icon">
            <Plus size={12} stroke="white" strokeWidth={3} />
          </div>
          <span className="pill-label">Mulai sesuatu baru…</span>
          <div className="pill-dots">
            <div className="pill-dot em" />
            <div className="pill-dot lv" />
          </div>
        </div>

        {/* Expanded sheet */}
        <div className="pill-expanded">
          <div className="pill-header-row">
            <span className="pill-sheet-title">Mulai dengan apa?</span>
            <button className="pill-close-btn" onClick={onClose} aria-label="Tutup" type="button">
              <X size={13} stroke="currentColor" strokeWidth={2.5} />
            </button>
          </div>

          <div className="pill-actions">
            <div className="pill-lanes">
              {/* Arisan lane */}
              <button type="button" className="pill-lane em" onClick={() => { onClose(); navigate("/app/buat-arisan"); }}>
                <div className="lane-icon em">
                  <Users size={18} stroke="white" strokeWidth={2} />
                </div>
                <div className="lane-title em">Arisan</div>
                <div className="lane-sub">Tabungan bergilir bersama teman &amp; keluarga</div>
              </button>

              {/* Patungan lane */}
              <button type="button" className="pill-lane lv" onClick={() => { onClose(); navigate("/app/patungan/buat"); }}>
                <div className="lane-icon lv">
                  <Split size={18} stroke="white" strokeWidth={2} />
                </div>
                <div className="lane-title lv">Patungan</div>
                <div className="lane-sub">Bagi tagihan &amp; lacak siapa yang sudah bayar</div>
              </button>
            </div>

            {/* Dashed join row */}
            <button type="button" className="pill-join-row" onClick={() => { onClose(); navigate("/app/gabung"); }}>
              <QrJoin size={18} stroke="currentColor" strokeWidth={2} />
              <div>
                <div className="pill-join-main">Gabung Arisan / Patungan</div>
                <div className="pill-join-sub">Scan / unggah QR atau tempel link undangan</div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

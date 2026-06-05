import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { ChevronLeft, Share, Send, Check, Users, Split } from "../../../components/v2/icons";
import FauxQr from "../../../components/v2/undang/FauxQr";
import { INVITE } from "../../../components/v2/undang/data";

/**
 * Undang — the group owner's "share invite link" screen.
 * Shows a QR code, the join link with copy, WhatsApp share, and who's joined.
 */
export default function Undang() {
  const navigate = useNavigate();
  const toast = useToast();
  const { group, link, joined, pending } = INVITE;
  const isArisan = group.type === "arisan";
  const [copied, setCopied] = useState(false);

  const fullLink = `https://${link}`;

  function copyLink() {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullLink).catch(() => {});
    }
    setCopied(true);
    toast("Link undangan disalin ✓");
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWa() {
    const text = encodeURIComponent(
      `Yuk gabung ${group.typeLabel} "${group.name}" di Arisan Digital: ${fullLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={`v2-screen v2-undang${isArisan ? "" : " patungan"}`}>
      <div className="undang-scroll">

        {/* Sticky header — consistent with other pages */}
        <div className="undang-nav">
          <button type="button" className="undang-nav-btn" onClick={() => navigate(-1)} aria-label="Kembali">
            <ChevronLeft size={16} stroke="currentColor" strokeWidth={2.5} />
          </button>
          <span className="undang-nav-title">Undang Anggota</span>
          <button type="button" className="undang-nav-btn" onClick={shareWa} aria-label="Bagikan undangan">
            <Share size={16} stroke="currentColor" strokeWidth={2} />
          </button>
        </div>

        <div className="undang-col">

          {/* Group being shared */}
          <div className="undang-group">
            <div className="undang-group-icon">
              {isArisan
                ? <Users size={18} stroke="white" strokeWidth={2} />
                : <Split size={18} stroke="white" strokeWidth={2} />}
            </div>
            <div>
              <div className="undang-group-name">{group.name}</div>
              <div className="undang-group-meta">{group.typeLabel} · {group.members}/{group.capacity} anggota</div>
            </div>
            <span className="undang-type-badge">{group.typeLabel}</span>
          </div>

          {/* QR card */}
          <div className="undang-qr-card">
            <div className="undang-qr-frame">
              <FauxQr size={196} />
            </div>
            <div className="undang-qr-hint">
              Scan untuk gabung ke <strong>{group.name}</strong>
            </div>
          </div>

          {/* Copy link */}
          <div className="undang-link-row">
            <div className="undang-link-text">{link}</div>
            <button type="button" className={`undang-copy${copied ? " done" : ""}`} onClick={copyLink}>
              {copied
                ? <><Check size={14} stroke="currentColor" strokeWidth={3} /> Tersalin</>
                : "Salin"}
            </button>
          </div>

          {/* WhatsApp share */}
          <button type="button" className="undang-share-wa" onClick={shareWa}>
            <Send size={16} stroke="white" strokeWidth={2.2} />
            Bagikan ke WhatsApp
          </button>

          {/* Members */}
          <div className="undang-section-label">
            Sudah gabung · {joined.length}{pending ? ` · ${pending} menunggu` : ""}
          </div>
          <div className="undang-members">
            {joined.map(m => (
              <div className="undang-member" key={m.initials}>
                <div className="undang-av" style={{ background: m.color }}>{m.initials}</div>
                <div className="undang-member-info">
                  <div className="undang-member-name">{m.name}</div>
                  <div className="undang-member-role">{m.role}</div>
                </div>
                {m.role === "Admin" && <span className="undang-admin-badge">Admin</span>}
              </div>
            ))}
            {pending > 0 && (
              <div className="undang-pending">{pending} undangan menunggu dibuka</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { useToast } from "../../../context/ToastContext";
import { ChevronLeft, Users, Split } from "../../../components/v2/icons";
import { INVITE } from "../../../components/v2/undang/data";

/**
 * Gabung — the invitee's landing screen when opening an invite link.
 * Previews the group, takes a name (no signup), and joins.
 */
export default function Gabung() {
  const navigate = useNavigate();
  const toast = useToast();
  const { group, joined } = INVITE;
  const isArisan = group.type === "arisan";
  const [name, setName] = useState("");

  function join() {
    if (!name.trim()) {
      toast("Isi nama kamu dulu");
      return;
    }
    toast(`Selamat datang di ${group.name}! 🎉`);
    navigate("/app");
  }

  return (
    <div className={`v2-screen v2-gabung${isArisan ? "" : " patungan"}`}>
      <div className="gabung-scroll">

        {/* Gradient invite hero */}
        <div className="gabung-hero">
          <div className="gabung-hero-blob g1" />
          <div className="gabung-hero-blob g2" />

          <button type="button" className="gabung-back" onClick={() => navigate(-1)} aria-label="Kembali">
            <ChevronLeft size={18} stroke="white" strokeWidth={2.5} />
          </button>

          <div className="gabung-hero-icon">
            {isArisan
              ? <Users size={26} stroke="white" strokeWidth={2} />
              : <Split size={26} stroke="white" strokeWidth={2} />}
          </div>
          <div className="gabung-hero-eyebrow">Kamu diundang ke {group.typeLabel}</div>
          <div className="gabung-hero-name">{group.name}</div>
          <div className="gabung-hero-tagline">{group.tagline}</div>

          <div className="gabung-avs">
            {joined.slice(0, 4).map(m => (
              <div className="gabung-av" key={m.initials} style={{ background: m.color }}>{m.initials}</div>
            ))}
            {group.members > 4 && <div className="gabung-av more">+{group.members - 4}</div>}
          </div>
        </div>

        <div className="gabung-col">

          {/* Key facts — overlaps the hero bottom edge */}
          <div className="gabung-facts">
            <div className="gabung-fact">
              <div className="gabung-fact-label">Iuran</div>
              <div className="gabung-fact-val">{group.iuran}<span>{group.cadence}</span></div>
            </div>
            <div className="gabung-fact">
              <div className="gabung-fact-label">Anggota</div>
              <div className="gabung-fact-val">{group.members}<span>/{group.capacity}</span></div>
            </div>
            <div className="gabung-fact">
              <div className="gabung-fact-label">Admin</div>
              <div className="gabung-fact-val sm">{group.admin}</div>
            </div>
          </div>

          {/* Name (no signup required) */}
          <label className="gabung-field">
            <span className="gabung-field-label">Masuk sebagai</span>
            <input
              className="gabung-input"
              placeholder="Nama kamu"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
            />
          </label>

          <button type="button" className="gabung-cta" onClick={join}>
            Gabung Sekarang
          </button>

          <div className="gabung-note">
            Tanpa perlu daftar akun. Dengan bergabung kamu setuju ikut iuran {group.iuran}{group.cadence}.
          </div>

        </div>
      </div>
    </div>
  );
}

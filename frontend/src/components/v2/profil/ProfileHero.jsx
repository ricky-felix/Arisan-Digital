import { ChevronLeft, Calendar } from "../icons";

/**
 * ProfileHero
 *
 * Renders the full `.hero` block: decorative blobs, the top-bar with back
 * and edit buttons, and the avatar / identity body.
 *
 * Props:
 *   name    {string} – display name shown in the hero body
 *   phone   {string} – phone number shown below the name
 *   joined  {string} – "since" label text, e.g. "Bergabung sejak Januari 2024"
 *   onBack  {() => void} – called when the back arrow is pressed
 *   onEdit  {() => void} – called when the "Edit Profil" button is pressed
 */
export default function ProfileHero({ name, phone, joined, onBack, onEdit }) {
  return (
    <div className="hero">
      <div className="hero-blob1" />
      <div className="hero-blob2" />
      <div className="hero-blob3" />

      {/* Top bar: back arrow left, edit button right */}
      <div className="hero-topbar">
        <button
          className="hero-back-btn"
          aria-label="Kembali"
          type="button"
          onClick={onBack}
        >
          <ChevronLeft size={17} stroke="white" strokeWidth={2.5} />
        </button>
        <button type="button" className="hero-edit-btn" onClick={onEdit}>
          Edit Profil
        </button>
      </div>

      {/* Avatar + identity */}
      <div className="hero-body">
        <div className="hero-avatar">RF</div>
        <div className="hero-name">{name}</div>
        <div className="hero-phone">{phone}</div>
        <div className="hero-since">
          <Calendar size={11} strokeWidth={2.5} />
          {joined}
        </div>
      </div>
    </div>
  );
}

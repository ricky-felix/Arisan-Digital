import { MenuDots, Bell, ChevronLeft } from "../icons";

/**
 * StoryTopBar — the fixed top bar rendered over the card deck.
 *
 * Props:
 *   onList    () => void   — handler for the list/menu button
 *   onNotif   () => void   — handler for the bell/notification button
 *   onProfile () => void   — handler for the avatar/profile button
 */
export default function StoryTopBar({ onList, onNotif, onProfile }) {
  return (
    <div className="story-topbar">
      <button
        className="story-list-btn"
        aria-label="Lihat semua"
        type="button"
        onClick={onList}
      >
        <MenuDots size={16} stroke="white" strokeWidth={2.5} />
      </button>
      <div className="story-topbar-right">
        <button
          className="story-icon-btn"
          aria-label="Notifikasi"
          type="button"
          onClick={onNotif}
        >
          <Bell size={17} stroke="white" strokeWidth={2} />
          <span className="story-notif-dot" />
        </button>
        <button
          className="story-avatar"
          aria-label="Profil"
          type="button"
          onClick={onProfile}
        >
          RF
        </button>
      </div>
    </div>
  );
}

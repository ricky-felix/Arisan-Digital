import { useAuth } from "../../../context/AuthContext";
import { UserSingle } from "./icons";

/**
 * Derive up-to-two-letter initials from a display name.
 * "Ricky Felix" -> "RF", "Ricky" -> "RI", "" -> "".
 */
function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * AvatarContent — renders the inner content of a profile avatar based on auth
 * state: a registered user gets their initials, a guest (anonymous / unnamed)
 * gets the generic person icon. Styling (size, color, shape) lives on the
 * wrapping element; this only renders the glyph/text.
 *
 * Props:
 *   iconSize {number} – px size for the guest fallback icon
 */
export default function AvatarContent({ iconSize = 18 }) {
  const { profile, isAnonymous } = useAuth();
  const name = profile?.name?.trim();
  const isGuest = isAnonymous || !name || name === "Tamu" || name === "Guest";

  if (isGuest) {
    return <UserSingle size={iconSize} stroke="white" strokeWidth={2.25} />;
  }
  return getInitials(name);
}

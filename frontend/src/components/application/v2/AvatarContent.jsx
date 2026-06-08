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
 * AvatarContent — renders the inner content of a profile avatar.
 * All users are now authenticated (Workstream C4 — no anonymous sessions).
 * A named user gets their initials; a user whose profile hasn't loaded yet
 * (or has no name set) gets the generic person icon as a temporary fallback.
 *
 * Props:
 *   iconSize {number} – px size for the fallback icon
 */
export default function AvatarContent({ iconSize = 18 }) {
  const { profile } = useAuth();
  const name = profile?.name?.trim();

  // Fallback to person icon while profile is loading or name is unset.
  if (!name) {
    return <UserSingle size={iconSize} stroke="white" strokeWidth={2.25} />;
  }
  return getInitials(name);
}

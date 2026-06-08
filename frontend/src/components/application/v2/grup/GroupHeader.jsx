import ScreenHeader from "../ScreenHeader";

/**
 * GroupHeader — the group-detail sticky header. Thin wrapper over the shared
 * ScreenHeader (title + subtitle) so it uses the same centered-band container
 * as every other v2 navbar.
 */
export default function GroupHeader({ title, sub, onBack }) {
  return <ScreenHeader title={title} sub={sub} onBack={onBack} />;
}

import Avatar from "./Avatar";
import Icon from "./Icon";

export default function ProfileHero({ profile, onEdit }) {
  const name = profile?.full_name || "Pengguna";
  const phone = profile?.phone || "—";
  const email = profile?.email || "—";
  const joined = profile?.joined || "—";

  return (
    <div className="app-card flex items-center gap-4" style={{ padding: 18 }}>
      <Avatar name={name} size="xl" />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 17, color: "var(--ink-1)" }}>{name}</div>
        <div style={{ fontSize: 13, color: "var(--ink-2)", display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="phone" size={12} /> {phone}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="mail" size={12} /> {email}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 6 }}>Bergabung sejak {joined}</div>
      </div>
      <button
        className="app-btn btn-secondary"
        style={{ padding: "8px 12px", fontSize: 12, alignSelf: "flex-start" }}
        onClick={onEdit}
      >
        <Icon name="edit" size={14} /> Edit
      </button>
    </div>
  );
}

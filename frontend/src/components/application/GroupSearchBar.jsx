import Icon from "./Icon";

export default function GroupSearchBar({ value, onChange, placeholder = "Cari grup…" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "var(--gray-soft)", borderRadius: 12,
      padding: "10px 14px", color: "var(--ink-2)",
    }}>
      <Icon name="search" size={16} />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "none", outline: "none", border: "none",
          flex: 1, fontSize: 14, fontFamily: "inherit", color: "var(--ink-1)",
        }}
      />
      {value && (
        <button onClick={() => onChange("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-2)" }}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
}

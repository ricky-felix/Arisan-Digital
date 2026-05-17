import Icon from "./Icon";

export default function RecentActivity({ activities = [], limit }) {
  const shown = limit ? activities.slice(0, limit) : activities;
  return (
    <section>
      <div className="app-section-head">
        <h2>Aktivitas Terbaru</h2>
      </div>
      <div className="app-card" style={{ padding: "4px 16px" }}>
        {shown.map((a, i) => (
          <div className="app-activity" key={i}>
            <div className={`ico ${a.color}`}>
              <Icon name={a.icon} size={16} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                {a.module && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: a.module === "arisan" ? "var(--emerald)" : "var(--lavender-dark)",
                      flexShrink: 0
                    }}
                  />
                )}
                <span>{a.text}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{a.ts}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

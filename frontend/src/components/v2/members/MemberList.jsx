export default function MemberList({ members, onSelect }) {
  return (
    <div className="full-list-section">
      <div className="fl-title">Semua Anggota</div>
      <div className="member-card">
        {members.map((m, i) => (
          <div key={m.initials} className="mem-row" onClick={() => onSelect(i)} role="button" tabIndex={0}
            onKeyDown={e => e.key === "Enter" && onSelect(i)}>
            <div className="mem-av-s" style={{ background: m.color }}>{m.initials}</div>
            <div className="mem-info">
              <div className="mem-name">{m.name}</div>
              <div className="mem-sub">{m.sub}</div>
            </div>
            <span className={`mem-badge ${m.status}`}>
              {m.status === "giliran" ? "Giliran" : m.status === "paid" ? "Lunas" : "Belum"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

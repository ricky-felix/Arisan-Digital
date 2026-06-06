import { Globe, ChevronRight } from "../icons";
import { BADGE, memberSub } from "./data";

/** "Anggota & Status" — per-member payment rows + link to the orbit view. */
export default function MemberStatusList({ members, count, onViewAll }) {
  return (
    <div className="gd-members">
      <div className="gd-section-head">
        <span className="gd-section-title">Anggota &amp; Status</span>
        <span className="gd-section-count">{count} anggota</span>
      </div>

      <div className="gd-member-card">
        {members.map((m) => {
          const badge = BADGE[m.status];
          return (
            <div className="gd-mem-row" key={m.initials}>
              <div className="gd-mem-av" style={{ background: m.color }}>{m.initials}</div>
              <div className="gd-mem-info">
                <div className="gd-mem-name">{m.name}</div>
                <div className="gd-mem-sub">{memberSub(m)}</div>
              </div>
              <span className={`gd-mem-badge ${badge.cls}`}>{badge.label}</span>
            </div>
          );
        })}
      </div>

      <button className="gd-view-members" type="button" onClick={onViewAll}>
        <Globe size={16} stroke="currentColor" strokeWidth={2.5} />
        Lihat anggota dalam orbit
        <ChevronRight size={14} stroke="currentColor" strokeWidth={2.5} />
      </button>
    </div>
  );
}

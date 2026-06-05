import GroupCard from "./GroupCard";

export default function ActiveGroups({ groups = [], onGroupClick, onViewAll, limit }) {
  const shown = limit ? groups.slice(0, limit) : groups;
  return (
    <section>
      <div className="app-section-head">
        <h2>Grup Saya</h2>
        {onViewAll && <a onClick={onViewAll}>Lihat semua →</a>}
      </div>
      <div className="flex flex-col gap-2.5">
        {shown.map(g => (
          <GroupCard key={g.id} group={g} onClick={() => onGroupClick?.(g)} />
        ))}
      </div>
    </section>
  );
}

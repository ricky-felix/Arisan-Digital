import Icon from "../Icon";

export default function CreateJoinButtons({ onBuat, onGabung }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        className="app-btn btn-primary"
        style={{ flexDirection: "column", gap: 6, padding: "16px 12px", height: "auto" }}
        onClick={onBuat}
      >
        <Icon name="plus" size={20} />
        <span style={{ fontSize: 13 }}>Buat Arisan</span>
      </button>
      <button
        className="app-btn btn-secondary"
        style={{ flexDirection: "column", gap: 6, padding: "16px 12px", height: "auto" }}
        onClick={onGabung}
      >
        <Icon name="users" size={20} />
        <span style={{ fontSize: 13 }}>Gabung Arisan</span>
      </button>
    </div>
  );
}

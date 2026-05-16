import Icon from "./Icon";

export default function QuickActions({ onBuat, onBayar, onJadwal, showAnalitik }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button className="app-pill" onClick={onBuat}>
        <span className="ico"><Icon name="plus" size={14} /></span>
        Buat Arisan
      </button>
      <button className="app-pill" onClick={onBayar}>
        <span className="ico violet"><Icon name="wallet" size={14} /></span>
        Bayar Iuran
      </button>
      <button className="app-pill" onClick={onJadwal}>
        <span className="ico amber"><Icon name="calendar" size={14} /></span>
        Lihat Jadwal
      </button>
      {showAnalitik && (
        <button className="app-pill" onClick={() => {}}>
          <span className="ico violet"><Icon name="trending-up" size={14} /></span>
          Lihat Analitik
        </button>
      )}
    </div>
  );
}

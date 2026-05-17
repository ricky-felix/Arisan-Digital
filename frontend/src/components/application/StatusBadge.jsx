const STATUS_MAP = {
  lunas:    { cls: "badge-lunas",    label: "Lunas" },
  terlambat:{ cls: "badge-late",     label: "Terlambat" },
  menunggu: { cls: "badge-pending",  label: "Menunggu" },
  akan:     { cls: "badge-upcoming", label: "Akan Datang" },
  selesai:  { cls: "badge-done",     label: "Selesai" },
  open:     { cls: "badge-open",     label: "Open" },
  settled:  { cls: "badge-settled",  label: "Settled" },
  belum:    { cls: "badge-belum",    label: "Belum Bayar" },
  sebagian: { cls: "badge-sebagian", label: "Sebagian" },
};

export default function StatusBadge({ status, dot = true }) {
  const m = STATUS_MAP[status];
  if (!m) return null;
  return (
    <span className={`app-badge ${m.cls} ${dot ? "dot" : ""}`}>{m.label}</span>
  );
}

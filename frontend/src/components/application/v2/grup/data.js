// ─────────────────────────────────────────────────────────────
// Data + helpers for the Group Detail screen (GroupDetail.jsx).
// Kept separate from the presentational components so the screen is
// data-driven and easy to swap for a real API payload later.
// Member rows themselves come from ../members/data (single source of truth).
// ─────────────────────────────────────────────────────────────

export const GROUP = {
  name: "Keluarga Sari",
  headerSub: "12 anggota · Putaran ke-6 · Rp 200.000/bln",
  status: "Arisan Aktif",
  urgent: "Jatuh tempo 2 hari!",
  title: "Arisan Keluarga Sari",
  emoji: "🏡",
  collectedText: "Terkumpul Rp 1.600.000 dari target Rp 2.400.000",
  memberCount: 12,
  payLabel: "Bayar Iuran Arisanku Rp 200.000",
  payAmount: "Rp 200.000",
};

export const STATS = [
  { val: "8/12",    lbl: "Sudah Bayar" },
  { val: "Rp 200k", lbl: "Per Bulan" },
  { val: "10 Jun",  lbl: "Jatuh Tempo" },
];

export const PROGRESS = {
  label: "Progres Iuran Bulan Ini",
  pct: 67,
  left: "8 dari 12 anggota sudah bayar",
  right: "Sisa Rp 800.000",
};

export const RECIPIENT = {
  initials: "BS",
  label: "Penerima Putaran ke-6",
  name: "Budi Setiawan 🎉",
  sub: "Menunggu semua bayar · 4 belum lunas",
};

// Giliran order is its own sequence (distinct from the member-list order),
// so it lives here rather than being derived from MEMBERS.
export const GILIRAN = [
  { n: 1,  name: "Rina A.",   state: "done" },
  { n: 2,  name: "Dian K.",   state: "done" },
  { n: 3,  name: "Siti N.",   state: "done" },
  { n: 4,  name: "M. Haikal", state: "done" },
  { n: 5,  name: "Kamu 😊",    state: "done" },
  { n: 6,  name: "Budi S. 🎉", state: "current" },
  { n: 7,  name: "Anggi P.",  state: "upcoming" },
  { n: 8,  name: "Yuni P.",   state: "upcoming" },
  { n: 9,  name: "Teguh R.",  state: "upcoming" },
  { n: 10, name: "Lina B.",   state: "upcoming" },
  { n: 11, name: "Karni M.",  state: "upcoming" },
  { n: 12, name: "Nana R.",   state: "upcoming" },
];

// Maps a member's payment status → the pill shown on the right of each row.
export const BADGE = {
  paid:    { cls: "paid",    label: "Lunas" },
  unpaid:  { cls: "unpaid",  label: "Belum" },
  giliran: { cls: "giliran", label: "Giliran!" },
};

// Secondary line under each member name, chosen by status.
export function memberSub(m) {
  if (m.status === "giliran") return "Penerima putaran ke-6 🎉";
  if (m.status === "paid")    return m.sub;
  return m.statusText;
}

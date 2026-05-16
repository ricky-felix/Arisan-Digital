// Existing exports kept for backward compatibility
export const USER = {
  name: "Sari Wulandari",
  avatar: "SW",
  notifications: 3,
  phone: "+62 812-3456-7890",
  email: "sari.wulandari@gmail.com",
  joinDate: "Maret 2024",
};

export const SUMMARY = {
  totalSaved: 6_800_000,
  nextDue: 250_000,
  nextDueDate: "18 Mei 2026",
  nextPayout: 6_000_000,
  nextPayoutDate: "25 Mei 2026",
};

// ── New design-aligned mock data ──────────────────────────────

export const me = {
  name: "Sari Wulandari",
  phone: "+62 812-3456-7890",
  email: "sari.wulandari@gmail.com",
  joined: "Maret 2024",
};

export const groups = [
  {
    id: "kantor",
    name: "Arisan Kantor Lt. 3",
    description: "Arisan rekan kerja kantor pusat",
    amount: 500000,
    frequency: "Bulanan",
    members: 12,
    nextDate: new Date(2026, 4, 25),
    nextRecipient: "Rina Pratiwi",
    status: "menunggu",
    isAdmin: true,
    currentRound: 8,
    totalRounds: 12,
    method: "Undian Acak",
  },
  {
    id: "rt07",
    name: "Ibu-Ibu RT 07",
    description: "Arisan warga blok C",
    amount: 250000,
    frequency: "Mingguan",
    members: 16,
    nextDate: new Date(2026, 4, 18),
    nextRecipient: "Bu Hartini",
    status: "lunas",
    isAdmin: false,
    currentRound: 11,
    totalRounds: 16,
    method: "Manual",
  },
  {
    id: "alumni",
    name: "Alumni SMA Cendana '12",
    description: "Reuni & tabungan tahunan",
    amount: 1000000,
    frequency: "Bulanan",
    members: 10,
    nextDate: new Date(2026, 5, 5),
    nextRecipient: "Bagus Hermawan",
    status: "akan",
    isAdmin: true,
    currentRound: 3,
    totalRounds: 10,
    method: "Manual",
  },
  {
    id: "keluarga",
    name: "Keluarga Besar Suryadi",
    description: "Arisan keluarga, tiap lebaran",
    amount: 750000,
    frequency: "Bulanan",
    members: 8,
    nextDate: new Date(2026, 4, 30),
    nextRecipient: "Tante Yuli",
    status: "menunggu",
    isAdmin: false,
    currentRound: 5,
    totalRounds: 8,
    method: "Undian Acak",
  },
];

export const groupMembers = [
  { name: "Sari Wulandari", order: 1, status: "selesai", isMe: true },
  { name: "Rina Pratiwi",   order: 2, status: "menunggu", isAdmin: false },
  { name: "Bagus Hermawan", order: 3, status: "lunas", isAdmin: true },
  { name: "Dewi Anggraeni", order: 4, status: "lunas" },
  { name: "Adi Setiawan",   order: 5, status: "terlambat" },
  { name: "Maya Lestari",   order: 6, status: "lunas" },
  { name: "Fajar Nugroho",  order: 7, status: "akan" },
  { name: "Indah Permata",  order: 8, status: "akan" },
  { name: "Reza Mahendra",  order: 9, status: "akan" },
  { name: "Putri Wibowo",   order: 10, status: "akan" },
  { name: "Joko Suryanto",  order: 11, status: "akan" },
  { name: "Lina Hartati",   order: 12, status: "akan" },
];

export const gilirans = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(2025, 8 + i, 25);
  const status = i < 7 ? "selesai" : i === 7 ? "menunggu" : "akan";
  return { round: i + 1, recipient: groupMembers[i].name, date, status, isCurrent: i === 7 };
});

export const payments = [
  { id: 1, member: "Adi Setiawan",   round: 8, amount: 500000, date: new Date(2026,4,12), status: "menunggu", hasProof: true },
  { id: 2, member: "Maya Lestari",   round: 8, amount: 500000, date: new Date(2026,4,11), status: "lunas",    hasProof: true },
  { id: 3, member: "Dewi Anggraeni", round: 8, amount: 500000, date: new Date(2026,4,10), status: "lunas",    hasProof: true },
  { id: 4, member: "Sari Wulandari", round: 8, amount: 500000, date: new Date(2026,4,10), status: "lunas",    hasProof: true },
  { id: 5, member: "Fajar Nugroho",  round: 8, amount: 500000, date: new Date(2026,4,9),  status: "menunggu", hasProof: true },
  { id: 6, member: "Indah Permata",  round: 8, amount: 500000, date: new Date(2026,4,8),  status: "terlambat",hasProof: false },
];

export const myBills = [
  { groupId: "rt07",     group: "Ibu-Ibu RT 07",           round: 11, amount: 250000,  due: new Date(2026,4,18), status: "menunggu" },
  { groupId: "alumni",   group: "Alumni SMA Cendana '12",  round: 3,  amount: 1000000, due: new Date(2026,5,5),  status: "akan" },
  { groupId: "keluarga", group: "Keluarga Besar Suryadi",  round: 5,  amount: 750000,  due: new Date(2026,4,30), status: "menunggu" },
];

export const activities = [
  { type: "paid",     text: "Pembayaran Anda untuk Arisan Kantor Lt. 3 ronde 8 telah dikonfirmasi.", ts: "2 jam lalu",      icon: "check-circle", color: "green",  boldPart: "Arisan Kantor Lt. 3" },
  { type: "giliran",  text: "Rina Pratiwi akan menerima giliran di Arisan Kantor Lt. 3.",            ts: "Kemarin, 14:20",  icon: "trophy",       color: "violet", boldPart: "Rina Pratiwi" },
  { type: "bill",     text: "Tagihan baru: Ibu-Ibu RT 07 ronde 11 — Rp 250.000.",                  ts: "Kemarin, 09:00",  icon: "wallet",       color: "amber",  boldPart: "Ibu-Ibu RT 07" },
  { type: "joined",   text: "Lina Hartati bergabung di Arisan Kantor Lt. 3.",                       ts: "2 hari lalu",     icon: "users",        color: "violet", boldPart: "Lina Hartati" },
  { type: "rejected", text: "Bukti pembayaran ronde 7 ditolak. Mohon upload ulang.",                ts: "3 hari lalu",     icon: "alert",        color: "red" },
];

export const notifications = [
  { id: 1, type: "bill",      title: "Tagihan baru — Ibu-Ibu RT 07",    body: "Ronde 11 sebesar Rp 250.000 jatuh tempo 18 Mei 2026.",                    ts: "5 menit lalu",   unread: true,  ico: "wallet",       color: "amber" },
  { id: 2, type: "confirmed", title: "Pembayaran dikonfirmasi",          body: "Arisan Kantor Lt. 3 ronde 8 telah dikonfirmasi admin.",                    ts: "2 jam lalu",     unread: true,  ico: "check-circle", color: "green" },
  { id: 3, type: "giliran",   title: "Giliran baru ditarik 🎉",          body: "Rina Pratiwi mendapat giliran ronde 8 di Arisan Kantor Lt. 3.",           ts: "Kemarin, 14:20", unread: true,  ico: "trophy",       color: "violet" },
  { id: 4, type: "rejected",  title: "Bukti pembayaran ditolak",         body: "Ronde 7 ditolak. Alasan: nominal tidak sesuai.",                          ts: "3 hari lalu",    unread: false, ico: "alert",        color: "red",    reason: "Nominal tidak sesuai" },
  { id: 5, type: "joined",    title: "Anggota baru",                     body: "Lina Hartati bergabung di Arisan Kantor Lt. 3.",                          ts: "3 hari lalu",    unread: false, ico: "users",        color: "violet" },
  { id: 6, type: "giliran",   title: "Pengumuman giliran",               body: "Bu Hartini akan menerima ronde 11 di Ibu-Ibu RT 07.",                     ts: "5 hari lalu",    unread: false, ico: "trophy",       color: "violet" },
];

export const leaderboard = [
  { name: "Dewi Anggraeni", onTime: 7, badge: "Tepat Waktu" },
  { name: "Bagus Hermawan", onTime: 7, badge: "Tepat Waktu" },
  { name: "Sari Wulandari", onTime: 6, badge: "Konsisten" },
  { name: "Maya Lestari",   onTime: 6, badge: "Konsisten" },
  { name: "Rina Pratiwi",   onTime: 5, badge: "Konsisten" },
  { name: "Adi Setiawan",   onTime: 3, badge: "Perlu Diingatkan" },
];

export const paymentTrend = [
  { lbl: "Ronde 3", lunas: 11, late: 1 },
  { lbl: "Ronde 4", lunas: 12, late: 0 },
  { lbl: "Ronde 5", lunas: 10, late: 2 },
  { lbl: "Ronde 6", lunas: 11, late: 1 },
  { lbl: "Ronde 7", lunas: 9,  late: 3 },
  { lbl: "Ronde 8", lunas: 7,  late: 1 },
];

// Keep old exports for backward compatibility
export const GROUPS = groups.map((g, i) => ({ id: i+1, name: g.name, members: g.members, myPosition: 3, totalRounds: g.totalRounds, currentRound: g.currentRound, amount: g.amount, nextDate: g.nextDate.toLocaleDateString("id-ID"), color: "#10b981" }));
export const SCHEDULE = myBills.map((b, i) => ({ id: i+1, group: b.group, date: b.due.toLocaleDateString("id-ID"), type: "bayar", amount: b.amount }));
export const ACTIVITY = activities.slice(0,4).map((a, i) => ({ id: i+1, group: "Arisan Kantor", type: "bayar", amount: 500000, date: "10 Mar 2026", status: "lunas" }));
export const PENDING_PAYMENTS = myBills.map((b, i) => ({ id: i+1, group: b.group, amount: b.amount, dueDate: b.due.toLocaleDateString("id-ID"), color: "#10b981", overdue: false }));
export const PAYMENT_HISTORY = [];
export const PROFILE_STATS = { totalGroups: groups.length, totalSaved: 6800000, monthsActive: 15 };

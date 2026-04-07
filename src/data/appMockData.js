export const USER = {
  name: "Budi Santoso",
  avatar: "BS",
  notifications: 3,
  phone: "+62 812 3456 7890",
  email: "budi.santoso@email.com",
  joinDate: "Januari 2025",
};

export const SUMMARY = {
  totalSaved: 4_500_000,
  nextDue: 500_000,
  nextDueDate: "10 Apr 2026",
  nextPayout: 5_000_000,
  nextPayoutDate: "25 Apr 2026",
};

export const GROUPS = [
  {
    id: 1,
    name: "Arisan Kantor",
    members: 10,
    myPosition: 3,
    totalRounds: 10,
    currentRound: 4,
    amount: 500_000,
    nextDate: "10 Apr 2026",
    color: "#10b981",
  },
  {
    id: 2,
    name: "Arisan Keluarga",
    members: 8,
    myPosition: 7,
    totalRounds: 8,
    currentRound: 2,
    amount: 1_000_000,
    nextDate: "15 Apr 2026",
    color: "#6366f1",
  },
  {
    id: 3,
    name: "Arisan RT 05",
    members: 20,
    myPosition: 12,
    totalRounds: 20,
    currentRound: 5,
    amount: 200_000,
    nextDate: "1 Mei 2026",
    color: "#f59e0b",
  },
];

export const SCHEDULE = [
  { id: 1, group: "Arisan Kantor", date: "10 Apr", type: "bayar", amount: 500_000 },
  { id: 2, group: "Arisan Keluarga", date: "15 Apr", type: "bayar", amount: 1_000_000 },
  { id: 3, group: "Arisan Kantor", date: "10 Mei", type: "terima", amount: 5_000_000 },
];

export const ACTIVITY = [
  { id: 1, group: "Arisan Kantor", type: "bayar", amount: 500_000, date: "10 Mar 2026", status: "lunas" },
  { id: 2, group: "Arisan Keluarga", type: "bayar", amount: 1_000_000, date: "15 Mar 2026", status: "lunas" },
  { id: 3, group: "Arisan RT 05", type: "bayar", amount: 200_000, date: "1 Mar 2026", status: "lunas" },
  { id: 4, group: "Arisan Kantor", type: "terima", amount: 5_000_000, date: "10 Feb 2026", status: "diterima" },
];

export const PENDING_PAYMENTS = [
  { id: 1, group: "Arisan Kantor", amount: 500_000, dueDate: "10 Apr 2026", color: "#10b981", overdue: false },
  { id: 2, group: "Arisan Keluarga", amount: 1_000_000, dueDate: "15 Apr 2026", color: "#6366f1", overdue: false },
  { id: 3, group: "Arisan RT 05", amount: 200_000, dueDate: "1 Apr 2026", color: "#f59e0b", overdue: true },
];

export const PAYMENT_HISTORY = [
  { id: 1, group: "Arisan Kantor", type: "bayar", amount: 500_000, date: "10 Mar 2026", method: "Transfer Bank" },
  { id: 2, group: "Arisan Keluarga", type: "bayar", amount: 1_000_000, date: "15 Mar 2026", method: "Transfer Bank" },
  { id: 3, group: "Arisan RT 05", type: "bayar", amount: 200_000, date: "1 Mar 2026", method: "QRIS" },
  { id: 4, group: "Arisan Kantor", type: "terima", amount: 5_000_000, date: "10 Feb 2026", method: "Transfer Bank" },
  { id: 5, group: "Arisan Kantor", type: "bayar", amount: 500_000, date: "10 Feb 2026", method: "Transfer Bank" },
  { id: 6, group: "Arisan Keluarga", type: "bayar", amount: 1_000_000, date: "15 Jan 2026", method: "QRIS" },
];

export const PROFILE_STATS = {
  totalGroups: 3,
  totalSaved: 4_500_000,
  monthsActive: 15,
};

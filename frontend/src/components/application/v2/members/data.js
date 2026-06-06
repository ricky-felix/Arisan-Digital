export const MEMBERS = [
  { initials: "BS", name: "Budi Setiawan",       status: "giliran", statusText: "Giliran bulan ini!",               sub: "Penerima putaran ke-6 · Rp 200.000", color: "#f59e0b" },
  { initials: "RF", name: "Ricky Felix (Kamu)",  status: "unpaid",  statusText: "Belum bayar — jatuh tempo 2 hari", sub: "Rp 200.000 harus dibayar",          color: "#3b82f6" },
  { initials: "RA", name: "Rina Amalia",         status: "paid",    statusText: "Sudah lunas",                      sub: "Bayar 8 Jun · Transfer BCA",         color: "#8b5cf6" },
  { initials: "DK", name: "Dian Kusuma",         status: "paid",    statusText: "Sudah lunas",                      sub: "Bayar 7 Jun · GoPay",                color: "#f59e0b" },
  { initials: "SN", name: "Siti Nuraini",        status: "paid",    statusText: "Sudah lunas",                      sub: "Bayar 7 Jun · Transfer Mandiri",     color: "#ec4899" },
  { initials: "MH", name: "Muhammad Haikal",     status: "paid",    statusText: "Sudah lunas",                      sub: "Bayar 6 Jun · DANA",                 color: "#6366f1" },
  { initials: "AP", name: "Anggi Pratama",       status: "unpaid",  statusText: "Belum bayar",                      sub: "Ingatkan?",                          color: "#ef4444" },
  { initials: "YP", name: "Yuni Permata",        status: "unpaid",  statusText: "Belum bayar",                      sub: "Ingatkan?",                          color: "#14b8a6" },
  { initials: "TR", name: "Teguh Raharjo",       status: "paid",    statusText: "Sudah lunas",                      sub: "Bayar 5 Jun · OVO",                  color: "#0891b2" },
  { initials: "LB", name: "Lina Budiman",        status: "paid",    statusText: "Sudah lunas",                      sub: "Bayar 5 Jun · Transfer BNI",         color: "#d97706" },
  { initials: "KM", name: "Karni Maharani",      status: "unpaid",  statusText: "Belum bayar",                      sub: "Ingatkan?",                          color: "#7c3aed" },
  { initials: "NR", name: "Nana Rahayu",         status: "paid",    statusText: "Sudah lunas",                      sub: "Bayar 4 Jun · GoPay",                color: "#dc2626" },
];

export const DANCE_PARAMS = [
  { dur: 3.2, delay: 0.0  }, { dur: 3.6, delay: 0.55 },
  { dur: 2.9, delay: 1.1  }, { dur: 3.8, delay: 1.65 },
  { dur: 3.1, delay: 0.3  }, { dur: 3.5, delay: 1.9  },
  { dur: 2.8, delay: 0.8  }, { dur: 3.3, delay: 2.2  },
  { dur: 3.7, delay: 0.45 }, { dur: 3.0, delay: 1.35 },
  { dur: 3.4, delay: 2.4  }, { dur: 2.85,delay: 0.95 },
];

// Mobile defaults — overridden by measured stage dimensions on desktop
export const RADIUS_MOBILE  = 118;
export const RADIUS_DESKTOP = 185;
export const ORBIT_DUR = 32;
export const AV_HALF = 21; // half of 42px avatar

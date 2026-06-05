// Mock invite + group-preview data for the invite/join (undang/gabung) flow.
export const INVITE = {
  code: "KSARI-7Q2X",
  link: "arisan.digital/gabung/KSARI-7Q2X",
  group: {
    name: "Keluarga Sari",
    type: "arisan", // "arisan" | "patungan"
    typeLabel: "Arisan",
    tagline: "Tabungan bergilir keluarga",
    iuran: "Rp 200.000",
    cadence: "/bln",
    members: 12,
    capacity: 15,
    admin: "Ricky Felix",
  },
  joined: [
    { initials: "RF", name: "Ricky Felix", role: "Admin", color: "#10b981" },
    { initials: "BS", name: "Budi Setiawan", role: "Anggota", color: "#f59e0b" },
    { initials: "RA", name: "Rina Amalia", role: "Anggota", color: "#8b5cf6" },
    { initials: "DK", name: "Dian Kusuma", role: "Anggota", color: "#3b82f6" },
    { initials: "SN", name: "Siti Nuraini", role: "Anggota", color: "#ec4899" },
  ],
  pending: 2,
};

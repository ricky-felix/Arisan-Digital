// Static data for the three WalletCard modules on the Dompet screen.
//
// Icons are NOT included here because they are JSX; the page (Dompet.jsx)
// builds icon elements and passes them into <WalletCard> and <PanelRow>.
// Everything else that is pure data lives here.

export const ARISAN_CARD = {
  variant: "arisan",
  label: "Arisan",
  name: "Tabungan Bergilir",
  desc: "3 grup aktif · Rp 400.000/bln total iuran",
  stats: [
    { label: "Grup Aktif",      val: "3",          sub: "12–20 anggota" },
    { label: "Iuran Berikutnya", val: "Rp 200.000", sub: "Arisan Keluarga" },
  ],
  due: {
    text:   "Jatuh tempo dalam 5 hari · 10 Jun",
    amount: "Rp 200.000",
  },
};

export const PATUNGAN_CARD = {
  variant: "patungan",
  label: "Patungan",
  name: "Bagi Pengeluaran",
  desc: "2 tagihan terbuka · Rp 450.000 belum masuk",
  stats: [
    { label: "Tagihan Open", val: "2",          sub: "dari 3 total" },
    { label: "Belum Masuk",  val: "Rp 450.000", sub: "dari orang lain" },
  ],
  due: {
    dotClass: "orange",
    text:   "Hotel Bromo — 3 orang belum bayar",
    amount: "Rp 900.000",
  },
};

export const DOMPET_CARD = {
  variant: "dompet",
  label: "Dompet Grup",
  name: "Saldo Tersimpan",
  desc: "1 dompet aktif · akan dicairkan bulan ini",
  stats: [
    { label: "Total Saldo", val: "Rp 1,6jt", sub: "terkumpul" },
    { label: "Akan Cair",   val: "10 Jun",   sub: "ke Budi S." },
  ],
  due: {
    dotClass: "teal",
    text:   "Keluarga Sari — 8/12 sudah setor",
    amount: "Rp 1.600.000 / 2.400.000",
  },
};

"use client";

import React from "react";

const FEATURES = [
  {
    idx: "01",
    label: "Notifikasi Otomatis",
    title: "Pengingat & update real-time",
    tags: [{ cls: "em", text: "real-time" }],
    desc: "Sistem kirim notifikasi jadwal iuran, giliran penerima, dan pengumuman penting langsung ke HP semua anggota.",
  },
  {
    idx: "02",
    label: "Pencatatan Kontribusi",
    title: "Transparansi pembayaran",
    tags: [
      { cls: "em", text: "arisan" },
      { cls: "lv", text: "patungan" },
    ],
    desc: "Setiap iuran tercatat rapi. Semua anggota lihat siapa sudah bayar — nggak ada lagi “aku udah bayar kok”.",
  },
  {
    idx: "03",
    label: "Pengelolaan Giliran",
    title: "Undian fair & transparan",
    tags: [{ cls: "gd", text: "fair" }],
    desc: "Undian transparan menentukan giliran, atau atur manual sesuai kesepakatan grup. Jadwal jelas untuk semua.",
  },
  {
    idx: "04",
    label: "Chat Group",
    title: "Komunikasi dalam satu app",
    tags: [{ cls: "lv", text: "fokus" }],
    desc: "Obrolan khusus arisan, jadi chat WhatsApp grup nggak berantakan sama urusan arisan.",
  },

  {
    idx: "05",
    label: "Keamanan Data",
    title: "Privasi & proteksi terjamin",
    tags: [{ cls: "em", text: "enkripsi" }],
    desc: "Data dienkripsi dan hanya anggota grup yang bisa akses. Arisan dengan tenang tanpa khawatir bocor.",
  },
];

export function Features() {
  return (
    <section className="block band-dark" id="fitur" aria-labelledby="features-heading">
      <div className="wrap">
        <div className="sec-head left">
          <span className="kicker">Fitur</span>
          <h2 id="features-heading">Semua yang bikin arisan jalan mulus</h2>
          <p>Enam hal inti yang dirancang supaya tiap ronde berjalan tanpa drama.</p>
        </div>
        <div className="rows">
          {FEATURES.map((f) => (
            <div className="row" key={f.idx}>
              <div className="idx">{f.idx}</div>
              <div>
                <div className="lbl">{f.label}</div>
                <h3>{f.title}</h3>
                <div className="tagrow">
                  {f.tags.map((t) => (
                    <span className={`tg ${t.cls}`} key={t.text}>
                      {t.text}
                    </span>
                  ))}
                </div>
              </div>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;

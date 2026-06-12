"use client";

import React from "react";

const PRODUCTS = [
  {
    variant: "arisan",
    tag: "ARISAN",
    title: "Putaran tabungan bersama",
    desc: "Setiap anggota menyetor iuran tetap tiap putaran, dan satu orang menerima giliran — berputar sampai semua kebagian.",
    points: [
      "Undian giliran transparan",
      "Pengingat iuran otomatis",
      "Riwayat lengkap tiap ronde",
    ],
  },
  {
    variant: "patungan",
    tag: "PATUNGAN · BARU",
    title: "Bagi tagihan tanpa hitung manual",
    desc: "Patungan makan, liburan, atau hadiah. Masukkan total sekali, terbagi rata otomatis ke semua peserta.",
    points: [
      "Hitung bagian otomatis",
      "Lacak siapa sudah bayar",
      "Bukti transfer digital",
    ],
  },
];

export function DuaProduk() {
  return (
    <section className="block" id="produk" aria-labelledby="produk-heading">
      <div className="wrap">
        <div className="sec-head">
          <span className="kicker">Dua Produk</span>
          <h2 id="produk-heading">Satu app untuk arisan &amp; patungan</h2>
        </div>
        <div className="dual">
          {PRODUCTS.map((p) => (
            <div className={`pcard ${p.variant}`} key={p.tag}>
              <div className="glow" />
              <span className="tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <ul>
                {p.points.map((point) => (
                  <li key={point}>✓ {point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DuaProduk;

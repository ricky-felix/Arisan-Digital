"use client";

import React from "react";

const STEPS = [
  {
    color: "var(--emerald)",
    title: "Buat grup arisan",
    desc: "Atur nama, iuran per ronde, frekuensi, dan metode giliran. Undang anggota lewat satu link.",
  },
  {
    color: "var(--lavender-dark)",
    title: "Catat setiap kontribusi",
    desc: "Setiap pembayaran tercatat otomatis dan real-time. Semua anggota lihat siapa sudah bayar.",
  },
  {
    color: "var(--gold)",
    title: "Kelola giliran transparan",
    desc: "Undian fair menentukan giliran. Sistem ingatkan setiap anggota otomatis.",
  },
];

export function HowToUse() {
  return (
    <section className="block band-em" id="cara" aria-labelledby="how-to-use-heading">
      <div className="wrap">
        <div className="sec-head">
          <span className="kicker">Tiga Langkah Arisan</span>
          <h2 id="how-to-use-heading">Arisan langsung jalan dalam menit</h2>
          <p>Dari nol sampai grup berjalan lancar dalam hitungan menit.</p>
        </div>
        <div className="steps">
          {STEPS.map((step, i) => (
            <div className="step" key={step.title}>
              <div className="num" style={{ background: step.color }}>
                {i + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowToUse;

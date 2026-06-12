"use client";

import React from "react";

const AUDIENCES = [
  {
    variant: "em",
    who: "Teman",
    heading: "Arisan jadi mudah, transparan, dan aman untuk semua",
    img: "/pictures/teman-kerja.webp",
  },
  {
    variant: "lv",
    who: "Keluarga",
    heading: "Arisan yang bekerja, bukan yang merepotkan",
    img: "/pictures/keluarga.webp",
  },
  {
    variant: "gd",
    who: "Komunitas",
    heading: "Transparansi dalam setiap transaksi arisan",
    img: "/pictures/community.webp",
  },
  {
    variant: "bl",
    who: "Bisnis",
    heading: "Arisan profesional dengan fitur lengkap",
    img: "/pictures/business.webp",
  },
];

export function Demographics() {
  return (
    <section className="block" id="siapa" aria-labelledby="demo-heading">
      <div className="wrap">
        <div className="sec-head">
          <span className="kicker">Untuk Siapa</span>
          <h2 id="demo-heading">Arisan modern untuk semua lingkaranmu</h2>
          <p>
            Satu app yang menyesuaikan — dari nongkrong teman sampai kas
            komunitas dan bisnis.
          </p>
        </div>
        <div className="demo">
          {AUDIENCES.map((a) => (
            <article key={a.who} className={`dcard ${a.variant}`}>
              <img src={a.img} alt={a.who} loading="lazy" />
              <div className="body">
                <span className="who">{a.who}</span>
                <h3>{a.heading}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Demographics;

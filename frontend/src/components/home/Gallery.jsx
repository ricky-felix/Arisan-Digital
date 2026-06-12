"use client";

import React, { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

const SLIDES = [
  { src: "/pictures/app/beranda.png", title: "Beranda", caption: "Iuran & giliran dalam satu kartu" },
  { src: "/pictures/app/buat-arisan.png", title: "Buat Arisan", caption: "Atur grup dalam satu layar" },
  { src: "/pictures/app/buat-patungan.png", title: "Buat Patungan", caption: "Bagi tagihan rata" },
  { src: "/pictures/app/anggota.png", title: "Anggota", caption: "Orbit status pembayaran" },
  { src: "/pictures/app/notifikasi.png", title: "Notifikasi", caption: "Seperti percakapan" },
  { src: "/pictures/app/dompet.png", title: "Dompet", caption: "Rangkuman keuanganmu" },
  { src: "/pictures/app/bukti.png", title: "Bukti Transfer", caption: "Struk digital rapi" },
  { src: "/pictures/app/profil.png", title: "Profil", caption: "Aktivitas & pengaturan" },
];

const SCROLL_STEP = 344; // shot width (320) + gap (24)

export function Gallery() {
  const railRef = useRef(null);
  const [active, setActive] = useState(null);

  const scroll = (dir) => {
    railRef.current?.scrollBy({ left: SCROLL_STEP * dir, behavior: "smooth" });
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <section className="block band-lv" id="galeri" aria-labelledby="gallery-heading">
      <Reveal className="wrap">
        <div className="gal-top reveal-up">
          <div className="sec-head left gal-head">
            <span className="kicker lv">Galeri</span>
            <h2 id="gallery-heading">Lihat WebApp</h2>
            <p>Antarmuka bersih dan mudah digunakan — satu layar, satu aksi.</p>
          </div>
          <div className="gal-arrows">
            <button
              type="button"
              className="gal-arrow"
              onClick={() => scroll(-1)}
              aria-label="Slide sebelumnya"
            >
              ‹
            </button>
            <button
              type="button"
              className="gal-arrow"
              onClick={() => scroll(1)}
              aria-label="Slide berikutnya"
            >
              ›
            </button>
          </div>
        </div>
        <div
          className="rail reveal-up"
          ref={railRef}
          style={{ "--reveal-delay": "0.1s" }}
        >
          {SLIDES.map((slide) => (
            <div className="shot" key={slide.src}>
              <button
                type="button"
                className="shot-img"
                onClick={() => setActive(slide)}
                aria-label={`Perbesar ${slide.title}`}
              >
                <img src={slide.src} alt={slide.title} loading="lazy" />
              </button>
              <div className="cap">
                <b>{slide.title}</b>
                {slide.caption}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {active && (
        <div
          className="gal-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="gal-lightbox-close"
            onClick={() => setActive(null)}
            aria-label="Tutup"
          >
            ×
          </button>
          <figure className="gal-lightbox-fig" onClick={(e) => e.stopPropagation()}>
            <img src={active.src} alt={active.title} />
            <figcaption>
              <b>{active.title}</b>
              {active.caption}
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}

export default Gallery;

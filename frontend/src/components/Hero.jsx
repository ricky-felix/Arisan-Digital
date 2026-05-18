"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./Button";
import { AnimatePresence, motion } from "framer-motion";
import { routes } from "../config";

const TAB_DURATION = 5;

const TABS = [
  {
    value: "tab-one",
    text: "Teman Kerja",
    heading: "Arisan jadi mudah, transparan, dan aman untuk semua",
    description:
      "Kelola putaran tabungan bersama teman dengan satu aplikasi. Tidak ada lagi buku catatan, tidak ada lagi kebingungan.",
    buttons: [
      { title: "Mulai Sekarang", href: routes.login },
      { title: "Pelajari Lebih", variant: "secondary-alt" },
    ],
    image: {
      src: "/pictures/teman-kerja.webp",
      mobileSrc: null,
      alt: "Ilustrasi arisan digital dengan teman kerja - aplikasi yang menampilkan pencatatan otomatis dan transparan",
    },
  },
  {
    value: "tab-two",
    text: "Keluarga",
    heading: "Arisan yang bekerja, bukan yang merepotkan",
    description:
      "Kelola putaran tabungan bersama teman tanpa ribet. Satu aplikasi untuk semua yang kamu butuhkan.",
    buttons: [
      { title: "Unduh Aplikasi", href: routes.login },
      { title: "Lihat Fitur", variant: "secondary-alt" },
    ],
    image: {
      src: "/pictures/keluarga.webp",
      mobileSrc: null,
      alt: "Ilustrasi arisan digital untuk keluarga - manajemen arisan yang mudah dan efisien",
    },
  },
  {
    value: "tab-three",
    text: "Komunitas",
    heading: "Transparansi dalam setiap transaksi arisan",
    description:
      "Catat pembayaran, kelola giliran, dan percayai sistem yang adil untuk semua anggota grup.",
    buttons: [
      { title: "Coba Gratis", href: routes.login },
      { title: "Cara Kerja", variant: "secondary-alt" },
    ],
    image: {
      src: "/pictures/community.webp",
      mobileSrc: null,
      alt: "Ilustrasi sistem transparansi arisan digital untuk komunitas - pencatatan pembayaran dan giliran yang jelas",
    },
  },
  {
    value: "tab-four",
    text: "Bisnis",
    heading: "Arisan modern untuk teman, keluarga, komunitas, dan bisnis anda",
    description:
      "Mulai grup arisan dalam menit, bukan hari. Semua orang tahu posisinya dan kapan harus bayar.",
    buttons: [
      { title: "Daftar Sekarang", href: routes.login },
      { title: "Hubungi Kami", variant: "secondary-alt" },
    ],
    image: {
      src: "/pictures/business.webp",
      mobileSrc: null,
      alt: "Ilustrasi arisan digital untuk bisnis - platform arisan profesional dengan fitur lengkap",
    },
  },
];

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [tickKey, setTickKey] = useState(0);

  const advance = useCallback(() => {
    setActiveIndex((i) => (i + 1) % TABS.length);
    setTickKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const id = setTimeout(advance, TAB_DURATION * 1000);
    return () => clearTimeout(id);
  }, [activeIndex, advance]);

  const handleTabClick = (index) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setTickKey((k) => k + 1);
  };

  const tab = TABS[activeIndex];

  return (
    <section
      id="beranda"
      className="relative h-svh w-full overflow-hidden"
      aria-label="Hero section"
    >
      <div id="main-content" className="sr-only">
        Main content starts here
      </div>

      {/* Crossfade slides — AnimatePresence owns actual motion.div children */}
      <AnimatePresence initial={false}>
        <motion.div
          key={tab.value}
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Background image */}
          <div className="absolute inset-0" role="presentation">
            <picture className="absolute inset-0 h-full w-full overflow-hidden">
              {tab.image.mobileSrc && (
                <source media="(max-width: 640px)" srcSet={tab.image.mobileSrc} />
              )}
              <img
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-h-full min-w-full w-auto h-auto object-cover"
                src={tab.image.src}
                alt={tab.image.alt}
                loading="eager"
                sizes="100vw"
              />
            </picture>
            <div
              className="absolute inset-0 bg-neutral-black/45 sm:bg-neutral-black/50"
              aria-hidden="true"
            />
          </div>

          {/* Text content */}
          <div className="relative z-10 px-4 py-8 pb-24 sm:px-6 sm:py-12 sm:pb-28 md:px-[5%] md:py-16 md:pb-32 lg:py-20">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <h1 className="mb-3 text-2xl font-bold leading-tight text-neutral-white sm:mb-4 sm:text-3xl sm:leading-snug md:mb-5 md:text-5xl lg:text-6xl">
                {tab.heading}
              </h1>
              <p className="text-sm leading-relaxed text-neutral-lighter sm:text-base md:text-lg max-w-xl mx-auto">
                {tab.description}
              </p>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:mt-6 sm:flex-row md:mt-8">
                {tab.buttons.map((button, i) => (
                  <Button key={i} {...button}>
                    {button.title}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Tab triggers */}
      <div
        className="absolute bottom-6 left-0 right-0 top-auto z-20 mx-auto flex justify-center gap-1 px-3 sm:gap-2 sm:px-4 md:bottom-16 md:gap-4 md:px-[5vw] lg:bottom-20 lg:max-w-xl"
        role="tablist"
        aria-label="Pilih kategori arisan"
      >
        {TABS.map((t, index) => (
          <button
            key={t.value}
            onClick={() => handleTabClick(index)}
            className="relative flex-1 whitespace-normal border-0 bg-transparent px-2 py-3 text-center text-xs text-neutral-lighter hover:text-white sm:px-4 sm:py-4 sm:text-sm md:px-8 md:text-base md:min-w-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-black"
            role="tab"
            aria-selected={activeIndex === index}
            aria-label={t.text}
          >
            <span
              className={
                activeIndex === index ? "text-white" : "text-neutral-lighter"
              }
            >
              {t.text}
            </span>
            <div className="absolute inset-0 top-auto h-0.5 w-full bg-neutral-white/20 sm:h-1">
              {activeIndex === index && (
                <motion.div
                  key={tickKey}
                  className="h-full bg-neutral-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: TAB_DURATION, ease: "linear" }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export { Hero as default };

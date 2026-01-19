"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@relume_io/relume-ui";
import { AnimatePresence, motion } from "framer-motion";
import { routes } from "../config";

const TAB_DURATION = 5; // seconds per tab

export const Hero = (props) => {
  const { defaultTabValue, tabs } = {
    ...HeroDefault,
    ...props,
  };

  const [activeTab, setActiveTab] = useState(defaultTabValue);
  const [animationKey, setAnimationKey] = useState(0);

  const getNextTab = useCallback(() => {
    const currentIndex = tabs.trigger.findIndex((t) => t.value === activeTab);
    const nextIndex = (currentIndex + 1) % tabs.trigger.length;
    return tabs.trigger[nextIndex].value;
  }, [activeTab, tabs.trigger]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveTab(getNextTab());
      setAnimationKey((prev) => prev + 1);
    }, TAB_DURATION * 1000);

    return () => clearTimeout(timer);
  }, [activeTab, getNextTab]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <section id="beranda" className="relative h-svh w-full overflow-hidden" aria-label="Hero section">
      <div id="main-content" className="sr-only">Main content starts here</div>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full w-full bg-transparent">
        <AnimatePresence initial={false}>
          {tabs.content.map(
            (content, index) =>
              content.value === activeTab && (
                <TabsContent
                  key={index}
                  value={content.value}
                  className="absolute inset-0 h-full w-full"
                >
                  <TabContent {...content} />
                </TabsContent>
              ),
          )}
        </AnimatePresence>
        <TabsList className="absolute bottom-6 left-0 right-0 top-auto z-20 mx-auto flex justify-center gap-1 px-3 sm:gap-2 sm:px-4 md:bottom-16 md:gap-4 md:px-[5vw] lg:bottom-20 lg:max-w-xl bg-transparent" role="tablist" aria-label="Pilih kategori arisan">
          {tabs.trigger.map((trigger, index) => (
            <TabsTrigger
              key={index}
              value={trigger.value}
              onClick={() => handleTabChange(trigger.value)}
              className="relative flex-1 whitespace-normal border-0 bg-transparent px-2 py-3 text-center text-xs text-neutral-lighter duration-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-black data-[state=active]:bg-transparent data-[state=active]:text-neutral-white hover:text-white hover:bg-white/10 transition-colors sm:px-4 sm:py-4 sm:text-sm md:px-8 md:text-base md:min-w-32"
              role="tab"
              aria-selected={activeTab === trigger.value}
              aria-controls={`tabpanel-${trigger.value}`}
            >
              <span>{trigger.text}</span>
              <div className="absolute inset-0 top-auto h-0.5 w-full bg-neutral-white/20 sm:h-1">
                <motion.div
                  key={`${trigger.value}-${animationKey}`}
                  className="h-full bg-neutral-white"
                  initial={{ width: "0%" }}
                  animate={{ width: activeTab === trigger.value ? "100%" : "0%" }}
                  transition={{
                    duration: activeTab === trigger.value ? TAB_DURATION : 0.3,
                    ease: "linear",
                  }}
                />
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  );
};

const TabContent = ({ ...content }) => {
  return (
    <div className="relative h-svh w-full flex flex-col items-center justify-center">
      {/* Background image */}
      <div className="absolute inset-0 z-0 h-full w-full" role="presentation">
        <picture className="absolute inset-0 h-full w-full overflow-hidden">
          {content.image.mobileSrc && (
            <source media="(max-width: 640px)" srcSet={content.image.mobileSrc} />
          )}
          <img
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-h-full min-w-full w-auto h-auto object-cover"
            src={content.image.src}
            alt={content.image.alt}
            loading="eager"
            sizes="100vw"
          />
        </picture>
        <div className="absolute inset-0 bg-neutral-black/40 sm:bg-neutral-black/50" aria-hidden="true" />
      </div>
      {/* Content */}
      <div className="relative z-10 px-4 py-8 pb-24 sm:px-6 sm:py-12 sm:pb-28 md:px-[5%] md:py-16 md:pb-32 lg:py-20">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ y: "20%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-20%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h1 className="mb-3 text-2xl font-bold leading-tight text-neutral-white sm:mb-4 sm:text-3xl sm:leading-snug md:mb-5 md:text-5xl lg:text-6xl">
            {content.heading}
          </h1>
          <p className="text-sm leading-relaxed text-neutral-lighter sm:text-base md:text-lg max-w-xl mx-auto">{content.description}</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:mt-6 sm:flex-row md:mt-8">
            {content.buttons.map((button, index) => (
              <Button key={index} {...button}>
                {button.title}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const HeroDefault = {
  defaultTabValue: "tab-one",
  tabs: {
    trigger: [
      {
        value: "tab-one",
        text: "Teman Kerja",
      },
      {
        value: "tab-two",
        text: "Keluarga",
      },
      {
        value: "tab-three",
        text: "Komunitas",
      },
      {
        value: "tab-four",
        text: "Bisnis",
      },
    ],
    content: [
      {
        value: "tab-one",
        heading: "Arisan jadi mudah, transparan, dan aman untuk semua",
        description:
          "Kelola putaran tabungan bersama teman dengan satu aplikasi. Tidak ada lagi buku catatan, tidak ada lagi kebingungan.",
        buttons: [{ title: "Mulai Sekarang", href: routes.login }, { title: "Pelajari Lebih", variant: "secondary-alt" }],
        image: {
          src: "/pictures/teman-kerja.webp",
          alt: "Ilustrasi arisan digital dengan teman kerja - aplikasi yang menampilkan pencatatan otomatis dan transparan",
        },
      },
      {
        value: "tab-two",
        heading: "Arisan yang bekerja, bukan yang merepotkan",
        description:
          "Kelola putaran tabungan bersama teman tanpa ribet. Satu aplikasi untuk semua yang kamu butuhkan.",
        buttons: [{ title: "Unduh Aplikasi", href: routes.login }, { title: "Lihat Fitur", variant: "secondary-alt" }],
        image: {
          src: "/pictures/keluarga.webp",
          alt: "Ilustrasi arisan digital untuk keluarga - manajemen arisan yang mudah dan efisien",
        },
      },
      {
        value: "tab-three",
        heading: "Transparansi dalam setiap transaksi arisan",
        description:
          "Catat pembayaran, kelola giliran, dan percayai sistem yang adil untuk semua anggota grup.",
        buttons: [{ title: "Coba Gratis", href: routes.login }, { title: "Cara Kerja", variant: "secondary-alt" }],
        image: {
          src: "/pictures/community.webp",
          alt: "Ilustrasi sistem transparansi arisan digital untuk komunitas - pencatatan pembayaran dan giliran yang jelas",
        },
      },
      {
        value: "tab-four",
        heading: "Arisan modern untuk teman, keluarga, komunitas, dan bisnis anda",
        description:
          "Mulai grup arisan dalam menit, bukan hari. Semua orang tahu posisinya dan kapan harus bayar.",
        buttons: [{ title: "Daftar Sekarang", href: routes.login }, { title: "Hubungi Kami", variant: "secondary-alt" }],
        image: {
          src: "/pictures/business.webp",
          alt: "Ilustrasi arisan digital untuk bisnis - platform arisan profesional dengan fitur lengkap",
        },
      },
    ],
  },
};

export default Hero;

"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@relume_io/relume-ui";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { scrollRevealLeft, scrollRevealRight } from "../utils/animations";

const useCarousel = () => {
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleDotClick = (index) => () => {
    if (api) {
      api.scrollTo(index);
    }
  };

  const dotClassName = (index) => {
    return `mx-[3px] inline-block size-2 rounded-full transition-colors ${
      current === index + 1 ? "bg-text-primary" : "bg-border-primary"
    }`;
  };

  return { api, setApi, current, handleDotClick, dotClassName };
};

const slides = [
  {
    src: "/pictures/app/beranda.png",
    alt: "Dashboard Arisan Digital di tampilan desktop dan mobile, menampilkan ringkasan grup aktif, tagihan, dan tabungan",
  },
  {
    src: "/pictures/app/arisan.png",
    alt: "Daftar grup arisan di desktop dan mobile dengan status ronde, jumlah anggota, dan jadwal berikutnya",
  },
  {
    src: "/pictures/app/bayar.png",
    alt: "Halaman pembayaran di desktop dan mobile untuk mengelola tagihan iuran dan konfirmasi bukti transfer",
  },
  {
    src: "/pictures/app/patungan.png",
    alt: "Fitur bagi tagihan di desktop dan mobile untuk membagi pengeluaran bersama dengan teman",
  },
  {
    src: "/pictures/app/profil.png",
    alt: "Halaman profil dan pengaturan akun di desktop dan mobile dengan kontrol notifikasi dan keamanan",
  },
];

export function Gallery() {
  const carousel = useCarousel();
  return (
    <section id="testimoni" className="overflow-hidden bg-background-primary py-16 md:py-24 lg:py-28" aria-labelledby="gallery-heading">
      <div className="grid auto-cols-fr grid-cols-1 items-center gap-12 md:gap-16 lg:grid-cols-2 lg:gap-0">
        <div className="flex lg:justify-self-end">
          <motion.div className="mx-[5%] w-full max-w-md lg:mb-24 lg:ml-[5vw] lg:mr-20" {...scrollRevealLeft}>
            <h2 id="gallery-heading" className="mb-5 text-5xl font-bold leading-tight text-text-primary md:mb-6 md:text-7xl lg:text-8xl">
              Lihat aplikasi
            </h2>
            <p className="text-base text-text-primary md:text-lg">
              Antarmuka yang bersih dan mudah digunakan di setiap perangkat.
            </p>
          </motion.div>
        </div>
        <motion.div {...scrollRevealRight}>
          <Carousel
          setApi={carousel.setApi}
          opts={{ loop: true, align: "start" }}
          className="overflow-hidden px-[5%] lg:px-0"
        >
          <CarouselContent className="ml-0">
            {slides.map((slide) => (
              <CarouselItem
                key={slide.src}
                className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-4/5"
              >
                <div className="overflow-hidden rounded-lg border border-border-primary">
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-12 flex items-center justify-between">
            <div className="flex gap-2 md:gap-4">
              <CarouselPrevious
                className="static left-0 top-0 size-12 -translate-y-0 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all"
                aria-label="Slide sebelumnya"
              />
              <CarouselNext
                className="static left-0 top-0 size-12 -translate-y-0 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all"
                aria-label="Slide selanjutnya"
              />
            </div>
            <div className="absolute right-[5%] mt-5 flex items-center justify-end md:right-8 lg:right-16" role="tablist" aria-label="Indikator carousel">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={carousel.handleDotClick(index)}
                  className={`${carousel.dotClassName(index)} hover:scale-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all`}
                  aria-label={`Pergi ke slide ${index + 1}`}
                  role="tab"
                  aria-selected={carousel.current === index + 1}
                />
              ))}
            </div>
          </div>
        </Carousel>
        </motion.div>
      </div>
    </section>
  );
}

export default Gallery;

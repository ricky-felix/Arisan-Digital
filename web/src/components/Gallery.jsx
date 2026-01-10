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
            <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-4/5">
              <div>
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  alt="Tampilan dashboard Arisan Digital menampilkan grup aktif dan riwayat pembayaran"
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-4/5">
              <div>
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  alt="Fitur notifikasi otomatis untuk pengingat pembayaran arisan"
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-4/5">
              <div>
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  alt="Pencatatan kontribusi transparan dengan detail pembayaran semua anggota"
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-4/5">
              <div>
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  alt="Sistem pengelolaan giliran arisan yang fair dan transparan"
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-4/5">
              <div>
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  alt="Fitur chat group untuk komunikasi mudah antar anggota arisan"
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-4/5">
              <div>
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  alt="Riwayat arisan lengkap dengan catatan transaksi dan giliran"
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </CarouselItem>
            <CarouselItem className="basis-[95%] pl-0 pr-6 sm:basis-4/5 md:basis-1/2 md:pr-8 lg:basis-4/5">
              <div>
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                  alt="Pengaturan keamanan data dengan enkripsi tingkat bank"
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
            </CarouselItem>
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
              <button
                onClick={carousel.handleDotClick(0)}
                className={`${carousel.dotClassName(0)} hover:scale-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all`}
                aria-label="Pergi ke slide 1"
                role="tab"
                aria-selected={carousel.current === 1}
              />
              <button
                onClick={carousel.handleDotClick(1)}
                className={`${carousel.dotClassName(1)} hover:scale-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all`}
                aria-label="Pergi ke slide 2"
                role="tab"
                aria-selected={carousel.current === 2}
              />
              <button
                onClick={carousel.handleDotClick(2)}
                className={`${carousel.dotClassName(2)} hover:scale-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all`}
                aria-label="Pergi ke slide 3"
                role="tab"
                aria-selected={carousel.current === 3}
              />
              <button
                onClick={carousel.handleDotClick(3)}
                className={`${carousel.dotClassName(3)} hover:scale-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all`}
                aria-label="Pergi ke slide 4"
                role="tab"
                aria-selected={carousel.current === 4}
              />
              <button
                onClick={carousel.handleDotClick(4)}
                className={`${carousel.dotClassName(4)} hover:scale-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all`}
                aria-label="Pergi ke slide 5"
                role="tab"
                aria-selected={carousel.current === 5}
              />
              <button
                onClick={carousel.handleDotClick(5)}
                className={`${carousel.dotClassName(5)} hover:scale-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all`}
                aria-label="Pergi ke slide 6"
                role="tab"
                aria-selected={carousel.current === 6}
              />
              <button
                onClick={carousel.handleDotClick(6)}
                className={`${carousel.dotClassName(6)} hover:scale-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 transition-all`}
                aria-label="Pergi ke slide 7"
                role="tab"
                aria-selected={carousel.current === 7}
              />
            </div>
          </div>
        </Carousel>
        </motion.div>
      </div>
    </section>
  );
}

export default Gallery;

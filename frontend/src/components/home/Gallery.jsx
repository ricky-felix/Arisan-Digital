"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@relume_io/relume-ui";
import React, { useEffect, useState } from "react";
import { Reveal } from "./Reveal";

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
    src: "/pictures/app/beranda-kosong.png",
    alt: "Beranda Arisan Digital: satu kartu fokus menampilkan iuran berikutnya, giliran penerima, dan tombol bayar langsung",
    title: "Beranda",
    caption:
      "Satu kartu fokus menampilkan iuran berikutnya, siapa yang dapat giliran, dan tombol bayar langsung. Geser untuk berpindah antar grup arisan dan tagihan patungan.",
  },
  {
    src: "/pictures/app/buat-arisan.png",
    alt: "Buat Arisan: form pengaturan nama grup, iuran per ronde, frekuensi, metode giliran, dan tanggal mulai",
    title: "Buat Arisan",
    caption:
      "Atur arisan baru dalam satu layar — nama grup, iuran per ronde, frekuensi, metode giliran, dan tanggal mulai. Anggota tinggal bergabung lewat link undangan.",
  },
  {
    src: "/pictures/app/buat-patungan.png",
    alt: "Buat Patungan: form judul, kategori, dan total tagihan yang dibagi rata ke peserta",
    title: "Buat Patungan",
    caption:
      "Bagi pengeluaran bersama: isi judul, kategori, dan total tagihan, lalu biarkan terbagi rata ke setiap peserta yang bergabung lewat link.",
  },
  {
    src: "/pictures/app/dompet.png",
    alt: "Dompet Saya: kartu Arisan, Patungan, dan dompet grup yang bisa dibuka untuk melihat rincian aktivitas",
    title: "Dompet Saya",
    caption:
      "Rangkuman Arisan, Patungan, dan dompet grup dalam kartu yang bisa dibuka untuk melihat rincian setiap aktivitas keuanganmu.",
  },
  {
    src: "/pictures/app/anggota.png",
    alt: "Anggota grup arisan dalam tampilan orbit melingkar dengan status pembayaran tiap anggota dan giliran penerima",
    title: "Anggota Grup",
    caption:
      "Lihat anggota grup arisan dalam satu orbit melingkar. Warna menandai siapa yang sudah bayar, belum bayar, dan siapa yang dapat giliran bulan ini.",
  },
  {
    src: "/pictures/app/notifikasi.png",
    alt: "Notifikasi berbentuk percakapan: kabar masuk di kiri, hal yang perlu kamu tindak di kanan dengan aksi langsung",
    title: "Notifikasi",
    caption:
      "Notifikasi tampil seperti percakapan — kabar masuk di kiri, hal yang perlu kamu tindak di kanan. Bayar atau ingatkan teman langsung tanpa pindah halaman.",
  },
  {
    src: "/pictures/app/bukti.png",
    alt: "Bukti Transfer: struk digital pembayaran dengan rincian pengirim, penerima, jumlah, dan status berhasil untuk dibagikan ke grup",
    title: "Bukti Transfer",
    caption:
      "Setiap pembayaran menghasilkan struk digital rapi — rincian pengirim, penerima, jumlah, dan status — yang bisa langsung dibagikan ke grup atau disimpan sebagai gambar.",
  },
  {
    src: "/pictures/app/profil.png",
    alt: "Halaman profil dengan ringkasan aktivitas serta pengaturan akun, pembayaran, dan keamanan",
    title: "Profil",
    caption:
      "Ringkasan aktivitasmu beserta pengaturan akun, metode pembayaran, keamanan, dan notifikasi dalam satu halaman.",
  },
];

export function Gallery() {
  const carousel = useCarousel();
  return (
    <section id="testimoni" className="overflow-hidden bg-background-primary py-16 md:py-24 lg:py-28" aria-labelledby="gallery-heading">
      <Reveal className="grid auto-cols-fr grid-cols-1 items-center gap-12 md:gap-16 lg:grid-cols-2 lg:gap-0">
        <div className="flex lg:justify-self-end">
          <div className="reveal-left mx-[5%] w-full max-w-md lg:mb-24 lg:ml-[5vw] lg:mr-20">
            <h2 id="gallery-heading" className="mb-5 text-5xl font-bold leading-tight text-text-primary md:mb-6 md:text-7xl lg:text-8xl">
              Lihat WebApp
            </h2>
            <p className="text-base text-text-primary md:text-lg">
              Antarmuka yang bersih dan mudah digunakan di setiap perangkat.
            </p>
          </div>
        </div>
        <div className="reveal-right" style={{ "--reveal-delay": "0.1s" }}>
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
                <div className="mt-4">
                  <h3 className="text-base font-semibold text-text-primary md:text-lg">{slide.title}</h3>
                  <p className="mt-1 text-sm text-text-primary/80 md:text-base">{slide.caption}</p>
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
        </div>
      </Reveal>
    </section>
  );
}

export default Gallery;

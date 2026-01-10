"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@relume_io/relume-ui";
import { Button } from "./Button";
import React from "react";
import { RxPlus } from "react-icons/rx";

export function FAQs() {
  return (
    <section id="faq" className="bg-background-primary px-[5%] py-16 md:py-24 lg:py-28" aria-labelledby="faq-heading">
      <div className="container mx-auto">
        <div className="mb-12 md:mb-16 lg:mb-20">
          <div className="mx-auto w-full max-w-lg text-center">
            <h2 id="faq-heading" className="mb-5 text-5xl font-bold leading-tight text-text-primary md:mb-6 md:text-7xl lg:text-8xl">
              Tanya Jawab
            </h2>
            <p className="text-base text-text-primary md:text-lg">
              Jawaban untuk pertanyaan umum tentang Arisan Digital dan cara
              kerjanya.
            </p>
          </div>
        </div>
        <Accordion
          type="multiple"
          className="grid w-full grid-cols-1 items-start gap-x-8 gap-y-4 md:grid-cols-2"
        >
          <AccordionItem
            value="item-faq-1"
            className="border border-border-primary bg-background-primary px-5 md:px-6"
          >
            <AccordionTrigger
              className="text-text-primary md:py-5 md:text-lg [&[data-state=open]>svg]:rotate-45"
              icon={
                <RxPlus className="size-7 shrink-0 text-text-primary transition-transform duration-300 md:size-8" />
              }
            >
              Apakah data saya aman?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Kami mengenkripsi semua transaksi dan data pribadi dengan standar
              keamanan bank. Setiap pembayaran tercatat dan tidak bisa diubah
              setelah dikonfirmasi, memberikan catatan permanen yang jelas untuk
              semua anggota.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-faq-2"
            className="border border-border-primary bg-background-primary px-5 md:px-6"
          >
            <AccordionTrigger
              className="text-text-primary md:py-5 md:text-lg [&[data-state=open]>svg]:rotate-45"
              icon={
                <RxPlus className="size-7 shrink-0 text-text-primary transition-transform duration-300 md:size-8" />
              }
            >
              Berapa biaya penggunaan?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Arisan Digital sepenuhnya gratis untuk diunduh dan digunakan. Tidak ada biaya
              tersembunyi atau komisi dari setiap transaksi anggota. Kami tidak mengambil
              potongan dari uang yang beredar dalam grup Anda.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-faq-3"
            className="border border-border-primary bg-background-primary px-5 md:px-6"
          >
            <AccordionTrigger
              className="text-text-primary md:py-5 md:text-lg [&[data-state=open]>svg]:rotate-45"
              icon={
                <RxPlus className="size-7 shrink-0 text-text-primary transition-transform duration-300 md:size-8" />
              }
            >
              Berapa anggota maksimal dalam satu grup?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Grup arisan bisa memiliki hingga 50 anggota. Sistem kami dirancang
              untuk menangani kelompok besar dengan mudah. Tidak peduli ukuran grup,
              performa tetap cepat dan responsif di semua perangkat.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-faq-4"
            className="border border-border-primary bg-background-primary px-5 md:px-6"
          >
            <AccordionTrigger
              className="text-text-primary md:py-5 md:text-lg [&[data-state=open]>svg]:rotate-45"
              icon={
                <RxPlus className="size-7 shrink-0 text-text-primary transition-transform duration-300 md:size-8" />
              }
            >
              Bagaimana jika ada anggota tidak bayar?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Aplikasi mengirim pengingat otomatis sebelum tenggat waktu pembayaran.
              Admin grup bisa melihat status pembayaran real-time dan menghubungi
              anggota yang belum membayar langsung melalui fitur chat internal.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-faq-5"
            className="border border-border-primary bg-background-primary px-5 md:px-6"
          >
            <AccordionTrigger
              className="text-text-primary md:py-5 md:text-lg [&[data-state=open]>svg]:rotate-45"
              icon={
                <RxPlus className="size-7 shrink-0 text-text-primary transition-transform duration-300 md:size-8" />
              }
            >
              Bisa digunakan tanpa internet?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Arisan Digital memerlukan koneksi internet untuk sinkronisasi
              data antar anggota. Namun aplikasi dirancang ringan dan bekerja lancar
              bahkan dengan koneksi 3G atau jaringan yang lambat sekalipun.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-faq-6"
            className="border border-border-primary bg-background-primary px-5 md:px-6"
          >
            <AccordionTrigger
              className="text-text-primary md:py-5 md:text-lg [&[data-state=open]>svg]:rotate-45"
              icon={
                <RxPlus className="size-7 shrink-0 text-text-primary transition-transform duration-300 md:size-8" />
              }
            >
              Bagaimana cara menghubungi tim dukungan?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Tim dukungan kami siap membantu Anda kapan saja melalui email, chat
              dalam aplikasi, atau WhatsApp. Kami biasanya merespons dalam waktu
              kurang dari 24 jam untuk bantuan lebih lanjut.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mx-auto mt-12 max-w-md text-center md:mt-16 lg:mt-20">
          <h3 className="mb-3 text-2xl font-bold text-text-primary md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
            Masih ada pertanyaan?
          </h3>
          <p className="text-base text-text-primary md:text-lg">
            Butuh bantuan lebih lanjut dari tim kami?
          </p>
          <div className="mt-6 md:mt-8">
            <Button
              title="Hubungi"
              variant="secondary"
              className="hover:scale-105 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
              aria-label="Hubungi tim dukungan kami"
            >
              Hubungi
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQs;

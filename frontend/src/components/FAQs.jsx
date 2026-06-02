"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@relume_io/relume-ui";
import { Button } from "./Button";
import React from "react";
import { motion } from "framer-motion";
import { RxPlus } from "react-icons/rx";

export function FAQs() {
  return (
    <section id="faq" className="bg-background-primary px-[5%] py-16 md:py-24 lg:py-28" aria-labelledby="faq-heading">
      <div className="container mx-auto">
        <motion.div
          className="mb-12 md:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        >
          <div className="mx-auto w-full max-w-lg text-center">
            <h2 id="faq-heading" className="mb-5 text-5xl font-bold leading-tight text-text-primary md:mb-6 md:text-7xl lg:text-8xl">
              Tanya Jawab
            </h2>
            <p className="text-base text-text-primary md:text-lg">
              Jawaban untuk pertanyaan umum tentang Arisan Digital dan cara
              kerjanya.
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.1 }}
        >
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
              Apa itu Arisan Digital dan bagaimana cara kerjanya?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Arisan Digital adalah aplikasi untuk mengelola arisan secara online.
              Anda membuat grup, mengundang anggota, dan menentukan jumlah iuran
              serta jadwal putaran. Setiap periode aplikasi mencatat pembayaran,
              menentukan pemenang giliran, dan menyalurkan dana secara otomatis,
              jadi tidak perlu lagi catatan manual atau uang tunai.
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
              Bagaimana cara memulai grup arisan?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Cukup unduh aplikasi, buat grup baru, lalu atur nominal iuran,
              periode putaran, dan metode pemilihan giliran. Setelah itu bagikan
              tautan undangan ke anggota Anda. Grup siap berjalan dalam hitungan
              menit tanpa proses yang rumit.
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
              Bagaimana giliran ditentukan agar adil?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Anda bisa memilih undian acak yang transparan atau urutan giliran
              yang sudah disepakati bersama. Setiap hasil undian tercatat dan dapat
              dilihat semua anggota, sehingga prosesnya jujur, terbuka, dan bebas
              dari kecurangan.
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
              Apakah data dan uang saya aman?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Kami mengenkripsi semua transaksi dan data pribadi dengan standar
              keamanan perbankan. Setiap pembayaran tercatat dan tidak bisa diubah
              setelah dikonfirmasi, memberikan catatan permanen yang jelas dan
              transparan untuk semua anggota.
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
              Bagaimana jika ada anggota yang menunggak?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Aplikasi mengirim pengingat otomatis sebelum tenggat pembayaran.
              Admin grup dapat memantau status pembayaran secara real-time dan
              menghubungi anggota yang belum membayar langsung melalui chat dalam
              aplikasi, sehingga putaran tetap berjalan lancar.
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
              Bagaimana cara menerima dana saat giliran saya?
            </AccordionTrigger>
            <AccordionContent className="text-text-primary md:pb-6">
              Ketika giliran Anda tiba, dana akan otomatis tersedia di aplikasi
              dan dapat dicairkan ke rekening bank atau e-wallet Anda. Prosesnya
              cepat, dan Anda akan menerima notifikasi di setiap tahap pencairan.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-faq-7"
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
              Untuk saat ini, Arisan Digital sepenuhnya gratis untuk diunduh dan
              digunakan. Tidak ada biaya sama sekali, tidak ada biaya tersembunyi,
              dan kami tidak mengambil komisi atau potongan apa pun dari uang yang
              beredar dalam grup Anda.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            value="item-faq-8"
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
              Tim dukungan kami siap membantu kapan saja melalui email di{" "}
              <a
                href="mailto:arisandigital@outlook.com"
                className="font-semibold underline underline-offset-2"
              >
                arisandigital@outlook.com
              </a>
              . Kami biasanya merespons dalam waktu kurang dari 24 jam untuk
              membantu menyelesaikan kendala Anda. Layanan dukungan via telepon
              belum tersedia untuk saat ini.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </motion.div>
        <motion.div
          className="mx-auto mt-12 max-w-md text-center md:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1], delay: 0.15 }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}

export default FAQs;

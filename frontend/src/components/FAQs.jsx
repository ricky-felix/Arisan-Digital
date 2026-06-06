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
import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "Apa itu Arisan Digital dan bagaimana cara kerjanya?",
    a: (
      <>
        Arisan Digital adalah aplikasi untuk mengoordinasi <strong>arisan</strong>{" "}
        (tabungan bergilir) dan <strong>patungan</strong> (bagi tagihan) bersama
        teman, keluarga, atau rekan. Kamu membuat grup atau tagihan, mengundang
        anggota lewat link, dan aplikasi mencatat siapa yang sudah bayar,
        menghitung giliran, serta mengirim pengingat otomatis — menggantikan grup
        WhatsApp dan catatan manual yang berantakan. Berbasis web, jadi tidak
        perlu unduh aplikasi atau daftar akun untuk mulai.
      </>
    ),
  },
  {
    q: "Apa bedanya Arisan dan Patungan?",
    a: (
      <>
        <strong>Arisan</strong> adalah tabungan bergilir: setiap anggota menyetor
        iuran tetap tiap putaran, dan setiap putaran satu orang mendapat giliran
        menerima seluruh dana — berputar sampai semua kebagian.{" "}
        <strong>Patungan</strong> adalah membagi satu tagihan bersama (misalnya
        trip, hotel, atau tiket konser) ke beberapa orang dan melacak siapa yang
        sudah membayar bagiannya.
      </>
    ),
  },
  {
    q: "Bagaimana cara memulai dan mengundang anggota?",
    a: (
      <>
        Buat grup arisan atau tagihan patungan, atur nominal iuran/total, lalu
        bagikan <strong>link undangan</strong> atau QR ke anggotamu. Mereka cukup
        membuka link, memasukkan nama, dan langsung bergabung — tanpa perlu
        mendaftar akun. Grup siap berjalan dalam hitungan menit.
      </>
    ),
  },
  {
    q: "Apakah aplikasi menyimpan uang saya — dan apakah aman?",
    a: (
      <>
        Tidak. Arisan Digital adalah <strong>lapisan koordinasi & kepercayaan</strong>,
        bukan dompet digital. Uangmu tidak pernah mampir di aplikasi — pembayaran
        dilakukan langsung antar anggota lewat transfer bank atau e-wallet (GoPay,
        OVO, DANA, dan lainnya). Kami hanya mencatat, mengingatkan, dan menjaga
        transparansi. Data dan catatan pembayaran dienkripsi dan tidak bisa diubah
        setelah dikonfirmasi, sehingga semua anggota punya catatan yang jelas.
      </>
    ),
  },
  {
    q: "Apa itu Bukti Transfer dan bagaimana mengonfirmasi pembayaran?",
    a: (
      <>
        Setelah mentransfer, anggota menandai pembayaran sebagai lunas dan dapat
        membuat <strong>Bukti Transfer</strong> — struk digital rapi berisi
        pengirim, penerima, jumlah, dan status — yang langsung bisa dibagikan ke
        grup atau disimpan sebagai gambar. Semua tercatat dan terlihat oleh seluruh
        anggota, jadi tidak ada lagi tangkapan layar yang tersebar di mana-mana.
      </>
    ),
  },
  {
    q: "Bagaimana giliran ditentukan agar adil?",
    a: (
      <>
        Saat membuat arisan kamu bisa memilih <strong>undian acak</strong> yang
        transparan atau <strong>urutan giliran</strong> yang sudah disepakati
        bersama. Hasilnya tercatat dan dapat dilihat semua anggota, sehingga
        prosesnya jujur, terbuka, dan bebas dari kecurangan.
      </>
    ),
  },
  {
    q: "Bagaimana jika ada anggota yang telat bayar?",
    a: (
      <>
        Aplikasi mengirim pengingat otomatis sebelum jatuh tempo. Admin grup dapat
        memantau status pembayaran secara langsung dan mengingatkan anggota yang
        belum membayar hanya dengan satu ketukan, sehingga putaran tetap berjalan
        lancar tanpa harus menagih satu per satu.
      </>
    ),
  },
  {
    q: "Berapa biaya penggunaannya?",
    a: (
      <>
        Arisan Digital gratis untuk mulai dan untuk kebutuhan sehari-hari. Karena
        uang ditransfer langsung antar anggota, kami <strong>tidak pernah memotong
        komisi</strong> dari dana grupmu. Ke depan akan ada paket premium opsional
        untuk grup yang lebih besar dan butuh fitur lanjutan, namun fitur inti
        tetap bisa dipakai gratis.
      </>
    ),
  },
  {
    q: "Bagaimana cara menghubungi tim dukungan?",
    a: (
      <>
        Tim dukungan kami siap membantu melalui email di{" "}
        <a
          href="mailto:arisandigital@outlook.com"
          className="font-semibold underline underline-offset-2"
        >
          arisandigital@outlook.com
        </a>
        . Kami biasanya merespons dalam waktu kurang dari 24 jam. Layanan dukungan
        via telepon belum tersedia untuk saat ini.
      </>
    ),
  },
];

export function FAQs() {
  return (
    <section id="faq" className="bg-background-primary px-[5%] py-16 md:py-24 lg:py-28" aria-labelledby="faq-heading">
      <Reveal className="container mx-auto">
        <div className="reveal-up mb-12 md:mb-16 lg:mb-20">
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
        <div className="reveal-up" style={{ "--reveal-delay": "0.1s" }}>
        <Accordion
          type="multiple"
          className="grid w-full grid-cols-1 items-start gap-x-8 gap-y-4 md:grid-cols-2"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-faq-${index + 1}`}
              className="border border-border-primary bg-background-primary px-5 md:px-6"
            >
              <AccordionTrigger
                className="text-text-primary md:py-5 md:text-lg [&[data-state=open]>svg]:rotate-45"
                icon={
                  <RxPlus className="size-7 shrink-0 text-text-primary transition-transform duration-300 md:size-8" />
                }
              >
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-text-primary md:pb-6">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        </div>
        <div
          className="reveal-up mx-auto mt-12 max-w-md text-center md:mt-16 lg:mt-20"
          style={{ "--reveal-delay": "0.2s" }}
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
        </div>
      </Reveal>
    </section>
  );
}

export default FAQs;

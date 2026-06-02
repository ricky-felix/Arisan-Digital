"use client";

import { Button } from "./Button";
import React from "react";
import { motion } from "framer-motion";
import { BiReceipt, BiGroup, BiWallet } from "react-icons/bi";
import { RxCheck } from "react-icons/rx";
import {
  scrollReveal,
  scrollRevealLeft,
  scrollRevealRight,
  staggerContainer,
  staggerItem,
  buttonHover,
  buttonTap,
} from "../utils/animations";

const splitCards = [
  {
    icon: BiReceipt,
    title: "Bagi tagihan otomatis",
    description:
      "Masukkan total tagihan sekali, dan aplikasi langsung menghitung bagian setiap orang. Bisa dibagi rata atau sesuai porsi masing-masing.",
  },
  {
    icon: BiGroup,
    title: "Patungan bareng teman",
    description:
      "Mau patungan makan, liburan, atau hadiah? Buat tagihan bersama, undang teman, dan semua tahu persis berapa yang harus dibayar.",
  },
  {
    icon: BiWallet,
    title: "Lacak siapa sudah bayar",
    description:
      "Pantau status pembayaran secara real-time. Pengingat otomatis dikirim ke yang belum bayar, jadi nggak perlu nagih satu-satu.",
  },
];

export function BillSplitting() {
  return (
    <section
      id="bagi-tagihan"
      className="bg-background-primary px-[5%] py-16 md:py-24 lg:py-28"
      aria-labelledby="bill-splitting-heading"
    >
      <div className="container mx-auto">
        <div className="mb-12 grid grid-cols-1 items-start gap-x-12 gap-y-8 md:mb-16 md:grid-cols-2 lg:mb-20 lg:gap-x-20">
          <motion.div {...scrollRevealLeft}>
            <span className="mb-4 inline-block rounded-full bg-[#7c5cfc] px-4 py-1 text-sm font-semibold text-white">
              Baru
            </span>
            <h2
              id="bill-splitting-heading"
              className="text-5xl font-bold leading-tight text-text-primary md:text-7xl lg:text-8xl"
            >
              Sekarang bisa bagi tagihan
            </h2>
          </motion.div>
          <motion.div {...scrollRevealRight}>
            <p className="mb-6 text-base text-text-primary md:text-lg">
              Selain mengelola arisan, Arisan Digital kini hadir dengan fitur
              bagi tagihan. Patungan makan bareng, split biaya liburan, atau bagi
              ongkos bersama jadi gampang dan adil tanpa ribet hitung manual.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                <Button
                  variant="primary"
                  href="#fitur"
                  aria-label="Lihat fitur Arisan Digital"
                >
                  Lihat Fitur
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
        >
          {splitCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={staggerItem}
                className="flex flex-col items-start rounded-lg border border-border-primary bg-background-primary p-6 md:p-8"
              >
                <div className="mb-5 flex size-14 items-center justify-center rounded-lg bg-[#ad8cf8] text-white">
                  <Icon className="size-7" aria-hidden="true" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-text-primary md:text-2xl">
                  {card.title}
                </h3>
                <p className="text-base text-text-primary">{card.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          {...scrollReveal}
          className="mx-auto mt-12 max-w-3xl rounded-lg border border-border-primary bg-[#10b981] p-8 md:mt-16 md:p-10"
        >
          <p className="mb-4 text-lg font-semibold text-white md:text-xl">
            Kenapa pakai fitur bagi tagihan?
          </p>
          <ul className="space-y-3">
            {[
              "Perhitungan otomatis dan akurat, bebas dari salah hitung.",
              "Transparan, setiap orang tahu rincian bagiannya.",
              "Terintegrasi dengan pencatatan dan pengingat pembayaran.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-white">
                <RxCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span className="text-base md:text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

export default BillSplitting;

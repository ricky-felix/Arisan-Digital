"use client";

import { Button } from "./Button";
import React from "react";
import { motion } from "framer-motion";
import { scrollRevealLeft, scrollRevealRight, scrollRevealScale, buttonHover, buttonTap } from "../utils/animations";

export function ProblemStatement() {
  return (
    <section id="pelajari" className="bg-[#10b981] px-[5%] py-16 md:py-24 lg:py-28" aria-labelledby="problem-heading">
      <div className="container mx-auto">
        <div className="mb-12 grid grid-cols-1 items-start justify-between gap-x-12 gap-y-8 md:mb-16 md:grid-cols-2 md:gap-x-12 lg:mb-20 lg:gap-x-20">
          <motion.div {...scrollRevealLeft}>
            <p className="mb-3 font-semibold text-white md:mb-4">Masalah</p>
            <h2 id="problem-heading" className="text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
              Arisan tradisional butuh solusi modern
            </h2>
          </motion.div>
          <motion.div {...scrollRevealRight}>
            <p className="mb-5 text-base text-white md:mb-6 md:text-lg">
              Buku catatan hilang, giliran terlewat, uang tidak terhitung.
              Arisan membutuhkan cara yang lebih baik untuk mengelola
              kepercayaan dan transparansi antar anggota.
            </p>
            <ul className="my-6 list-disc space-y-2 pl-5 text-white marker:text-text-secondary">
              <li className="pl-2">
                <p>Pencatatan manual sering kali tidak akurat</p>
              </li>
              <li className="pl-2">
                <p>Koordinasi giliran menjadi rumit dan membingungkan</p>
              </li>
              <li className="pl-2">
                <p>Tidak ada bukti transaksi yang jelas dan aman</p>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                <Button
                  title="Download Sekarang"
                  variant="secondary"
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10b981]"
                  aria-label="Download aplikasi Arisan Digital sekarang"
                >
                  Download Sekarang
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
        <motion.img
          {...scrollRevealScale}
          src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg"
          className="w-full rounded-lg object-cover"
          alt="Ilustrasi permasalahan arisan tradisional"
        />
      </div>
    </section>
  );
}

export default ProblemStatement;

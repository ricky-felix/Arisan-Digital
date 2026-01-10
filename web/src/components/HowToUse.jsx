"use client";

import React from "react";
import { motion } from "framer-motion";
import { scrollReveal, staggerContainer, staggerItem, cardHover } from "../utils/animations";

export function HowToUse() {
  return (
    <section id="cara-kerja" className="bg-background-primary px-[5%] py-16 md:py-24 lg:py-28" aria-labelledby="how-to-use-heading">
      <div className="container mx-auto">
        <motion.div
          className="mx-auto mb-12 w-full max-w-lg text-center md:mb-16 lg:mb-20"
          {...scrollReveal}
        >
          <p className="mb-3 font-semibold text-text-primary md:mb-4">Langkah</p>
          <h2 id="how-to-use-heading" className="mb-5 text-5xl font-bold leading-tight text-text-primary md:mb-6 md:text-7xl lg:text-8xl">
            Tiga langkah sederhana
          </h2>
          <p className="text-base text-text-primary md:text-lg">
            Mulai dari nol hingga arisan yang berjalan lancar dalam hitungan
            menit.
          </p>
        </motion.div>
        <motion.div
          className="grid auto-cols-fr grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            className="flex flex-col border border-border-primary bg-background-primary"
            variants={staggerItem}
            whileHover={cardHover}
          >
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <div>
                <p className="mb-2 font-semibold text-text-secondary">Pertama</p>
                <h3 className="mb-3 text-2xl font-bold text-text-primary md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Buat grup arisan
                </h3>
                <p className="text-text-primary">Undang teman dan atur jumlah kontribusi bulanan</p>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center self-start">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Ilustrasi membuat grup arisan"
              />
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col border border-border-primary bg-background-primary"
            variants={staggerItem}
            whileHover={cardHover}
          >
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <div>
                <p className="mb-2 font-semibold text-text-secondary">Kedua</p>
                <h3 className="mb-3 text-2xl font-bold text-text-primary md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Catat setiap kontribusi
                </h3>
                <p className="text-text-primary">Aplikasi mencatat otomatis setiap pembayaran anggota</p>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center self-start">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Ilustrasi pencatatan kontribusi"
              />
            </div>
          </motion.div>
          <motion.div
            className="flex flex-col border border-border-primary bg-background-primary"
            variants={staggerItem}
            whileHover={cardHover}
          >
            <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
              <div>
                <p className="mb-2 font-semibold text-text-secondary">Ketiga</p>
                <h3 className="mb-3 text-2xl font-bold text-text-primary md:mb-4 md:text-3xl md:leading-[1.3] lg:text-4xl">
                  Kelola giliran dengan transparan
                </h3>
                <p className="text-text-primary">
                  Sistem otomatis menentukan giliran dan mengingatkan setiap
                  anggota
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center self-start">
              <img
                src="https://d22po4pjz3o32e.cloudfront.net/placeholder-image.svg"
                alt="Ilustrasi kelola giliran arisan"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HowToUse;

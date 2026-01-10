"use client";

import { Button } from "./Button";
import { motion } from "framer-motion";
import React from "react";

export function CTA() {
  return (
    <section id="tentang-kami" className="bg-[#10b981] px-[5%] py-16 md:py-24 lg:py-28" aria-labelledby="cta-heading">
      <div className="container mx-auto">
        <div className="mx-auto w-full max-w-3xl text-center">
          <h2 id="cta-heading" className="overflow-hidden">
            <motion.span
              initial={{ x: "-50%" }}
              animate={{ x: "0%" }}
              transition={{ type: "spring", bounce: 0 }}
              className="block text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
            >
              Mulai gunakan Arisan Digital
            </motion.span>
          </h2>
          <h2 className="overflow-hidden">
            <motion.span
              initial={{ x: "50%" }}
              animate={{ x: "0%" }}
              transition={{ type: "spring", bounce: 0 }}
              className="mb-5 block text-4xl font-bold leading-tight text-white md:mb-6 md:text-6xl lg:text-7xl"
            >
              Bergabunglah sekarang
            </motion.span>
          </h2>
          <p className="text-base text-white md:text-lg">
            Coba Arisan Digital dan buat grup pertamamu dalam beberapa menit
            saja.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:mt-8">
            <Button
              variant="primary"
              href="http://localhost:3000/auth/login"
              aria-label="Coba aplikasi Arisan Digital"
            >
              Coba Sekarang
            </Button>
            {/* <Button
              variant="secondary"
              aria-label="Daftar akun Arisan Digital"
            >
              Daftar
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;

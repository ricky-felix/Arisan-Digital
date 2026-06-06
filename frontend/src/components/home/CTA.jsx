"use client";

import { Button } from "./Button";
import React from "react";
import { routes } from "../../config";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section id="tentang-kami" className="bg-[#10b981] px-[5%] py-16 md:py-24 lg:py-28" aria-labelledby="cta-heading">
      <div className="container mx-auto">
        <Reveal className="mx-auto w-full max-w-3xl text-center">
          <h2 id="cta-heading" className="overflow-hidden">
            <span className="reveal-slide-left block text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              Mulai gunakan
            </span>
          </h2>
          <h2 id="cta-heading" className="overflow-hidden">
            <span
              className="reveal-slide-left block text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl"
              style={{ "--reveal-delay": "0.1s" }}
            >
              Arisan Digital
            </span>
          </h2>
          <p className="text-base text-white md:text-lg">
            Coba Arisan Digital dan buat grup pertamamu dalam beberapa menit
            saja.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:mt-8">
            <Button
              variant="primary"
              href={routes.app}
              aria-label="Coba WebApp Arisan Digital"
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
        </Reveal>
      </div>
    </section>
  );
}

export default CTA;

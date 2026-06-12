"use client";

import React from "react";
import { routes } from "../../config";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section className="block" aria-labelledby="cta-heading">
      <Reveal className="wrap">
        <div className="cta reveal-scale">
          <h2 id="cta-heading">Mulai gunakan Arisan Digital</h2>
          <p>Coba sekarang dan buat grup pertamamu dalam beberapa menit saja.</p>
          <div className="acts">
            <a className="btn btn-emerald btn-lg" href={routes.app}>
              Coba Sekarang →
            </a>
            <a className="btn btn-ghost btn-lg" href="mailto:arisandigital@outlook.com">
              Hubungi Kami
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default CTA;

"use client";

import React from "react";
import { routes } from "../../config";

export function CTA() {
  return (
    <section className="block" aria-labelledby="cta-heading">
      <div className="wrap">
        <div className="cta">
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
      </div>
    </section>
  );
}

export default CTA;

"use client";

import React from "react";
import { routes } from "../../config";

const PAINS = [
  "Pencatatan manual sering kali tidak akurat",
  "Koordinasi giliran menjadi rumit dan membingungkan",
  "Tidak ada bukti transaksi yang jelas dan aman",
];

export function ProblemStatement() {
  return (
    <section className="block" id="masalah" aria-labelledby="problem-heading">
      <div className="wrap">
        <div className="prob-grid">
          <div>
            <span className="kicker dg">Masalah</span>
            <h2 id="problem-heading" className="prob-title">
              Arisan tradisional butuh solusi modern
            </h2>
            <p className="prob-lead">
              Buku catatan hilang, giliran terlewat, uang tidak terhitung.
              Arisan membutuhkan cara yang lebih baik untuk mengelola
              kepercayaan dan transparansi antar anggota.
            </p>
            <ul className="pain">
              {PAINS.map((pain) => (
                <li key={pain}>
                  <span className="x" aria-hidden="true">
                    ✕
                  </span>
                  {pain}
                </li>
              ))}
            </ul>
            <a className="btn btn-emerald btn-lg" href={routes.app}>
              Coba Sekarang →
            </a>
          </div>
          <div className="prob-img">
            <img
              src="/pictures/problem.webp"
              alt="Ilustrasi permasalahan arisan tradisional"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProblemStatement;

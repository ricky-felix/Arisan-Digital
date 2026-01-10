"use client";

import React from "react";
import {
  BiLogoFacebookCircle,
  BiLogoInstagram,
  BiLogoLinkedinSquare,
  BiLogoYoutube,
} from "react-icons/bi";
import { FaXTwitter } from "react-icons/fa6";
import { handleAnchorClick } from "../utils/smoothScroll";

export function Footer() {
  return (
    <footer id="hubungi" className="bg-[#10b981] px-[5%] py-12 md:py-16 lg:py-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-x-[4vw] gap-y-12 border border-border-primary bg-[#10b981] p-8 md:gap-y-16 md:p-12 lg:grid-cols-[1fr_0.5fr] lg:gap-y-4">
          <div>
            <div className="mb-6 md:mb-8">
              <a
                href="#beranda"
                onClick={(e) => handleAnchorClick(e, 'beranda')}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
              >
                <img
                  src="https://d22po4pjz3o32e.cloudfront.net/logo-image.svg"
                  alt="Logo Arisan Digital"
                  className="inline-block"
                />
              </a>
            </div>
            <div className="mb-6 md:mb-8">
              <p className="mb-1 text-sm font-semibold text-white">Lokasi</p>
              <p className="mb-5 text-sm text-white md:mb-6">Jakarta, Indonesia</p>
              <p className="mb-1 text-sm font-semibold text-white">Hubungi</p>
              <a
                href="tel:+6281234567890"
                className="block text-sm text-white underline decoration-text-primary underline-offset-1 transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
              >
                +62 812 3456 7890
              </a>
              <a
                href="mailto:info@arisandigital.id"
                className="block text-sm text-white underline decoration-text-primary underline-offset-1 transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
              >
                info@arisandigital.id
              </a>
            </div>
            <div className="grid grid-flow-col grid-cols-[max-content] items-start justify-start gap-x-3">
              <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="Facebook">
                <BiLogoFacebookCircle className="size-6" />
              </a>
              <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="Instagram">
                <BiLogoInstagram className="size-6" />
              </a>
              <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="Twitter">
                <FaXTwitter className="size-6 p-0.5" />
              </a>
              <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="LinkedIn">
                <BiLogoLinkedinSquare className="size-6" />
              </a>
              <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="YouTube">
                <BiLogoYoutube className="size-6" />
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 items-start gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 md:gap-y-4">
            <ul>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#fitur"
                  onClick={(e) => handleAnchorClick(e, 'fitur')}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  Fitur
                </a>
              </li>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#cara-kerja"
                  onClick={(e) => handleAnchorClick(e, 'cara-kerja')}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  Cara kerja
                </a>
              </li>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('#', '_blank');
                  }}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  Unduh
                </a>
              </li>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('#', '_blank');
                  }}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  Daftar
                </a>
              </li>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#hubungi"
                  onClick={(e) => handleAnchorClick(e, 'hubungi')}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  Dukungan
                </a>
              </li>
            </ul>
            <ul>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#faq"
                  onClick={(e) => handleAnchorClick(e, 'faq')}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  FAQ
                </a>
              </li>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#hubungi"
                  onClick={(e) => handleAnchorClick(e, 'hubungi')}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  Hubungi kami
                </a>
              </li>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  Blog
                </a>
              </li>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  Komunitas
                </a>
              </li>
              <li className="py-2 text-sm font-semibold">
                <a
                  href="#hubungi"
                  onClick={(e) => handleAnchorClick(e, 'hubungi')}
                  className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
                >
                  Ikuti kami
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col-reverse items-start justify-between pb-4 pt-6 text-sm md:flex-row md:items-center md:pb-0 md:pt-8">
          <p className="mt-8 text-white md:mt-0">© 2024 Arisan Digital. All rights reserved.</p>
          <ul className="grid grid-flow-row grid-cols-[max-content] justify-center gap-y-4 text-sm md:grid-flow-col md:gap-x-6 md:gap-y-0">
            <li className="underline">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
              >
                Syarat dan ketentuan
              </a>
            </li>
            <li className="underline">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
              >
                Pengaturan kuki
              </a>
            </li>
            <li className="underline">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
              >
                Kebijakan privasi
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

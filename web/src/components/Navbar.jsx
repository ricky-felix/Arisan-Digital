"use client";

import { Button } from "./Button";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import {
  BiLogoFacebookCircle,
  BiLogoInstagram,
  BiLogoLinkedinSquare,
  BiLogoYoutube,
} from "react-icons/bi";
import { FaXTwitter } from "react-icons/fa6";
import { handleAnchorClick } from "../utils/smoothScroll";

const ConditionalRender = ({ condition, children }) => {
  return condition ? <>{children}</> : null;
};

const useRelume = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const animateMenu = isMenuOpen
    ? { menu: "open", menu2: "openSecond" }
    : { menu: "close", menu2: "closeSecond" };
  return {
    toggleMenu,
    animateMenu,
    isMenuOpen,
  };
};

export function Navbar() {
  const useActive = useRelume();

  return (
    <nav
      id="navbar"
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-[999] flex min-h-16 w-full items-center border-b border-b-border-primary bg-[#10b981] px-[5%] md:min-h-18"
    >
      <div className="mx-auto flex size-full items-center justify-between">
        <a
          href="#beranda"
          onClick={(e) => handleAnchorClick(e, 'beranda')}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10b981] rounded"
        >
          <img
            src="https://d22po4pjz3o32e.cloudfront.net/logo-image.svg"
            alt="Arisan Digital - Logo"
          />
        </a>
        <div className="flex items-center justify-center gap-2 lg:gap-4">
          <Button
            title="Coba Sekarang"
            size="sm"
            variant="secondary"
            className="shadow-md hover:shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              window.open('#', '_blank');
            }}
          >
            Coba Sekarang
          </Button>
          <button
            className="-mr-2 flex size-12 flex-col items-center justify-center justify-self-end rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10b981] lg:mr-0"
            onClick={useActive.toggleMenu}
            aria-label={useActive.isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={useActive.isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="relative flex size-6 flex-col items-center justify-center">
              <motion.span
                className="absolute top-[3px] h-0.5 w-full bg-white"
                animate={useActive.animateMenu.menu}
                variants={{
                  open: {
                    width: 0,
                    transition: { duration: 0.1, ease: "easeIn" },
                  },
                  close: {
                    width: "100%",
                    transition: { duration: 0.1, delay: 0.3, ease: "linear" },
                  },
                }}
              />
              <motion.span
                className="absolute h-0.5 w-full bg-white"
                animate={useActive.animateMenu.menu}
                variants={{
                  open: {
                    rotate: 135,
                    transition: {
                      duration: 0.3,
                      delay: 0.1,
                      ease: "easeInOut",
                    },
                  },
                  close: {
                    rotate: 0,
                    transition: { duration: 0.3, ease: "easeInOut" },
                  },
                  openSecond: {
                    rotate: 45,
                    transition: {
                      duration: 0.3,
                      delay: 0.1,
                      ease: "easeInOut",
                    },
                  },
                  closeSecond: {
                    rotate: 0,
                    transition: { duration: 0.3, ease: "easeInOut" },
                  },
                }}
              />
              <motion.span
                className="absolute h-0.5 w-full bg-white"
                animate={useActive.animateMenu.menu2}
                variants={{
                  open: {
                    rotate: 135,
                    transition: {
                      duration: 0.3,
                      delay: 0.1,
                      ease: "easeInOut",
                    },
                  },
                  close: {
                    rotate: 0,
                    transition: { duration: 0.3, ease: "easeInOut" },
                  },
                  openSecond: {
                    rotate: 45,
                    transition: {
                      duration: 0.3,
                      delay: 0.1,
                      ease: "easeInOut",
                    },
                  },
                  closeSecond: {
                    rotate: 0,
                    transition: { duration: 0.3, ease: "easeInOut" },
                  },
                }}
              />
              <motion.span
                className="absolute bottom-[3px] h-0.5 w-full bg-white"
                animate={useActive.animateMenu.menu}
                variants={{
                  open: {
                    width: 0,
                    transition: { duration: 0.1, ease: "easeIn" },
                  },
                  close: {
                    width: "100%",
                    transition: { duration: 0.1, delay: 0.3, ease: "linear" },
                  },
                }}
              />
            </span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        <ConditionalRender condition={useActive.isMenuOpen}>
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full h-[calc(100vh-4rem)] w-full overflow-hidden md:h-[calc(100vh-4.5rem)]"
          >
            <motion.div
              variants={{ open: { opacity: 1 }, close: { opacity: 0 } }}
              animate={useActive.animateMenu.menu}
              initial="close"
              exit="close"
              transition={{ duration: 0.2 }}
              className="flex h-full flex-col overflow-auto bg-[#10b981] px-[5%] pt-0.5"
            >
              <div className="my-auto grid max-w-[50rem] grid-cols-1 gap-x-10 gap-y-4 py-4 sm:grid-cols-2 md:py-0">
                <a
                  href="#beranda"
                  onClick={(e) => handleAnchorClick(e, 'beranda', useActive.toggleMenu)}
                  className="py-2 text-2xl font-bold leading-[1.2] text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 md:text-6xl lg:text-7xl"
                >
                  Beranda
                </a>
                <a
                  href="#fitur"
                  onClick={(e) => handleAnchorClick(e, 'fitur', useActive.toggleMenu)}
                  className="py-2 text-2xl font-bold leading-[1.2] text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 md:text-6xl lg:text-7xl"
                >
                  Fitur
                </a>
                <a
                  href="#pelajari"
                  onClick={(e) => handleAnchorClick(e, 'pelajari', useActive.toggleMenu)}
                  className="py-2 text-2xl font-bold leading-[1.2] text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 md:text-6xl lg:text-7xl"
                >
                  Pelajari
                </a>
                <a
                  href="#cara-kerja"
                  onClick={(e) => handleAnchorClick(e, 'cara-kerja', useActive.toggleMenu)}
                  className="py-2 text-2xl font-bold leading-[1.2] text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 md:text-6xl lg:text-7xl"
                >
                  Cara kerja
                </a>
                <a
                  href="#testimoni"
                  onClick={(e) => handleAnchorClick(e, 'testimoni', useActive.toggleMenu)}
                  className="py-2 text-2xl font-bold leading-[1.2] text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 md:text-6xl lg:text-7xl"
                >
                  Testimoni
                </a>
                <a
                  href="#faq"
                  onClick={(e) => handleAnchorClick(e, 'faq', useActive.toggleMenu)}
                  className="py-2 text-2xl font-bold leading-[1.2] text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 md:text-6xl lg:text-7xl"
                >
                  FAQ
                </a>
                <a
                  href="#tentang-kami"
                  onClick={(e) => handleAnchorClick(e, 'tentang-kami', useActive.toggleMenu)}
                  className="py-2 text-2xl font-bold leading-[1.2] text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 md:text-6xl lg:text-7xl"
                >
                  Tentang kami
                </a>
                <a
                  href="#hubungi"
                  onClick={(e) => handleAnchorClick(e, 'hubungi', useActive.toggleMenu)}
                  className="py-2 text-2xl font-bold leading-[1.2] text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 md:text-6xl lg:text-7xl"
                >
                  Hubungi
                </a>
              </div>
              <div className="flex min-h-18 items-center justify-between gap-x-4">
                <a
                  className="inline-flex items-center justify-center gap-2 border-0 p-0 text-base text-white underline transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 md:text-xl"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('#', '_blank');
                  }}
                >
                  Coba Sekarang
                </a>
                <div className="flex items-center gap-3">
                  <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="Facebook">
                    <BiLogoFacebookCircle className="size-6" />
                  </a>
                  <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="Instagram">
                    <BiLogoInstagram className="size-6" />
                  </a>
                  <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="Twitter">
                    <FaXTwitter className="size-6" />
                  </a>
                  <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="LinkedIn">
                    <BiLogoLinkedinSquare className="size-6" />
                  </a>
                  <a href="#" className="text-white transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2" aria-label="YouTube">
                    <BiLogoYoutube className="size-6" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </ConditionalRender>
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;

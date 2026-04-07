"use client";

import { useMediaQuery } from "@relume_io/relume-ui";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { RxChevronRight } from "react-icons/rx";

const FeatureCard = ({ feature, children }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const animatedWidth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
  });
  const width = { width: useTransform(animatedWidth, [0, 1], ["0%", "100%"]) };
  return (
    <div className="flex flex-col items-start justify-center py-8 md:py-0">
      <div className="mt-10 flex text-[6rem] font-bold leading-[1] text-white md:mt-0 md:hidden md:text-[14rem]">
        {feature.number}
      </div>
      <div
        ref={ref}
        className="mb-8 mt-8 h-0.5 w-full bg-white/30 md:mt-0"
      >
        <motion.div className="h-0.5 w-8 bg-white" style={width} />
      </div>
      {children}
    </div>
  );
};

const useRelume = () => {
  const ref = useRef(null);
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 991px)");
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = isTablet
    ? useTransform(
        scrollYProgress,
        [0.10, 0.22, 0.34, 0.46, 0.58, 0.70, 0.85],
        ["0%", "-14.29%", "-28.57%", "-42.86%", "-57.14%", "-71.43%", "-85.71%"],
      )
    : useTransform(
        scrollYProgress,
        [0.10, 0.22, 0.34, 0.46, 0.58, 0.70, 0.85],
        ["0%", "-14.29%", "-28.57%", "-42.86%", "-57.14%", "-71.43%", "-85.71%"],
      );
  return { ref, y };
};

export function Features() {
  const useScroll = useRelume();
  return (
    <section
      id="fitur"
      ref={useScroll.ref}
      className="bg-[#ad8cf8] px-[5%] py-16 md:py-24 lg:py-28"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto">
        <div className="relative grid auto-cols-fr grid-cols-1 items-start gap-x-8 gap-y-12 md:grid-cols-[0.75fr_1fr] md:gap-y-16 lg:grid-cols-[max-content_1fr] lg:gap-x-20">
          <div className="static top-[20%] hidden h-56 overflow-hidden md:sticky md:flex md:items-start ">
            <h2 className="text-[6rem] font-bold leading-[1] text-white md:text-[14rem]">
              0
            </h2>
            <motion.div className="text-center" style={{ y: useScroll.y }}>
              <h2 className="text-[6rem] font-bold leading-[1] text-white md:text-[14rem]">
                {0}
              </h2>
              <h2 className="text-[6rem] font-bold leading-[1] text-white md:text-[14rem]">
                {1}
              </h2>
              <h2 className="text-[6rem] font-bold leading-[1] text-white md:text-[14rem]">
                {2}
              </h2>
              <h2 className="text-[6rem] font-bold leading-[1] text-white md:text-[14rem]">
                {3}
              </h2>
              <h2 className="text-[6rem] font-bold leading-[1] text-white md:text-[14rem]">
                {4}
              </h2>
              <h2 className="text-[6rem] font-bold leading-[1] text-white md:text-[14rem]">
                {5}
              </h2>
              <h2 className="text-[6rem] font-bold leading-[1] text-white md:text-[14rem]">
                {6}
              </h2>
            </motion.div>
          </div>
          <div className="grid auto-cols-fr grid-cols-1 gap-x-12 gap-y-12 md:gap-x-28 md:gap-y-28">
            <FeatureCard
              feature={{
                number: "00",
                tagline: "Tagline",
                heading: "Medium length section heading goes here",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                buttons: [
                  { title: "Button", variant: "secondary" },
                  {
                    title: "Button",
                    variant: "link",
                    size: "link",
                    iconRight: <RxChevronRight />,
                  },
                ],
              }}
            >
              <p className="mb-3 font-semibold text-white md:mb-4">Fitur</p>
              <h2 id="features-heading" className="mb-5 text-5xl font-bold leading-tight text-white md:mb-6 md:text-7xl lg:text-8xl">
                Semua yang kamu butuhkan
              </h2>
              <p className="text-base text-white md:text-lg">
                Enam fitur inti yang dirancang untuk membuat arisan berjalan dengan lancar dan aman.
              </p>
            </FeatureCard><FeatureCard
              feature={{
                number: "01",
                tagline: "Tagline",
                heading: "Medium length section heading goes here",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                buttons: [
                  { title: "Button", variant: "secondary" },
                  {
                    title: "Button",
                    variant: "link",
                    size: "link",
                    iconRight: <RxChevronRight />,
                  },
                ],
              }}
            >
              <p className="mb-3 font-semibold text-white md:mb-4">Notifikasi Otomatis</p>
              <h3 className="mb-5 text-5xl font-bold leading-tight text-white md:mb-6 md:text-7xl lg:text-8xl">
                Pengingat dan Update Real-Time
              </h3>
              <p className="text-base text-white md:text-lg">
                Nggak perlu repot ingetin satu-satu! Sistem kami bakal otomatis kirim notifikasi ke semua anggota tentang jadwal iuran, giliran penerima, dan pengumuman penting lainnya. Semua update langsung masuk ke HP, jadi nggak ada yang ketinggalan info.
              </p>
            </FeatureCard>
            <FeatureCard
              feature={{
                number: "02",
                tagline: "Tagline",
                heading: "Medium length section heading goes here",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                buttons: [
                  { title: "Button", variant: "secondary" },
                  {
                    title: "Button",
                    variant: "link",
                    size: "link",
                    iconRight: <RxChevronRight />,
                  },
                ],
              }}
            >
              <p className="mb-3 font-semibold text-white md:mb-4">Pencatatan Kontribusi</p>
              <h3 className="mb-5 text-5xl font-bold leading-tight text-white md:mb-6 md:text-7xl lg:text-8xl">
                Transparansi Pembayaran
              </h3>
              <p className="text-base text-white md:text-lg">
                Setiap iuran yang masuk langsung tercatat rapi dan transparan. Semua anggota bisa lihat siapa yang sudah bayar dan siapa yang belum. Nggak ada lagi drama "aku udah bayar kok" atau bingung siapa yang nunggak. Semua data jelas dan real-time.
              </p>
            </FeatureCard>
            <FeatureCard
              feature={{
                number: "03",
                tagline: "Tagline",
                heading: "Medium length section heading goes here",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                buttons: [
                  { title: "Button", variant: "secondary" },
                  {
                    title: "Button",
                    variant: "link",
                    size: "link",
                    iconRight: <RxChevronRight />,
                  },
                ],
              }}
            >
              <p className="mb-3 font-semibold text-white md:mb-4">Pengelolaan Giliran</p>
              <h3 className="mb-5 text-5xl font-bold leading-tight text-white md:mb-6 md:text-7xl lg:text-8xl">
                Sistem Undian Fair dan Transparan
              </h3>
              <p className="text-base text-white md:text-lg">
                Sistem undian yang fair dan transparan untuk tentuin siapa dapat giliran duluan. Bisa juga atur manual sesuai kesepakatan grup. Jadwal giliran jelas, jadi semua anggota tau kapan mereka bakal terima arisan. Nggak ada kecurangan, semuanya adil!
              </p>
            </FeatureCard>
            <FeatureCard
              feature={{
                number: "04",
                tagline: "Tagline",
                heading: "Medium length section heading goes here",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                buttons: [
                  { title: "Button", variant: "secondary" },
                  {
                    title: "Button",
                    variant: "link",
                    size: "link",
                    iconRight: <RxChevronRight />,
                  },
                ],
              }}
            >
              <p className="mb-3 font-semibold text-white md:mb-4">Chat Group</p>
              <h3 className="mb-5 text-5xl font-bold leading-tight text-white md:mb-6 md:text-7xl lg:text-8xl">
                Komunikasi Mudah dalam Satu Aplikasi
              </h3>
              <p className="text-base text-white md:text-lg">
                Diskusi arisan jadi lebih fokus! Fitur chat dalam app khusus buat obrolan seputar arisan aja. Jadi chat WhatsApp grup kamu nggak berantakan sama urusan arisan. Mau nanya status pembayaran atau koordinasi? Langsung di sini aja.
              </p>
            </FeatureCard>
            <FeatureCard
              feature={{
                number: "05",
                tagline: "Tagline",
                heading: "Medium length section heading goes here",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                buttons: [
                  { title: "Button", variant: "secondary" },
                  {
                    title: "Button",
                    variant: "link",
                    size: "link",
                    iconRight: <RxChevronRight />,
                  },
                ],
              }}
            >
              <p className="mb-3 font-semibold text-white md:mb-4">Riwayat Arisan</p>
              <h3 className="mb-5 text-5xl font-bold leading-tight text-white md:mb-6 md:text-7xl lg:text-8xl">
                Catatan Lengkap dan Transparan
              </h3>
              <p className="text-base text-white md:text-lg">
                Semua transaksi dan kegiatan arisan tersimpan lengkap. Mau cek siapa yang udah pernah dapet giliran? Atau mau lihat histori pembayaran bulan lalu? Tinggal buka riwayat, semua data ada. Transparansi total, nggak ada yang disembunyiin.
              </p>
            </FeatureCard>
            <FeatureCard
              feature={{
                number: "06",
                tagline: "Tagline",
                heading: "Medium length section heading goes here",
                description:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
                buttons: [
                  { title: "Button", variant: "secondary" },
                  {
                    title: "Button",
                    variant: "link",
                    size: "link",
                    iconRight: <RxChevronRight />,
                  },
                ],
              }}
            >
              <p className="mb-3 font-semibold text-white md:mb-4">Keamanan Data</p>
              <h3 className="mb-5 text-5xl font-bold leading-tight text-white md:mb-6 md:text-7xl lg:text-8xl">
                Privasi dan Proteksi Terjamin
              </h3>
              <p className="text-base text-white md:text-lg">
                Data arisan kamu aman terlindungi dengan enkripsi tingkat bank. Informasi pribadi dan finansial semua anggota dijaga ketat. Cuma anggota grup yang bisa akses data arisan. Privacy kamu prioritas kami, jadi bisa arisan dengan tenang tanpa khawatir data bocor.
              </p>
            </FeatureCard>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;

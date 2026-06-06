import React from "react";
import { Navbar } from "../components/home/Navbar";
import { Hero } from "../components/home/Hero";
import { ProblemStatement } from "../components/home/ProblemStatement";
import { HowToUse } from "../components/home/HowToUse";
import { Features } from "../components/home/Features";
import { BillSplitting } from "../components/home/BillSplitting";
import { Gallery } from "../components/home/Gallery";
import { FAQs } from "../components/home/FAQs";
import { CTA } from "../components/home/CTA";
import { Footer } from "../components/home/Footer";

export default function LandingPage() {
  return (
    <div className="bg-background-primary">
      <Navbar />
      <main id="main-content">
        <Hero />
        <ProblemStatement />
        <HowToUse />
        <BillSplitting />
        <Features />
        <Gallery />
        <FAQs />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

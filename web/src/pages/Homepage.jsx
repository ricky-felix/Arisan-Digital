import React from "react";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { ProblemStatement } from "../components/ProblemStatement";
import { HowToUse } from "../components/HowToUse";
import { Features } from "../components/Features";
import { Gallery } from "../components/Gallery";
import { FAQs } from "../components/FAQs";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";

export default function Homepage() {
  return (
    <div className="bg-background-primary">
      <Navbar />
      <main id="main-content">
        <Hero />
        <ProblemStatement />
        <HowToUse />
        <Features />
        <Gallery />
        <FAQs />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

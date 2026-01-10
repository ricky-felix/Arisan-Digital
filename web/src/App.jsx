import Homepage from "./pages/Homepage";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Skip to content link for accessibility
const SkipToContent = () => (
  <a
    href="#main-content"
    className="fixed left-4 top-4 z-[9999] -translate-y-16 rounded-lg bg-[#10b981] px-4 py-2 text-white shadow-lg transition-transform duration-200 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
  >
    Langsung ke konten utama
  </a>
);

// Scroll to top button
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#10b981] text-white shadow-lg transition-colors hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2"
          aria-label="Kembali ke atas"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

function App() {
  return (
    <>
      <SkipToContent />
      <Routes>
        <Route path="/" element={<Homepage />} />
        {/* Redirect to 404 */}
        {/* <Route path="*" element={<NotFound404 />} /> */}
      </Routes>
      <ScrollToTop />
    </>
  );
}

export default App;

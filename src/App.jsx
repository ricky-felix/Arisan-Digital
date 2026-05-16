import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import { LoginOrRegister } from "./pages/LoginOrRegister";
import { AppHomepage } from "./pages/application/AppHomepage";
import { GrupPage } from "./pages/application/GrupPage";
import { BayarPage } from "./pages/application/BayarPage";
import { ProfilPage } from "./pages/application/ProfilPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// ── Landing + modal overlay on /login ────────────────────────
function LoginPage() {
  const navigate = useNavigate();
  return (
    <>
      <LandingPage />
      <AnimatePresence>
        <LoginOrRegister onClose={() => navigate("/")} />
      </AnimatePresence>
    </>
  );
}

// ── Redirect authenticated users away from /login ─────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoadingScreen />;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

// ── Guard app routes — redirect to /login if not authenticated ─
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── Full-screen loading while auth resolves ───────────────────
function AppLoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#10b981]" />
        <p className="text-sm text-gray-400">Memuat...</p>
      </div>
    </div>
  );
}

// ── Skip-to-content link ──────────────────────────────────────
const SkipToContent = () => (
  <a
    href="#main-content"
    className="fixed left-4 top-4 z-9999 -translate-y-16 rounded-lg bg-[#10b981] px-4 py-2 text-white shadow-lg transition-transform duration-200 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
  >
    Langsung ke konten utama
  </a>
);

// ── Scroll-to-top button (landing only) ──────────────────────
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Only show on landing pages
  const isLanding = pathname === "/" || pathname === "/login";

  useEffect(() => {
    if (!isLanding) { setIsVisible(false); return; }
    const toggle = () => setIsVisible(window.scrollY > 500);
    window.addEventListener("scroll", toggle, { passive: true });
    return () => window.removeEventListener("scroll", toggle);
  }, [isLanding]);

  if (!isLanding) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#10b981] text-white shadow-lg transition-colors hover:bg-[#0d9e6e] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:ring-offset-2"
          aria-label="Kembali ke atas"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// ── Root app ──────────────────────────────────────────────────
function AppRoutes() {
  return (
    <>
      <SkipToContent />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected app routes */}
        <Route path="/app" element={<ProtectedRoute><AppHomepage /></ProtectedRoute>} />
        <Route path="/app/grup" element={<ProtectedRoute><GrupPage /></ProtectedRoute>} />
        <Route path="/app/bayar" element={<ProtectedRoute><BayarPage /></ProtectedRoute>} />
        <Route path="/app/profil" element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
        <Route path="/app/notifikasi" element={<ProtectedRoute><AppHomepage /></ProtectedRoute>} />
        <Route path="/app/analitik" element={<ProtectedRoute><AppHomepage /></ProtectedRoute>} />
        <Route path="/app/buat-arisan" element={<ProtectedRoute><AppHomepage /></ProtectedRoute>} />
        <Route path="/app/grup/:id" element={<ProtectedRoute><GrupPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ScrollToTop />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

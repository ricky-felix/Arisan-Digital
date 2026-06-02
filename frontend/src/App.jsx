import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import { LoginOrRegister } from "./pages/LoginOrRegister";
import { AppHomepage } from "./pages/application/AppHomepage";
import { ArisanPage } from "./pages/application/ArisanPage";
import CreateArisanPage from "./pages/application/CreateArisanPage";
import GroupDetailPage from "./pages/application/GroupDetailPage";
import { BayarPage } from "./pages/application/BayarPage";
import { ProfilPage } from "./pages/application/ProfilPage";
import PatunganPage from "./pages/application/PatunganPage";
import CreatePatunganPage from "./pages/application/CreatePatunganPage";
import BillDetailPage from "./pages/application/BillDetailPage";
import AppLayout from "./components/application/AppLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AccountPromptProvider } from "./context/AccountPromptContext";

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

// ── App routes are open in this MVP (no login). We just wait for
//    the anonymous session to bootstrap, and surface a setup hint if
//    anonymous auth hasn't been enabled in Supabase yet. ─────────
function ProtectedRoute({ children }) {
  const { user, loading, authError } = useAuth();
  if (loading) return <AppLoadingScreen />;
  if (authError) return <AuthSetupScreen error={authError} />;
  if (!user) return <AppLoadingScreen />;
  return children;
}

// ── Shown when the anonymous session can't be created ─────────
function AuthSetupScreen({ error }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">Perlu satu langkah setup</h1>
        <p className="mt-2 text-sm text-gray-600">
          Aplikasi memakai sesi anonim Supabase agar bisa dipakai tanpa login.
          Aktifkan dulu di dashboard Supabase:
          <br />
          <span className="font-medium text-gray-800">
            Authentication → Sign In / Providers → Anonymous
          </span>
          , lalu muat ulang halaman ini.
        </p>
        <p className="mt-3 rounded-lg bg-gray-50 p-2 font-mono text-xs text-gray-500">{error}</p>
      </div>
    </div>
  );
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

        {/* App routes (open — anonymous session, no login) */}
        <Route path="/app" element={<ProtectedRoute><AppHomepage /></ProtectedRoute>} />
        <Route path="/app/arisan" element={<ProtectedRoute><ArisanPage /></ProtectedRoute>} />
        <Route path="/app/arisan/buat" element={<ProtectedRoute><CreateArisanPage /></ProtectedRoute>} />
        <Route path="/app/buat-arisan" element={<ProtectedRoute><CreateArisanPage /></ProtectedRoute>} />
        <Route path="/app/arisan/:id" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
        <Route path="/app/bayar" element={<ProtectedRoute><BayarPage /></ProtectedRoute>} />
        <Route path="/app/profil" element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
        <Route path="/app/notifikasi" element={<ProtectedRoute><AppHomepage /></ProtectedRoute>} />
        <Route path="/app/analitik" element={<ProtectedRoute><AppHomepage /></ProtectedRoute>} />
        <Route path="/app/patungan" element={<ProtectedRoute><AppLayout title="Patungan"><PatunganPage /></AppLayout></ProtectedRoute>} />
        <Route path="/app/patungan/buat" element={<ProtectedRoute><CreatePatunganPage /></ProtectedRoute>} />
        <Route path="/app/patungan/rutin" element={<ProtectedRoute><AppLayout title="Patungan"><PatunganPage /></AppLayout></ProtectedRoute>} />
        <Route path="/app/patungan/:billId" element={<ProtectedRoute><BillDetailPage /></ProtectedRoute>} />

        {/* Dev-only unguarded routes used by scripts/screenshot-app.mjs to
            capture the in-app screens for the landing Gallery. Excluded from
            production builds via import.meta.env.DEV. */}
        {import.meta.env.DEV && (
          <>
            <Route path="/screens/beranda" element={<AppHomepage />} />
            <Route path="/screens/arisan" element={<ArisanPage />} />
            <Route path="/screens/bayar" element={<BayarPage />} />
            <Route path="/screens/patungan" element={<AppLayout title="Patungan"><PatunganPage /></AppLayout>} />
            <Route path="/screens/profil" element={<ProfilPage />} />
          </>
        )}

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
        <AccountPromptProvider>
          <AppRoutes />
        </AccountPromptProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

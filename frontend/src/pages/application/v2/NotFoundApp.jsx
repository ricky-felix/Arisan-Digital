import { useNavigate } from "react-router-dom";
import "../../../styles/app-v2.css";
import { ChevronLeft, Home, AlertCircle, Sparkle } from "../../../components/application/v2/icons";

// ── In-app 404 (v2) ──────────────────────────────────────────
// Shown for any unknown /app/* route. Uses the v2 phone-frame shell
// (.v2-screen / .v2-inner) with the standard sticky header + back
// button, then a centered orbit-style empty state: an emerald→lavender
// gradient orb with a floating glyph, the brand's two domain colors.
export default function NotFoundApp() {
  const navigate = useNavigate();

  return (
    <div className="v2-screen v2-404">
      <div className="v2-inner">

        {/* Centered empty state */}
        <div className="nf-stage">
          <div className="nf-orb">
            <span className="nf-code">404</span>
            <span className="nf-spark nf-spark-em" aria-hidden>
              <Sparkle size={18} stroke="var(--emerald)" strokeWidth={2} />
            </span>
            <span className="nf-spark nf-spark-lv" aria-hidden>
              <AlertCircle size={16} stroke="var(--lavender-dark)" strokeWidth={2.5} />
            </span>
          </div>

          <h1 className="nf-title">Yah, halaman ini hilang</h1>
          <p className="nf-sub">
            Halaman yang kamu tuju mungkin sudah dipindahkan atau tautannya
            keliru. Kembali ke beranda untuk lanjut.
          </p>

          <div className="nf-actions">
            <button type="button" className="nf-btn primary" onClick={() => navigate("/app")}>
              <Home size={16} stroke="#fff" strokeWidth={2.5} />
              Balik Ke Beranda Applikasi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

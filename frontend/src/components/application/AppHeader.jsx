import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "./Icon";

export default function AppHeader() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const name = profile?.name || "Tamu";
  const firstName = name.split(" ")[0];

  return (
    <header className="md:hidden flex-shrink-0 flex items-center justify-between px-4 pt-3 pb-2 bg-white border-b border-[var(--line-soft)]">
      <div>
        <p className="text-xs text-[var(--ink-2)]">Selamat datang kembali</p>
        <h1 className="text-xl font-bold tracking-tight text-[var(--ink-1)]">Halo, {firstName} 👋</h1>
      </div>
      <button
        className="app-icon-btn relative"
        onClick={() => navigate("/app/notifikasi")}
        aria-label="Notifikasi"
      >
        <Icon name="bell" size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger)] border-2 border-white" />
      </button>
    </header>
  );
}

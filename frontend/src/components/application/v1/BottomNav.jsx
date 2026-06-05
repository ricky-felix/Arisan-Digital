import { useNavigate, useLocation } from "react-router-dom";
import Icon from "../Icon";

const TABS = [
  { id: "dashboard",  label: "Beranda",    icon: "home",   path: "/app" },
  { id: "arisan",     label: "Arisan",     icon: "users",  path: "/app/arisan", module: "arisan" },
  { id: "patungan",   label: "Patungan",   icon: "split",  path: "/app/patungan", module: "patungan" },
  { id: "notifs",     label: "Notifikasi", icon: "bell",   path: "/app/notifikasi" },
  { id: "profile",    label: "Profil",     icon: "user",   path: "/app/profil" },
];

function getActive(pathname) {
  if (pathname === "/app") return "dashboard";
  if (pathname.startsWith("/app/arisan")) return "arisan";
  if (pathname.startsWith("/app/patungan")) return "patungan";
  if (pathname.startsWith("/app/notifikasi")) return "notifs";
  if (pathname.startsWith("/app/profil")) return "profile";
  return "dashboard";
}

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = getActive(pathname);

  return (
    <nav className="app-tabbar md:hidden flex-shrink-0">
      {TABS.map(t => (
        <a
          key={t.id}
          className={active === t.id ? "on" : ""}
          onClick={() => navigate(t.path)}
          role="button"
          tabIndex={0}
        >
          <div className="relative w-6 h-6 grid place-items-center">
            <Icon name={t.icon} size={22} />
            {t.id === "notifs" && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[var(--danger)] border-2 border-white" />
            )}
            {t.module && (
              <span
                className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                  t.module === "arisan" ? "bg-[var(--emerald)]" : "bg-[var(--lavender-dark)]"
                }`}
              />
            )}
          </div>
          <span>{t.label}</span>
        </a>
      ))}
    </nav>
  );
}

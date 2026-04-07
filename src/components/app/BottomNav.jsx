import React from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    key: "beranda",
    route: "/app",
    label: "Beranda",
    icon: (active) => (
      <svg className={`size-6 ${active ? "text-[#10b981]" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "grup",
    route: "/app/grup",
    label: "Grup",
    icon: (active) => (
      <svg className={`size-6 ${active ? "text-[#10b981]" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "bayar",
    route: "/app/bayar",
    label: "Bayar",
    icon: (active) => (
      <svg className={`size-6 ${active ? "text-[#10b981]" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    key: "profil",
    route: "/app/profil",
    label: "Profil",
    icon: (active) => (
      <svg className={`size-6 ${active ? "text-[#10b981]" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeKey =
    NAV_ITEMS.slice()
      .reverse()
      .find((item) => pathname.startsWith(item.route))?.key ?? "beranda";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.route)}
              className="flex flex-1 flex-col items-center gap-0.5 py-1 focus-visible:outline-none"
            >
              {item.icon(isActive)}
              <span className={`text-[10px] font-medium ${isActive ? "text-[#10b981]" : "text-gray-400"}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div layoutId="nav-dot" className="mt-0.5 h-1 w-1 rounded-full bg-[#10b981]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;

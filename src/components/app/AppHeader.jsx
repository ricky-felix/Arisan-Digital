import React from "react";

export function AppHeader({ user }) {
  return (
    <header className="sticky top-0 z-40 bg-white px-5 pt-12 pb-4 shadow-sm">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Selamat datang,</p>
          <p className="text-base font-bold text-gray-900">{user.name} 👋</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]">
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {user.notifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {user.notifications}
              </span>
            )}
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10b981] text-xs font-bold text-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]">
            {user.avatar}
          </button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;

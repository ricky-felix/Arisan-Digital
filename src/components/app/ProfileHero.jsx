import React from "react";

export function ProfileHero({ user }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#10b981] to-[#059669] px-5 pb-8 pt-14">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-white/10" />

      <div className="relative mx-auto max-w-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-[#10b981] shadow-lg">
            {user.avatar}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{user.name}</p>
            <p className="text-sm text-white/70">{user.phone}</p>
            <p className="text-xs text-white/60">{user.email}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/50">Bergabung sejak {user.joinDate}</p>
      </div>
    </div>
  );
}

export default ProfileHero;

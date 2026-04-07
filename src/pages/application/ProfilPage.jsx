import React from "react";
import { motion } from "framer-motion";
import { ProfileHero } from "../../components/app/ProfileHero";
import { ProfileStats } from "../../components/app/ProfileStats";
import { ProfileMenuList } from "../../components/app/ProfileMenuList";
import { BottomNav } from "../../components/app/BottomNav";
import { useAuth } from "../../context/AuthContext";
import { useGroups } from "../../hooks/useGroups";
import { usePayments } from "../../hooks/usePayments";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

export function ProfilPage() {
  const { profile } = useAuth();
  const { groups } = useGroups();
  const { history } = usePayments();

  // Compute stats from live data
  const totalSaved = history
    .filter((p) => p.type === "terima")
    .reduce((sum, p) => sum + p.amount, 0);

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    : "—";

  const { user: authUser } = useAuth();

  const user = {
    name: profile?.full_name ?? "Pengguna",
    avatar: profile?.avatar_initials ?? "??",
    phone: profile?.phone ?? "—",
    email: authUser?.email ?? "—",
    joinDate,
  };

  const stats = {
    totalGroups: groups.length,
    totalSaved,
    monthsActive: profile?.created_at
      ? Math.max(
          1,
          Math.floor(
            (Date.now() - new Date(profile.created_at).getTime()) /
              (1000 * 60 * 60 * 24 * 30)
          )
        )
      : 0,
  };

  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <ProfileHero user={user} />

      <main className="mx-auto w-full max-w-lg flex-1 space-y-4 px-5 pb-28 pt-5">
        <motion.div {...fadeUp(0)}>
          <ProfileStats stats={stats} />
        </motion.div>

        <motion.div {...fadeUp(0.05)}>
          <ProfileMenuList />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

export default ProfilPage;

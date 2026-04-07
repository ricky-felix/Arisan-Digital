import React from "react";
import { motion } from "framer-motion";
import { ProfileHero } from "../../components/app/ProfileHero";
import { ProfileStats } from "../../components/app/ProfileStats";
import { ProfileMenuList } from "../../components/app/ProfileMenuList";
import { BottomNav } from "../../components/app/BottomNav";
import { USER, PROFILE_STATS } from "../../data/appMockData";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

export function ProfilPage() {
  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <ProfileHero user={USER} />

      <main className="mx-auto w-full max-w-lg flex-1 space-y-4 px-5 pb-28 pt-5">
        <motion.div {...fadeUp(0)}>
          <ProfileStats stats={PROFILE_STATS} />
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

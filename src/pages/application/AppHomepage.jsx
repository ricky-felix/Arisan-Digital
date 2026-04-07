import React from "react";
import { motion } from "framer-motion";
import { AppHeader } from "../../components/app/AppHeader";
import { SummaryCard } from "../../components/app/SummaryCard";
import { QuickActions } from "../../components/app/QuickActions";
import { ActiveGroups } from "../../components/app/ActiveGroups";
import { UpcomingSchedule } from "../../components/app/UpcomingSchedule";
import { RecentActivity } from "../../components/app/RecentActivity";
import { BottomNav } from "../../components/app/BottomNav";
import { USER, SUMMARY, GROUPS, SCHEDULE, ACTIVITY } from "../../data/appMockData";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

export function AppHomepage() {
  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <AppHeader user={USER} />

      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 overflow-y-auto px-5 pb-28 pt-5">
        <motion.div {...fadeUp(0)}>
          <SummaryCard summary={SUMMARY} />
        </motion.div>

        <motion.div {...fadeUp(0.05)}>
          <QuickActions />
        </motion.div>

        <motion.div {...fadeUp(0.1)}>
          <ActiveGroups groups={GROUPS} />
        </motion.div>

        <motion.div {...fadeUp(0.15)}>
          <UpcomingSchedule items={SCHEDULE} />
        </motion.div>

        <motion.div {...fadeUp(0.2)}>
          <RecentActivity items={ACTIVITY} />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

export default AppHomepage;

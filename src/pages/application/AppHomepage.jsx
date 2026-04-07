import React from "react";
import { motion } from "framer-motion";
import { AppHeader } from "../../components/app/AppHeader";
import { SummaryCard } from "../../components/app/SummaryCard";
import { QuickActions } from "../../components/app/QuickActions";
import { ActiveGroups } from "../../components/app/ActiveGroups";
import { UpcomingSchedule } from "../../components/app/UpcomingSchedule";
import { RecentActivity } from "../../components/app/RecentActivity";
import { BottomNav } from "../../components/app/BottomNav";
import { useAuth } from "../../context/AuthContext";
import { useGroups } from "../../hooks/useGroups";
import { useDashboard } from "../../hooks/useDashboard";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay },
});

function SkeletonCard({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-gray-200 ${className}`} />;
}

export function AppHomepage() {
  const { profile } = useAuth();
  const { groups, loading: groupsLoading } = useGroups();
  const { summary, schedule, activity, loading: dashLoading } = useDashboard();

  const loading = groupsLoading || dashLoading;

  const user = {
    name: profile?.full_name ?? "Pengguna",
    avatar: profile?.avatar_initials ?? "??",
    notifications: 0,
  };

  return (
    <div className="flex min-h-svh flex-col bg-gray-50">
      <AppHeader user={user} />

      <main className="mx-auto w-full max-w-lg flex-1 space-y-6 overflow-y-auto px-5 pb-28 pt-5">
        {loading ? (
          <>
            <SkeletonCard className="h-40" />
            <SkeletonCard className="h-24" />
            <SkeletonCard className="h-48" />
          </>
        ) : (
          <>
            {summary && (
              <motion.div {...fadeUp(0)}>
                <SummaryCard summary={summary} />
              </motion.div>
            )}

            <motion.div {...fadeUp(0.05)}>
              <QuickActions />
            </motion.div>

            {groups.length > 0 && (
              <motion.div {...fadeUp(0.1)}>
                <ActiveGroups groups={groups} />
              </motion.div>
            )}

            {schedule.length > 0 && (
              <motion.div {...fadeUp(0.15)}>
                <UpcomingSchedule items={schedule} />
              </motion.div>
            )}

            {activity.length > 0 && (
              <motion.div {...fadeUp(0.2)}>
                <RecentActivity items={activity} />
              </motion.div>
            )}

            {!summary && groups.length === 0 && (
              <motion.div {...fadeUp(0.1)} className="py-16 text-center">
                <p className="text-base font-semibold text-gray-600">Selamat datang! 🎉</p>
                <p className="mt-1 text-sm text-gray-400">
                  Mulai dengan bergabung atau membuat grup arisan pertamamu.
                </p>
              </motion.div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default AppHomepage;

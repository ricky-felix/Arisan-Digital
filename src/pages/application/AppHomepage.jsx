import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AppLayout from "../../components/application/AppLayout";
import SummaryCard from "../../components/application/SummaryCard";
import QuickActions from "../../components/application/QuickActions";
import ActiveGroups from "../../components/application/ActiveGroups";
import RecentActivity from "../../components/application/RecentActivity";
import UpcomingSchedule from "../../components/application/UpcomingSchedule";
import { groups as mockGroups, myBills as mockBills, activities as mockActivities } from "../../data/appMockData";
import { useDashboard } from "../../hooks/useDashboard";

export function AppHomepage() {
  const navigate = useNavigate();
  const { summary, schedule, activity, loading } = useDashboard();

  // Use real data if available, otherwise fall back to mock
  const displayGroups = mockGroups;
  const displayBills = mockBills;
  const displayActivities = mockActivities;
  const nextBill = displayBills[0];
  const totalSaved = 6_800_000;

  return (
    <AppLayout title="Dashboard">
      <div className="app-scroll" style={{ padding: "16px 16px 24px" }}>
        {/* Desktop greeting */}
        <div className="hidden md:flex justify-between items-end mb-6">
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Dashboard 👋
            </h1>
            <p style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 6 }}>
              {displayGroups.length} grup aktif · 1 tagihan jatuh tempo minggu ini
            </p>
          </div>
          <button
            className="app-btn btn-primary btn-lg"
            onClick={() => navigate("/app/buat-arisan")}
          >
            + Buat Arisan
          </button>
        </div>

        {/* Metric cards */}
        <SummaryCard
          totalGroups={displayGroups.length}
          nextBill={nextBill ? { amount: nextBill.amount, due: nextBill.due, group: nextBill.group } : { amount: 0, due: new Date(), group: "—" }}
          totalSaved={totalSaved}
        />

        {/* Quick actions */}
        <div className="app-section-head">
          <h2>Aksi Cepat</h2>
        </div>
        <QuickActions
          onBuat={() => navigate("/app/buat-arisan")}
          onBayar={() => navigate("/app/bayar")}
          onJadwal={() => navigate("/app/grup/kantor")}
          showAnalitik={false}
        />

        {/* Desktop: two-column layout */}
        <div className="hidden md:grid mt-6" style={{ gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <ActiveGroups
            groups={displayGroups}
            onGroupClick={g => navigate(`/app/grup/${g.id}`)}
            onViewAll={() => navigate("/app/grup")}
          />
          <RecentActivity activities={displayActivities} limit={5} />
        </div>

        {/* Mobile: single column */}
        <div className="md:hidden">
          <ActiveGroups
            groups={displayGroups}
            onGroupClick={g => navigate(`/app/grup/${g.id}`)}
            onViewAll={() => navigate("/app/grup")}
            limit={3}
          />
          <div style={{ marginTop: 4 }}>
            <UpcomingSchedule bills={displayBills} />
          </div>
          <div style={{ marginTop: 4 }}>
            <RecentActivity activities={displayActivities} limit={5} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default AppHomepage;

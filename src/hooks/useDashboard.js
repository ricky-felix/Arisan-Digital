import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

/**
 * Aggregates data for the home dashboard:
 * - summary card (total saved, next due, next payout)
 * - upcoming schedule
 * - recent activity
 */
export function useDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const [allPaymentsRes, upcomingRes, recentRes] = await Promise.all([
      // All settled payments for total-saved computation
      supabase
        .from("payments")
        .select("amount, type, status")
        .eq("user_id", user.id)
        .eq("status", "lunas"),

      // Upcoming: pending bayar + pending terima, sorted by due_date
      supabase
        .from("payments")
        .select("id, amount, type, due_date, group:groups(name)")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(5),

      // Recent: latest settled transactions
      supabase
        .from("payments")
        .select("id, amount, type, status, paid_at, group:groups(name)")
        .eq("user_id", user.id)
        .neq("status", "pending")
        .order("paid_at", { ascending: false })
        .limit(5),
    ]);

    if (allPaymentsRes.error || upcomingRes.error || recentRes.error) {
      setError(
        allPaymentsRes.error?.message ??
        upcomingRes.error?.message ??
        recentRes.error?.message
      );
      setLoading(false);
      return;
    }

    // Summary
    const settled = allPaymentsRes.data ?? [];
    const totalSaved = settled
      .filter((p) => p.type === "terima")
      .reduce((sum, p) => sum + p.amount, 0);

    const upcoming = upcomingRes.data ?? [];
    const nextBayar = upcoming.find((p) => p.type === "bayar");
    const nextTerima = upcoming.find((p) => p.type === "terima");

    setSummary({
      totalSaved,
      nextDue: nextBayar?.amount ?? 0,
      nextDueDate: nextBayar?.due_date
        ? new Date(nextBayar.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
        : "—",
      nextPayout: nextTerima?.amount ?? 0,
      nextPayoutDate: nextTerima?.due_date
        ? new Date(nextTerima.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
        : "—",
    });

    // Schedule
    setSchedule(
      upcoming.map((p) => ({
        id: p.id,
        group: p.group?.name ?? "—",
        type: p.type,
        amount: p.amount,
        date: p.due_date
          ? new Date(p.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
          : "—",
      }))
    );

    // Activity
    setActivity(
      (recentRes.data ?? []).map((p) => ({
        id: p.id,
        group: p.group?.name ?? "—",
        type: p.type,
        amount: p.amount,
        status: p.status,
        date: (p.paid_at)
          ? new Date(p.paid_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
          : "—",
      }))
    );

    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, schedule, activity, loading, error, refetch: fetch };
}

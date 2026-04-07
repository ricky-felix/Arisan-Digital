import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

/**
 * Returns the current user's pending payments and payment history.
 */
export function usePayments() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const [pendingRes, historyRes] = await Promise.all([
      supabase
        .from("payments")
        .select("id, amount, due_date, group:groups(name, color)")
        .eq("user_id", user.id)
        .eq("type", "bayar")
        .eq("status", "pending")
        .order("due_date", { ascending: true }),

      supabase
        .from("payments")
        .select("id, amount, type, method, paid_at, created_at, group:groups(name)")
        .eq("user_id", user.id)
        .neq("status", "pending")
        .order("paid_at", { ascending: false })
        .limit(20),
    ]);

    if (pendingRes.error || historyRes.error) {
      setError(pendingRes.error?.message ?? historyRes.error?.message);
    } else {
      const today = new Date();

      setPending(
        (pendingRes.data ?? []).map((p) => ({
          id: p.id,
          group: p.group?.name ?? "—",
          color: p.group?.color ?? "#10b981",
          amount: p.amount,
          dueDate: p.due_date
            ? new Date(p.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
            : "—",
          overdue: p.due_date ? new Date(p.due_date) < today : false,
        }))
      );

      setHistory(
        (historyRes.data ?? []).map((p) => ({
          id: p.id,
          group: p.group?.name ?? "—",
          type: p.type,
          amount: p.amount,
          method: p.method ?? "—",
          date: (p.paid_at ?? p.created_at)
            ? new Date(p.paid_at ?? p.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—",
        }))
      );
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  async function markPaid(paymentId, method) {
    const { error } = await supabase
      .from("payments")
      .update({ status: "lunas", method, paid_at: new Date().toISOString() })
      .eq("id", paymentId)
      .eq("user_id", user.id);
    if (error) throw error;
    await fetch();
  }

  return { pending, history, loading, error, refetch: fetch, markPaid };
}

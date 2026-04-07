import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

/**
 * Returns the current user's arisan groups with member count and their position.
 * Shape matches what GroupCard / GroupListCard expect.
 */
export function useGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("group_members")
      .select(`
        position,
        group:groups (
          id,
          name,
          amount,
          total_rounds,
          current_round,
          color,
          invite_code,
          group_members ( count )
        )
      `)
      .eq("user_id", user.id)
      .order("joined_at", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      const shaped = (data ?? []).map(({ position, group }) => ({
        id: group.id,
        name: group.name,
        amount: group.amount,
        totalRounds: group.total_rounds,
        currentRound: group.current_round,
        color: group.color,
        inviteCode: group.invite_code,
        members: group.group_members?.[0]?.count ?? 0,
        myPosition: position,
        // Next date is a simplified approximation; real apps would compute from round schedule
        nextDate: null,
      }));
      setGroups(shaped);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  async function createGroup({ name, description, amount, totalRounds, color }) {
    const { data, error } = await supabase
      .from("groups")
      .insert({ name, description, amount, total_rounds: totalRounds, color, created_by: user.id })
      .select()
      .single();
    if (error) throw error;

    // Auto-join creator as member at position 1
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({ group_id: data.id, user_id: user.id, position: 1 });
    if (memberError) throw memberError;

    await fetch();
    return data;
  }

  async function joinGroup(inviteCode) {
    // Look up the group by invite code
    const { data: group, error: lookupError } = await supabase
      .from("groups")
      .select("id, total_rounds, group_members(count)")
      .eq("invite_code", inviteCode.toUpperCase())
      .single();
    if (lookupError) throw new Error("Kode undangan tidak ditemukan.");

    const currentCount = group.group_members?.[0]?.count ?? 0;
    if (currentCount >= group.total_rounds) throw new Error("Grup sudah penuh.");

    const { error: joinError } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: user.id, position: currentCount + 1 });
    if (joinError) throw joinError;

    await fetch();
  }

  return { groups, loading, error, refetch: fetch, createGroup, joinGroup };
}

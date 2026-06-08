import { useState, useEffect } from 'react';
import { contactsService, groupMembersService } from '../services';
import { MEMBERS, DANCE_PARAMS } from '../components/application/v2/members/data';

/**
 * useMembers — loads contacts / group members for MembersOrbit.
 *
 * Priority:
 *   1. If groupId is provided → fetch groupMembersService.list(groupId)
 *   2. Otherwise → fetch contactsService.list() (all contacts)
 *
 * Falls back to static MEMBERS on error.
 *
 * @param {string|null} groupId – optional; when provided fetches members of that group.
 */

const FALLBACK_COLORS = [
  '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6366f1', '#ef4444', '#14b8a6', '#0891b2',
  '#d97706', '#7c3aed', '#dc2626', '#10b981',
];

function initials(name = '') {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (name.slice(0, 2) || '??').toUpperCase();
}

export function useMembers(groupId = null) {
  const [members, setMembers] = useState(MEMBERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // TODO(wave2-auth): Supabase anonymous session token required.
        let raw = [];
        if (groupId) {
          raw = await groupMembersService.list(groupId);
        } else {
          // Fall back to contacts — this gives "people I interact with"
          raw = await contactsService.list({ sort: 'recent', limit: 12 });
        }

        if (cancelled) return;
        if (!Array.isArray(raw) || raw.length === 0) {
          // Keep static fallback
          setLoading(false);
          return;
        }

        const mapped = raw.map((m, idx) => {
          const name = m.display_name ?? m.member_name ?? m.contact_user?.display_name ?? 'Anggota';
          return {
            initials: initials(name),
            name,
            status: m.payment_status === 'confirmed' ? 'paid' : m.is_recipient ? 'giliran' : 'unpaid',
            statusText: m.is_recipient
              ? 'Giliran bulan ini!'
              : m.payment_status === 'confirmed'
              ? 'Sudah lunas'
              : 'Belum bayar',
            sub: m.is_recipient
              ? 'Penerima putaran ini'
              : m.payment_status === 'confirmed'
              ? 'Sudah bayar'
              : 'Ingatkan?',
            color: FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
          };
        });

        setMembers(mapped);
      } catch (err) {
        if (cancelled) return;
        console.error('[useMembers] failed to load, using static fallback:', err.message);
        setError(err.message);
        // Keep static fallback from useState init
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [groupId]);

  // Always expose the DANCE_PARAMS so MembersOrbit can slice as needed
  return { members, danceParams: DANCE_PARAMS, loading, error };
}

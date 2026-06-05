// ─────────────────────────────────────────────────────────────
// In-memory mock data layer for the v1 prototype screens.
//
// These pages are kept as a self-contained UI prototype with NO
// backend. This module mirrors the API surface the v1 pages used to
// import from ../../../lib/data (and the auth/account-prompt hooks),
// but everything is backed by a mutable in-memory store — no Supabase,
// no network. Mutations persist for the lifetime of the page session.
// ─────────────────────────────────────────────────────────────
import { useCallback, useState } from "react";

// ── helpers ───────────────────────────────────────────────────
const ME = "me-user";

const toISODate = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

function addPeriod(startDate, frequency, n) {
  const d = new Date(startDate);
  if (frequency === "weekly") d.setDate(d.getDate() + 7 * n);
  else d.setMonth(d.getMonth() + n);
  return d;
}

let idCounter = 100;
const nextId = (prefix) => `${prefix}${++idCounter}`;

// Tracks whether the user has created any arisan/patungan yet — drives the
// deferred-registration nudge. Kept local (localStorage), not a backend call.
const HAS_CREATED_KEY = "ad_has_created";
export function hasCreatedSomething() {
  try { return localStorage.getItem(HAS_CREATED_KEY) === "1"; } catch { return false; }
}
function markHasCreated() {
  try { localStorage.setItem(HAS_CREATED_KEY, "1"); } catch { /* ignore */ }
}

// ── seed store ────────────────────────────────────────────────
function seedGroups() {
  return [
    {
      id: "g1",
      name: "Arisan Kantor Lt. 3",
      description: "Arisan rekan kerja lantai 3",
      amount: 500000,
      frequency: "Bulanan",
      frequencyRaw: "monthly",
      method: "Manual",
      methodRaw: "manual",
      members: 5,
      totalRounds: 5,
      currentRound: 2,
      status: "active",
      badgeStatus: "menunggu",
      isAdmin: true,
      startDate: "2026-01-05",
      nextDate: new Date("2026-02-05"),
      nextRecipient: "Budi",
      memberList: [
        { id: "g1m1", member_name: "Saya", giliran_order: 1, user_id: ME },
        { id: "g1m2", member_name: "Budi", giliran_order: 2, user_id: null },
        { id: "g1m3", member_name: "Sari", giliran_order: 3, user_id: null },
        { id: "g1m4", member_name: "Andi", giliran_order: 4, user_id: null },
        { id: "g1m5", member_name: "Maya", giliran_order: 5, user_id: null },
      ],
      rounds: [
        { id: "g1r1", round_number: 1, recipient_name: "Saya", scheduled_date: "2026-01-05", status: "completed" },
        { id: "g1r2", round_number: 2, recipient_name: "Budi", scheduled_date: "2026-02-05", status: "active" },
        { id: "g1r3", round_number: 3, recipient_name: "Sari", scheduled_date: "2026-03-05", status: "upcoming" },
        { id: "g1r4", round_number: 4, recipient_name: "Andi", scheduled_date: "2026-04-05", status: "upcoming" },
        { id: "g1r5", round_number: 5, recipient_name: "Maya", scheduled_date: "2026-05-05", status: "upcoming" },
      ],
      payments: [
        { round_id: "g1r2", payer_name: "Saya", status: "confirmed" },
        { round_id: "g1r2", payer_name: "Sari", status: "confirmed" },
        { round_id: "g1r2", payer_name: "Andi", status: "rejected" },
        { round_id: "g1r2", payer_name: "Budi", status: "pending" },
      ],
    },
    {
      id: "g2",
      name: "Arisan Keluarga",
      description: "Arisan keluarga besar",
      amount: 300000,
      frequency: "Bulanan",
      frequencyRaw: "monthly",
      method: "Undian Acak",
      methodRaw: "random",
      members: 4,
      totalRounds: 4,
      currentRound: 1,
      status: "active",
      badgeStatus: "menunggu",
      isAdmin: false,
      startDate: "2026-01-10",
      nextDate: new Date("2026-01-10"),
      nextRecipient: "Ayah",
      memberList: [
        { id: "g2m1", member_name: "Ayah", giliran_order: 1, user_id: null },
        { id: "g2m2", member_name: "Ibu", giliran_order: 2, user_id: null },
        { id: "g2m3", member_name: "Saya", giliran_order: 3, user_id: ME },
        { id: "g2m4", member_name: "Kakak", giliran_order: 4, user_id: null },
      ],
      rounds: [
        { id: "g2r1", round_number: 1, recipient_name: "Ayah", scheduled_date: "2026-01-10", status: "active" },
        { id: "g2r2", round_number: 2, recipient_name: "Ibu", scheduled_date: "2026-02-10", status: "upcoming" },
        { id: "g2r3", round_number: 3, recipient_name: "Saya", scheduled_date: "2026-03-10", status: "upcoming" },
        { id: "g2r4", round_number: 4, recipient_name: "Kakak", scheduled_date: "2026-04-10", status: "upcoming" },
      ],
      payments: [],
    },
  ];
}

function makeBill({ id, title, category, total, method, methodRaw, status, splits }) {
  const paid = splits.filter((s) => s.is_settled || s.is_payer).reduce((sum, s) => sum + Number(s.amount_owed), 0);
  return {
    id,
    title,
    category,
    total,
    method,
    methodRaw,
    participants: splits.map((s) => s.participant_name),
    splits,
    paid,
    progress: total ? Math.round((paid / total) * 100) : 0,
    status,
    isPayer: true,
  };
}

function seedBills() {
  return [
    makeBill({
      id: "b1",
      title: "Makan malam Restoran Padang",
      category: "makanan",
      total: 480000,
      method: "Sama Rata",
      methodRaw: "equal",
      status: "open",
      splits: [
        { id: "b1s1", participant_name: "Saya", amount_owed: 120000, is_payer: true, is_settled: true },
        { id: "b1s2", participant_name: "Budi", amount_owed: 120000, is_payer: false, is_settled: true },
        { id: "b1s3", participant_name: "Sari", amount_owed: 120000, is_payer: false, is_settled: false },
        { id: "b1s4", participant_name: "Andi", amount_owed: 120000, is_payer: false, is_settled: false },
      ],
    }),
    makeBill({
      id: "b2",
      title: "Tiket Konser",
      category: "hiburan",
      total: 600000,
      method: "Sama Rata",
      methodRaw: "equal",
      status: "settled",
      splits: [
        { id: "b2s1", participant_name: "Saya", amount_owed: 200000, is_payer: true, is_settled: true },
        { id: "b2s2", participant_name: "Maya", amount_owed: 200000, is_payer: false, is_settled: true },
        { id: "b2s3", participant_name: "Andi", amount_owed: 200000, is_payer: false, is_settled: true },
      ],
    }),
  ];
}

const store = {
  profile: { name: "Tamu", phone: null },
  groups: seedGroups(),
  bills: seedBills(),
};

const ok = (value) => Promise.resolve(value);
const clone = (v) => JSON.parse(JSON.stringify(v));

// ── groups ────────────────────────────────────────────────────
export function listGroups() {
  return ok(store.groups.map((g) => clone(g)));
}

export function getGroup(id) {
  const g = store.groups.find((x) => x.id === id);
  if (!g) return ok(null);
  return ok(clone(g));
}

export function createGroup(input) {
  const id = nextId("g");
  const memberNames = ["Saya", ...input.members.map((n) => n.trim()).filter(Boolean)];
  const totalRounds = memberNames.length;
  const order = input.method === "random" ? [...memberNames].sort(() => 0.5 - Math.random()) : memberNames;

  const group = {
    id,
    name: input.name,
    description: input.description || "",
    amount: Math.round(input.amount),
    frequency: input.frequency === "weekly" ? "Mingguan" : "Bulanan",
    frequencyRaw: input.frequency,
    method: input.method === "random" ? "Undian Acak" : "Manual",
    methodRaw: input.method,
    members: totalRounds,
    totalRounds,
    currentRound: 1,
    status: "active",
    badgeStatus: "menunggu",
    isAdmin: true,
    startDate: toISODate(input.startDate),
    nextDate: new Date(input.startDate),
    nextRecipient: order[0],
    memberList: memberNames.map((name, i) => ({
      id: `${id}m${i + 1}`,
      member_name: name,
      giliran_order: i + 1,
      user_id: i === 0 ? ME : null,
    })),
    rounds: order.map((name, i) => ({
      id: `${id}r${i + 1}`,
      round_number: i + 1,
      recipient_name: name,
      scheduled_date: toISODate(addPeriod(input.startDate, input.frequency, i)),
      status: i === 0 ? "active" : "upcoming",
    })),
    payments: [],
  };
  store.groups.unshift(group);
  markHasCreated();
  return ok(id);
}

export function deleteGroup(id) {
  store.groups = store.groups.filter((g) => g.id !== id);
  return ok();
}

export function setPayment({ roundId, payerName, status }) {
  const group = store.groups.find((g) => g.rounds.some((r) => r.id === roundId));
  if (!group) return ok();
  const existing = group.payments.find((p) => p.round_id === roundId && p.payer_name === payerName);
  if (existing) existing.status = status;
  else group.payments.push({ round_id: roundId, payer_name: payerName, status });
  return ok();
}

export function completeRound(groupId, roundId) {
  const group = store.groups.find((g) => g.id === groupId);
  if (!group) return ok();
  const idx = group.rounds.findIndex((r) => r.id === roundId);
  if (idx === -1) return ok();
  group.rounds[idx].status = "completed";
  const next = group.rounds[idx + 1];
  if (next) {
    next.status = "active";
    group.currentRound = next.round_number;
    group.nextDate = new Date(next.scheduled_date);
    group.nextRecipient = next.recipient_name;
  } else {
    group.status = "completed";
    group.badgeStatus = "selesai";
    group.currentRound = group.totalRounds;
    group.nextDate = null;
    group.nextRecipient = null;
  }
  return ok();
}

// ── bills (patungan) ──────────────────────────────────────────
export function listBills() {
  const enriched = store.bills.map((b) => clone(b));
  return ok({
    asPayer: enriched.filter((b) => b.isPayer),
    asDebtor: enriched.filter((b) => !b.isPayer),
  });
}

export function getBill(id) {
  const b = store.bills.find((x) => x.id === id);
  return ok(b ? clone(b) : null);
}

export function computeEqualSplit(total, names) {
  const n = names.length;
  if (n === 0) return [];
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  return names.map((name, i) => ({ name, amount: base + (i < remainder ? 1 : 0) }));
}

export function createBill(input) {
  const id = nextId("b");
  const names = input.participants.map((p) => p.name.trim()).filter(Boolean);
  const splitAmounts = input.method === "exact"
    ? input.participants.map((p) => ({ name: p.name.trim(), amount: Math.round(p.amount || 0) }))
    : computeEqualSplit(Math.round(input.total), names);

  const splits = splitAmounts.map((s, i) => ({
    id: `${id}s${i + 1}`,
    participant_name: s.name,
    amount_owed: s.amount,
    is_payer: s.name === "Saya",
    is_settled: s.name === "Saya",
  }));

  const bill = makeBill({
    id,
    title: input.title,
    category: input.category,
    total: Math.round(input.total),
    method: input.method === "exact" ? "Nominal Pas" : "Sama Rata",
    methodRaw: input.method,
    status: "open",
    splits,
  });
  store.bills.unshift(bill);
  markHasCreated();
  return ok(id);
}

export function toggleSplitSettled(splitId, settled) {
  for (const b of store.bills) {
    const s = b.splits.find((x) => x.id === splitId);
    if (s) { s.is_settled = settled; break; }
  }
  return ok();
}

export function refreshBillStatus(billId) {
  const b = store.bills.find((x) => x.id === billId);
  if (!b) return ok();
  b.paid = b.splits.filter((s) => s.is_settled || s.is_payer).reduce((sum, s) => sum + Number(s.amount_owed), 0);
  b.progress = b.total ? Math.round((b.paid / b.total) * 100) : 0;
  b.status = b.splits.length && b.splits.every((s) => s.is_settled) ? "settled" : "open";
  return ok();
}

export function deleteBill(id) {
  store.bills = store.bills.filter((b) => b.id !== id);
  return ok();
}

// ── bayar (payments) view ─────────────────────────────────────
const statusOf = (group, roundId, name) => {
  const p = group.payments.find((x) => x.round_id === roundId && x.payer_name === name);
  if (!p) return "menunggu";
  if (p.status === "confirmed") return "lunas";
  if (p.status === "rejected") return "terlambat";
  return "menunggu";
};

export function getBayarData() {
  const active = store.groups.filter((g) => g.status !== "completed" && g.nextDate);
  const myBills = [];
  const adminPayments = [];

  for (const g of active) {
    const round = g.rounds.find((r) => r.status === "active");
    if (!round) continue;
    const myMember = g.memberList.find((m) => m.user_id === ME);
    const myName = myMember?.member_name || "Saya";

    const myStatus = statusOf(g, round.id, myName);
    if (myStatus !== "lunas") {
      myBills.push({
        groupId: g.id, roundId: round.id, group: g.name, round: round.round_number,
        amount: g.amount, due: new Date(round.scheduled_date), status: myStatus, payerName: myName,
      });
    }

    if (g.isAdmin) {
      for (const m of g.memberList) {
        const name = m.member_name || "Anggota";
        adminPayments.push({
          id: `${round.id}:${name}`, groupId: g.id, roundId: round.id, group: g.name,
          member: name, round: round.round_number, amount: g.amount, status: statusOf(g, round.id, name),
        });
      }
    }
  }
  return ok({ myBills, adminPayments });
}

// ── dashboard aggregate ───────────────────────────────────────
export function getDashboard() {
  const groups = store.groups.map((g) => clone(g));
  const myBills = groups
    .filter((g) => g.nextDate)
    .map((g) => ({
      groupId: g.id, group: g.name, round: g.currentRound,
      amount: g.amount, due: new Date(g.nextDate), status: "menunggu",
    }))
    .sort((a, b) => a.due - b.due);

  const openBills = store.bills.filter((b) => b.isPayer && b.status === "open");
  const owedToMe = openBills.reduce(
    (sum, b) => sum + b.splits.filter((s) => !s.is_settled && !s.is_payer).reduce((x, s) => x + Number(s.amount_owed), 0),
    0,
  );

  return ok({
    groups,
    myBills,
    openBillCount: openBills.length,
    owedToMe,
    nextArisanAmount: myBills[0]?.amount ?? 0,
    nextArisanDate: myBills[0]?.due ?? null,
  });
}

// ── auth / account-prompt stubs (no backend) ──────────────────
// Local replacements for useAuth / useAccountPrompt so the v1 pages
// stay fully decoupled from Supabase auth.
export function useAuth() {
  const [profile, setProfile] = useState(store.profile);
  const updateProfile = useCallback(async (updates) => {
    store.profile = { ...store.profile, ...updates };
    setProfile(store.profile);
  }, []);
  const signOut = useCallback(async () => { /* no-op */ }, []);
  return { user: null, profile, isAnonymous: true, updateProfile, signOut };
}

export function useAccountPrompt() {
  return { promptRegister: () => { /* no-op in prototype */ } };
}

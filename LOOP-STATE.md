# Loop Engineering — Run State

Persistent state for autonomous loop iterations (per Addy Osmani, "Loop Engineering").
The model forgets between runs, so memory lives here on disk. Each iteration appends
a dated entry: what was discovered, who made the change, who independently verified it.

The invariant: **the checker is a separate agent from the maker.** The author never grades its own work.

---

## Iteration 1 — 2026-06-15 — Service endpoint drift

- **Discover:** `MVP-PUNCHLIST.md` (dated 2026-06-08) flagged "Service endpoint drift" in
  `frontend/src/services/groups.service.js` — stale invites / rounds / giliran paths that
  compile but 404 at runtime.
- **Delegate (maker):** investigated all 19 HTTP calls against the real NestJS controller
  decorators under `backend/src/`. Found **no edits needed** — the drift was already
  reconciled (likely by commit `d72ab3f "change service to frontend only"`). Build passes.
- **Verify (independent checker):** prompted adversarially to *refute* the all-clear.
  Could not. Verdict **CONFIRMED_CLEAN** — every call maps to a real route (correct method,
  path, param position), global prefix `app.setGlobalPrefix('api')` correctly lives in the
  API client base URL, all three punchlist drift items are on the fixed side.
- **Outcome:** No code change. The punchlist item is **stale and resolved** — drop the
  "Service endpoint drift" follow-up from the Wave 1 list.
- **Residual finding (checker-only, non-blocking):** `frontend/.env.example:7` shows
  `VITE_API_URL` *without* the `/api` suffix, contradicting the `.env` comment that says it
  must include it. Documentation inconsistency only — no runtime impact. → candidate for
  Iteration 2.

---

## Backlog (discovered, not yet looped)

- [ ] `.env.example` `/api` suffix doc inconsistency (S) — from Iteration 1 checker.
- [ ] "Daftar Sekarang" button copy change — awaiting the user's chosen replacement text
      (`frontend/src/components/auth/RegisterForm.jsx:91`, `frontend/src/pages/LoginOrRegister.jsx:347`).

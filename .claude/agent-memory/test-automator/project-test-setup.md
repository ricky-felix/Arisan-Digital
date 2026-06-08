---
name: project-test-setup
description: Frontend unit test infra — framework, runner, commands, and key patterns for Arisan Digital
metadata:
  type: project
---

Test runner: **Vitest 4** + jsdom, configured in `frontend/vite.config.js` (test block). Globals are enabled (describe/it/expect/vi without imports). Setup file at `frontend/src/test/setup.js` loads jest-dom and calls cleanup().

**Commands:**
- `npm test` — watch mode
- `npm run test:run` — single run
- `npm run test:coverage` — coverage (v8)

**Conventions established:**
- Tests co-located next to source: `formatRupiah.js` → `formatRupiah.test.js`
- For components: `ScreenHeader.jsx` → `ScreenHeader.test.jsx` beside the component
- Services are thin wrappers over `api.js` — mock `'../lib/api'` with `{ api: { get, post, patch, put, delete: vi.fn() } }`
- Supabase is mocked via `vi.mock('../lib/supabase', ...)`; the mock needs to include `onAuthStateChange` returning a subscription with `unsubscribe`
- Framer Motion mock for Toast/animation tests: mock `'framer-motion'` with `AnimatePresence` as passthrough and `motion.div` as a plain div

**Known gotcha — ToastContext:**
Do NOT use `userEvent.setup({ advanceTimers })` with `vi.useFakeTimers()` inside individual tests — it causes 5 s timeouts. Use `fireEvent.click` + `act(() => { vi.advanceTimersByTime(...) })` instead.

**Known gotcha — AuthContext "throws outside provider":**
React prints two `console.error` lines when a component throws outside an error boundary. These are cosmetic — the test PASSES. Suppress with `vi.spyOn(console, 'error').mockImplementation(() => {})` in a try/finally.

**Coverage baseline (first run 2026-06-08):**
- Statements: 88% (367/417)
- Branches: 84.61% (209/247)
- Functions: 77.01% (124/161)
- Lines: 88.94% (338/380)
- 240 tests across 18 test files, duration ~2 s

**Why:** [[project-context]]

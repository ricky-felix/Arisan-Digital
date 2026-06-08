/**
 * screens.spec.js — Smoke tests for the unguarded /screens/* DEV routes.
 *
 * In development mode, App.jsx registers /screens/<name> routes that render
 * v2 screens WITHOUT auth, AppGate, or AppLayout. These are perfect for
 * fast, reliable e2e smoke tests because they don't require Supabase.
 *
 * Covered screens:
 *   /screens/beranda        — HomeDeck with live API data fallback
 *   /screens/beranda-kosong — HomeDeck with empty cards prop
 *   /screens/notifikasi     — Notifikasi screen
 *   /screens/dompet         — Dompet screen
 *   /screens/anggota        — MembersOrbit screen
 *   /screens/grup           — GroupDetail screen
 *   /screens/profil         — Profil screen
 *   /screens/buat-arisan    — BuatArisan form
 *   /screens/buat-patungan  — BuatPatungan form
 *   /screens/bukti          — BuktiTransfer screen
 *
 * NOTE: Supabase hooks in these screens may fire and fail silently — the
 * screens are designed to fall back to static data (see ALL_CARDS, INVITE
 * in data.js). We assert on visible static content, not live API data.
 */

import { test, expect } from "playwright/test";

// These routes are unguarded — no auth storage state needed.
// Override to empty so these tests run without Supabase session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("/screens/* dev routes (no auth required)", () => {
  // Seed coach-mark key before each test so HomeDeck renders fully.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("arisan.v2.coachSeen", "1");
      localStorage.setItem("arisan_app_access", "1");
    });
  });

  test("/screens/beranda — HomeDeck renders with cards", async ({ page }) => {
    await page.goto("/screens/beranda");
    // The v2 screen wrapper must be present
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    // On mobile (390px) the SegFilter shows a collapsible dropdown trigger.
    // The trigger button text is the current filter label ("Semua" by default).
    // Use the mobile collapse trigger (.seg-trigger) which is always visible.
    await expect(page.locator(".seg-trigger")).toBeVisible();
    // Card deck renders — the compose FAB is always present
    await expect(page.getByText(/mulai sesuatu baru/i)).toBeVisible();
  });

  test("/screens/beranda-kosong — HomeDeck renders empty state", async ({ page }) => {
    await page.goto("/screens/beranda-kosong");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    // Empty state text from EmptyCard component
    await expect(page.getByText(/belum ada|mulai|buat arisan|buat patungan/i).first()).toBeVisible();
  });

  test("/screens/notifikasi — Notifikasi screen renders", async ({ page }) => {
    await page.goto("/screens/notifikasi");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    // Page heading or section header
    await expect(page.getByText(/notifikasi/i).first()).toBeVisible();
  });

  test("/screens/dompet — Dompet screen renders", async ({ page }) => {
    await page.goto("/screens/dompet");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/dompet/i).first()).toBeVisible();
  });

  test("/screens/anggota — MembersOrbit screen renders", async ({ page }) => {
    await page.goto("/screens/anggota");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/anggota|member/i).first()).toBeVisible();
  });

  test("/screens/grup — GroupDetail screen renders", async ({ page }) => {
    await page.goto("/screens/grup");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    // GroupDetail shows group name or a detail label
    await expect(page.getByText(/arisan|grup|detail/i).first()).toBeVisible();
  });

  test("/screens/profil — Profil screen renders", async ({ page }) => {
    await page.goto("/screens/profil");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/profil/i).first()).toBeVisible();
  });

  test("/screens/buat-arisan — BuatArisan form renders", async ({ page }) => {
    await page.goto("/screens/buat-arisan");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    // ScreenHeader renders the "Buat Arisan" title
    await expect(page.getByText(/buat arisan/i)).toBeVisible();
    // The Nama Arisan input — actual placeholder is "Contoh: Arisan Kantor Lt. 3"
    await expect(page.getByPlaceholder(/contoh.*arisan kantor/i)).toBeVisible();
  });

  test("/screens/buat-patungan — BuatPatungan form renders", async ({ page }) => {
    await page.goto("/screens/buat-patungan");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/buat patungan/i)).toBeVisible();
    // Title input — actual placeholder is "Contoh: Makan malam Restoran Padang"
    await expect(page.getByPlaceholder(/contoh.*makan malam/i)).toBeVisible();
  });

  test("/screens/bukti — BuktiTransfer screen renders", async ({ page }) => {
    await page.goto("/screens/bukti");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/bukti|transfer/i).first()).toBeVisible();
  });
});

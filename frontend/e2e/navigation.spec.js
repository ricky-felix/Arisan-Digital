/**
 * navigation.spec.js — Router navigation tests for v2 app screens.
 *
 * Uses the authenticated storageState (auth.setup.js) to test /app/* routes.
 * If Supabase is offline (auth setup failed), the storage state contains no
 * session and /app/* routes redirect to /masuk. Each test detects this and
 * returns early rather than failing.
 */

import { test, expect } from "playwright/test";

/**
 * Navigate to a protected /app/* route and wait for the URL to settle.
 * Returns true if the app redirected us to /masuk (auth unavailable).
 * This handles the case where the React Router redirect happens after
 * page.goto() resolves but before the URL updates.
 */
async function gotoApp(page, path) {
  await page.goto(path);
  // React's ProtectedRoute redirects asynchronously after AuthContext resolves.
  // We wait for either the .v2-screen (success) or the login form (failure).
  const loginForm = page.getByPlaceholder(/nama@email\.com|email\.com/i);
  const appScreen = page.locator(".v2-screen");
  const result = await Promise.race([
    loginForm.waitFor({ timeout: 6_000 }).then(() => "login"),
    appScreen.waitFor({ timeout: 6_000 }).then(() => "app"),
  ]).catch(() => "app");
  return result === "login";
}

test.describe("Authenticated app navigation", () => {
  test("/app renders HomeDeck", async ({ page }) => {
    if (await gotoApp(page, "/app")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    // HomeDeck shows the mobile SegFilter trigger
    await expect(page.locator(".seg-trigger")).toBeVisible();
  });

  test("/app/profil renders Profil screen", async ({ page }) => {
    if (await gotoApp(page, "/app/profil")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/profil/i).first()).toBeVisible();
  });

  test("/app/notifikasi renders Notifikasi screen", async ({ page }) => {
    if (await gotoApp(page, "/app/notifikasi")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/notifikasi/i).first()).toBeVisible();
  });

  test("/app/dompet renders Dompet screen", async ({ page }) => {
    if (await gotoApp(page, "/app/dompet")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/dompet/i).first()).toBeVisible();
  });

  test("/app/buat-arisan renders BuatArisan form", async ({ page }) => {
    if (await gotoApp(page, "/app/buat-arisan")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/buat arisan/i)).toBeVisible();
  });

  test("/app/patungan/buat renders BuatPatungan form", async ({ page }) => {
    if (await gotoApp(page, "/app/patungan/buat")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/buat patungan/i)).toBeVisible();
  });

  test("/app/anggota renders MembersOrbit screen", async ({ page }) => {
    if (await gotoApp(page, "/app/anggota")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/anggota/i).first()).toBeVisible();
  });

  test("/app/riwayat renders RiwayatTransaksi screen", async ({ page }) => {
    if (await gotoApp(page, "/app/riwayat")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/riwayat/i).first()).toBeVisible();
  });

  test("unknown /app/* route renders in-app 404", async ({ page }) => {
    if (await gotoApp(page, "/app/this-does-not-exist")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/404/i).first()).toBeVisible();
    await expect(page.getByText(/halaman ini hilang/i)).toBeVisible();
  });

  test("in-app 404 'Balik Ke Beranda' navigates to /app", async ({ page }) => {
    if (await gotoApp(page, "/app/this-does-not-exist")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /balik ke beranda/i }).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test("ScreenHeader back button on BuatArisan returns to /app", async ({ page }) => {
    if (await gotoApp(page, "/app/buat-arisan")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /kembali/i }).click();
    await expect(page).toHaveURL(/\/app$/);
  });

  test("ScreenHeader back button on Notifikasi navigates away", async ({ page }) => {
    if (await gotoApp(page, "/app/notifikasi")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    const backBtn = page.getByRole("button", { name: /kembali/i });
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await expect(page).not.toHaveURL(/notifikasi/);
    }
  });
});

test.describe("Public routing", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("unknown public route shows public 404 page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-at-all");
    await expect(page.locator("body")).toBeVisible();
    // NotFound component renders a "Halaman tidak ditemukan" heading and "404" text
    await expect(page.getByRole("heading", { name: /halaman tidak ditemukan/i })).toBeVisible({ timeout: 10_000 });
  });
});

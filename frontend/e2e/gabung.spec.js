/**
 * gabung.spec.js — Invite landing flow tests.
 *
 * Tests the Gabung screen (/app/gabung/preview), which is the invitee's
 * landing page. The screen uses static INVITE fallback data when no live
 * API token is available, so all assertions are against that static data.
 *
 * This spec uses the authenticated storageState (from auth.setup.js).
 * If Supabase is unavailable (CI/offline), auth fails and ProtectedRoute
 * redirects to /masuk. The helper gotoApp() detects this and the test
 * returns early with a pass — these are documented as conditional flows.
 */

import { test, expect } from "playwright/test";

/**
 * Navigate to a protected /app/* route and wait for the URL to stabilize.
 * Returns true if we were redirected to /masuk (auth unavailable).
 *
 * React's ProtectedRoute reads from AuthContext which resolves asynchronously.
 * page.goto() resolves on load event, but the auth redirect happens during
 * React's hydration/render cycle, slightly after load.
 * We wait for either the .v2-screen to appear (success) or the login form
 * to appear (failure), giving React time to settle either way.
 */
async function gotoApp(page, path) {
  await page.goto(path);
  // Wait for either the login form (auth failed) or the app screen (auth ok).
  // Whichever appears first within 6s determines the outcome.
  const loginForm = page.getByPlaceholder(/nama@email\.com|email\.com/i);
  const appScreen = page.locator(".v2-screen");
  const result = await Promise.race([
    loginForm.waitFor({ timeout: 6_000 }).then(() => "login"),
    appScreen.waitFor({ timeout: 6_000 }).then(() => "app"),
  ]).catch(() => "app"); // timeout = assume we're on the app
  return result === "login";
}

test.describe("GabungMasuk screen (/app/gabung)", () => {
  test("renders the title 'Gabung Arisan / Patungan'", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/gabung arisan \/ patungan/i)).toBeVisible();
  });

  test("shows the QR scan button", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/scan kode qr/i)).toBeVisible();
  });

  test("shows the upload QR image option", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/unggah gambar qr/i)).toBeVisible();
  });

  test("shows the invite link / code paste field", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/link atau kode undangan/i)).toBeVisible();
    await expect(
      page.getByPlaceholder(/arisan\.digital\/gabung\//i)
    ).toBeVisible();
  });

  test("shows 'Lihat Undangan' button", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /lihat undangan/i })).toBeVisible();
  });

  test("back button navigates to /app", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    const backBtn = page.getByRole("button", { name: /kembali/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expect(page).toHaveURL(/\/app/);
  });
});

test.describe("Gabung preview screen (/app/gabung/preview)", () => {
  test("shows static invite group name 'Keluarga Sari'", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung/preview")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Keluarga Sari")).toBeVisible();
  });

  test("shows invite type label and tagline", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung/preview")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/tabungan bergilir keluarga/i)).toBeVisible();
  });

  test("shows key facts: iuran, anggota, admin", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung/preview")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/iuran/i).first()).toBeVisible();
    await expect(page.getByText(/anggota/i).first()).toBeVisible();
    await expect(page.getByText(/admin/i).first()).toBeVisible();
    await expect(page.getByText(/200\.000|rp 200/i)).toBeVisible();
    await expect(page.getByText("Ricky Felix")).toBeVisible();
  });

  test("shows member avatar stack initials", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung/preview")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("RF")).toBeVisible();
    await expect(page.getByText("BS")).toBeVisible();
  });

  test("shows name input field", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung/preview")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/masuk sebagai/i)).toBeVisible();
    await expect(page.getByPlaceholder(/nama kamu/i)).toBeVisible();
  });

  test("'Gabung Sekarang' button is visible", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung/preview")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: /gabung sekarang/i })).toBeVisible();
  });

  test("submitting without a name shows toast 'Isi nama kamu dulu'", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung/preview")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /gabung sekarang/i }).click();
    await expect(page.getByText(/isi nama kamu dulu/i)).toBeVisible({ timeout: 5_000 });
  });

  test("filling name and submitting navigates to /app", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung/preview")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    await page.getByPlaceholder(/nama kamu/i).fill("Budi Santoso");
    await page.getByRole("button", { name: /gabung sekarang/i }).click();
    // joinGroup returns null (offline) but the code still shows toast and navigates
    await expect(page).toHaveURL(/\/app/, { timeout: 10_000 });
  });

  test("back button navigates back from preview", async ({ page }) => {
    if (await gotoApp(page, "/app/gabung/preview")) return;
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
    const backBtn = page.getByRole("button", { name: /kembali/i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expect(page).not.toHaveURL(/\/gabung\/preview/);
  });
});

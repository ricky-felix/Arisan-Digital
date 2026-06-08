/**
 * auth.setup.js — Global setup: bypass AppGate + Supabase auth for e2e tests.
 *
 * Strategy:
 *  1. Set `arisan_app_access = "1"` in localStorage so <AppGate> opens without
 *     typing the shared access code on every test.
 *  2. Sign in via the /masuk page using the real Supabase test account
 *     (admin@arisandigital.test / Admin123!.) so <ProtectedRoute> passes too.
 *  3. Save the resulting browser storage state to e2e/.auth/user.json, which
 *     all test projects load via `storageState`.
 *
 * If the login attempt fails (offline, wrong creds, expired account) we fall
 * through gracefully — tests that require auth will fail individually, but
 * public-route tests (landing page, /masuk page) will still pass.
 */

import { test as setup, expect } from "playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.join(__dirname, ".auth/user.json");

const TEST_EMAIL = "admin@arisandigital.test";
const TEST_PASSWORD = "Admin123!.";
const APP_ACCESS_CODE = "arisan_patungan_2026";

setup("authenticate and seed app-gate key", async ({ page }) => {
  // ── Step 1: open the login page ──────────────────────────────────────────
  await page.goto("/masuk");
  // The login page has no <h1>; verify the identifier field is visible.
  await expect(page.getByPlaceholder(/nama@email\.com|email\.com/i)).toBeVisible({
    timeout: 10_000,
  });

  // ── Step 2: fill identifier + password ──────────────────────────────────
  // The login form uses a single "Email atau Nomor HP" field then password.
  // InputField renders with the label text; placeholder is "nama@email.com atau 0812..."
  const identifierInput = page.getByPlaceholder(/nama@email\.com|email\.com/i);
  // Password field id is "login-password"
  const passwordInput = page.locator("#login-password");

  await identifierInput.fill(TEST_EMAIL);
  await passwordInput.fill(TEST_PASSWORD);

  // ── Step 3: submit ───────────────────────────────────────────────────────
  // The submit button text is "Masuk" (no spinner yet)
  await page.getByRole("button", { name: "Masuk" }).click();

  // Wait for navigation away from /masuk (redirect to /app) or an error.
  // Give Supabase a generous timeout since it's a network round-trip.
  const loginOk = await Promise.race([
    page.waitForURL("**/app**", { timeout: 15_000 }).then(() => true),
    page
      .getByRole("alert")
      .waitFor({ timeout: 15_000 })
      .then(() => false),
  ]).catch(() => false);

  if (!loginOk) {
    console.warn(
      "[auth.setup] Login did not redirect to /app — Supabase may be unavailable. " +
        "Auth-gated tests will fail; public-route tests will still run."
    );
  }

  // ── Step 4: seed the AppGate key in localStorage ─────────────────────────
  // Even if login failed we set this so at minimum the gate form is bypassed
  // for any dev-route / unguarded tests.
  await page.evaluate((key) => localStorage.setItem("arisan_app_access", "1"), APP_ACCESS_CODE);
  // Mark coach marks as seen so HomeDeck renders without the overlay.
  await page.evaluate(() => localStorage.setItem("arisan.v2.coachSeen", "1"));

  // ── Step 5: persist storage state ───────────────────────────────────────
  await page.context().storageState({ path: AUTH_FILE });
});

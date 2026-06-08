/**
 * landing.spec.js — Public landing page smoke tests.
 *
 * These tests run without auth (the landing page "/" is fully public).
 * They verify the marketing page renders key sections and navigation works.
 */

import { test, expect } from "playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the page without crashing", async ({ page }) => {
    await expect(page).toHaveTitle(/arisan digital/i);
  });

  test("shows the hero section with a CTA button", async ({ page }) => {
    // The hero renders a full-viewport section. The first tab shows "Mulai Sekarang"
    // as a link. Wait for the hero section to appear.
    const heroSection = page.locator('section[aria-label="Hero section"]');
    await expect(heroSection).toBeVisible({ timeout: 10_000 });

    // The active tab's buttons render as <a href="/app"> links.
    const appLink = page.locator('a[href="/app"]').first();
    await expect(appLink).toBeVisible();
  });

  test("navbar is visible and contains the brand logo", async ({ page }) => {
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();
    // The navbar contains the brand logo image (alt text includes "Arisan Digital")
    await expect(nav.getByAltText(/arisan digital/i)).toBeVisible();
  });

  test("shows the FAQ section", async ({ page }) => {
    // Scroll to trigger any lazy rendering
    await page.getByText(/FAQ|pertanyaan/i).first().scrollIntoViewIfNeeded();
    await expect(page.getByText(/FAQ|pertanyaan/i).first()).toBeVisible();
  });

  test("navigating to /masuk from CTA works", async ({ page }) => {
    // The primary CTA links to /app which redirects unauthenticated users to /masuk
    const cta = page.getByRole("link", { name: /mulai sekarang/i }).first();
    await cta.click();
    // Should land on /masuk (login) or /app
    await expect(page).toHaveURL(/\/(masuk|app)/);
  });
});

test.describe("Login page (/masuk)", () => {
  test("renders login form", async ({ page }) => {
    await page.goto("/masuk");
    // The page doesn't use <h1> — the tabs "Masuk"/"Daftar" are buttons.
    // Verify the form card and identifier input are present.
    await expect(page.getByPlaceholder(/nama@email\.com|email\.com/i)).toBeVisible();
    // Password field
    await expect(page.locator("#login-password")).toBeVisible();
    // Submit button
    await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
  });

  test("shows validation error with wrong credentials", async ({ page }) => {
    await page.goto("/masuk");
    await page.getByPlaceholder(/nama@email\.com|email\.com/i).fill("wrong@example.com");
    await page.locator("#login-password").fill("wrongpassword");
    await page.getByRole("button", { name: "Masuk" }).click();

    // An error alert should appear (role=alert or visible error text)
    const errorAlert = page.getByRole("alert");
    await expect(errorAlert).toBeVisible({ timeout: 10_000 });
  });

  test("can toggle to register tab", async ({ page }) => {
    await page.goto("/masuk");
    // Click the "Daftar" tab button
    await page.getByRole("button", { name: "Daftar" }).click();
    // Register form has Nama Lengkap field (id="reg-name", placeholder="Budi Santoso")
    await expect(page.locator("#reg-name")).toBeVisible();
  });

  test("shows password strength meter on register tab", async ({ page }) => {
    await page.goto("/masuk");
    await page.getByRole("button", { name: "Daftar" }).click();
    // The register password field id is "reg-password"
    const pwField = page.locator("#reg-password");
    await pwField.fill("abc");
    // Strength meter (aria-live region) should appear
    await expect(page.getByText(/lemah|sedang|kuat/i)).toBeVisible();
  });
});

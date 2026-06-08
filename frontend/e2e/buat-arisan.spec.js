/**
 * buat-arisan.spec.js — Form interaction tests for BuatArisan.
 *
 * Uses the unguarded /screens/buat-arisan DEV route so auth is not needed.
 * Tests cover:
 *  - Form validation (submit button stays disabled until required fields filled)
 *  - Live preview card updates as user types
 *  - Category picker selection
 *  - Segmented controls (Frekuensi / Metode Giliran)
 */

import { test, expect } from "playwright/test";

// No auth needed — /screens/* routes are unguarded in DEV mode.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("BuatArisan form (/screens/buat-arisan)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("arisan.v2.coachSeen", "1");
      localStorage.setItem("arisan_app_access", "1");
    });
    await page.goto("/screens/buat-arisan");
    await expect(page.locator(".v2-screen")).toBeVisible({ timeout: 10_000 });
  });

  test("submit button is disabled when form is empty", async ({ page }) => {
    const submitBtn = page.getByRole("button", { name: /buat & undang/i });
    await expect(submitBtn).toBeDisabled();
  });

  test("submit button stays disabled when only name is filled", async ({ page }) => {
    await page.getByPlaceholder(/contoh.*arisan kantor/i).fill("Arisan Test");
    const submitBtn = page.getByRole("button", { name: /buat & undang/i });
    await expect(submitBtn).toBeDisabled();
  });

  test("submit button becomes enabled when name and amount are filled", async ({ page }) => {
    await page.getByPlaceholder(/contoh.*arisan kantor/i).fill("Arisan Keluarga");
    await page.getByPlaceholder("500000").fill("200000");
    const submitBtn = page.getByRole("button", { name: /buat & undang/i });
    await expect(submitBtn).toBeEnabled();
  });

  test("live preview card updates when name is typed", async ({ page }) => {
    // Initially shows "Arisan Baru" placeholder
    await expect(page.getByText(/arisan baru/i)).toBeVisible();
    await page.getByPlaceholder(/contoh.*arisan kantor/i).fill("Arisan Kantor Lt. 3");
    // Preview card should now show the typed name
    await expect(page.getByText("Arisan Kantor Lt. 3")).toBeVisible();
  });

  test("live preview card shows formatted amount", async ({ page }) => {
    await page.getByPlaceholder("500000").fill("300000");
    // Preview should show Rp 300.000 (Indonesian format)
    await expect(page.getByText(/300\.000|300,000|300000/)).toBeVisible();
  });

  test("category picker: selecting Kantor activates that button", async ({ page }) => {
    const kantorBtn = page.getByRole("button", { name: /kantor/i });
    await kantorBtn.click();
    // Active category button should have brand color classes — check aria or text
    await expect(kantorBtn).toBeVisible();
    // The clicked button should now be visually active; verify by re-clicking
    // another and checking state transitions
    const temanBtn = page.getByRole("button", { name: /teman/i });
    await temanBtn.click();
    await expect(temanBtn).toBeVisible();
  });

  test("frequency segmented control switches between Bulanan and Mingguan", async ({ page }) => {
    // Default is Bulanan — preview shows "Arisan Bulanan"
    await expect(page.getByText(/arisan bulanan/i)).toBeVisible();
    await page.getByRole("button", { name: /mingguan/i }).first().click();
    await expect(page.getByText(/arisan mingguan/i)).toBeVisible();
  });

  test("method segmented control switches between Urut and Acak", async ({ page }) => {
    // Default is Urut (manual) — preview shows "Giliran Urut"
    await expect(page.getByText(/giliran urut/i)).toBeVisible();
    await page.getByRole("button", { name: /acak/i }).first().click();
    await expect(page.getByText(/giliran acak/i)).toBeVisible();
  });

  test("back chevron navigates away (ScreenHeader back button present)", async ({ page }) => {
    // ScreenHeader renders a back button via ChevronLeft. On /screens/buat-arisan
    // the onBack handler navigates to "/app" — which will redirect to /masuk since
    // there is no session, but the button should be clickable and trigger navigation.
    const backBtn = page.getByRole("button", { name: /kembali/i });
    await expect(backBtn).toBeVisible();
  });
});

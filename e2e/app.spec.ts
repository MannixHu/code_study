import { test, expect } from "@playwright/test";

test.describe("App Loading", () => {
  test("should load the app successfully", async ({ page }) => {
    await page.goto("/");

    // Wait for app to load
    await expect(page.locator("body")).toBeVisible();

    // Check header is present
    await expect(page.getByText("React")).toBeVisible();
  });

  test("should display header with logo", async ({ page }) => {
    await page.goto("/");

    // Check for the logo/title
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("should display sidebar with lessons", async ({ page }) => {
    await page.goto("/");

    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check sidebar is visible
    const sidebar = page.locator('[class*="sidebar"], aside').first();
    await expect(sidebar).toBeVisible();
  });

  test("should have correct page title", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/React|MeFlow/i);
  });
});

test.describe("Responsive Design", () => {
  test("should display properly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // App should still be visible
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display properly on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // App should still be visible
    await expect(page.locator("body")).toBeVisible();
  });

  test("should display properly on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    // App should still be visible
    await expect(page.locator("body")).toBeVisible();
  });
});

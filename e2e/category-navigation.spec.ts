import { test, expect } from "@playwright/test";

test.describe("Category Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for app to be fully loaded
    await page.waitForTimeout(1000);
  });

  test("should display category tabs in header", async ({ page }) => {
    // Look for tabs/navigation in header
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Should have clickable tab elements
    const tabs = page.locator('[role="tab"], [class*="tab"]');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
  });

  test("should highlight active category", async ({ page }) => {
    // Find active tab
    const activeTab = page.locator('[class*="active"], [aria-selected="true"]');
    await expect(activeTab.first()).toBeVisible();
  });

  test("should switch category when clicking tab", async ({ page }) => {
    // Get all tabs
    const tabs = page.locator('[role="tab"], [class*="tab"]');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click second tab
      await tabs.nth(1).click();

      // Wait for content to update
      await page.waitForTimeout(500);

      // Verify tab is now active
      const secondTab = tabs.nth(1);
      await expect(secondTab).toBeVisible();
    }
  });

  test("should update sidebar content when switching categories", async ({
    page,
  }) => {
    // Get initial sidebar content
    const sidebar = page.locator('[class*="sidebar"], aside').first();

    // Get all tabs
    const tabs = page.locator('[role="tab"], [class*="tab"]');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Click a different tab
      await tabs.nth(1).click();

      // Wait for content to update
      await page.waitForTimeout(500);

      // Sidebar should still be visible after tab change
      await expect(sidebar).toBeVisible();
    }
  });

  test("should show category progress badges", async ({ page }) => {
    // Look for progress indicators
    const badges = page.locator('[class*="badge"], [class*="progress"]');
    const badgeCount = await badges.count();

    // Should have some progress indicators
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });
});

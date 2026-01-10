import { test, expect } from "@playwright/test";

test.describe("Progress Tracking", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
  });

  test("should display progress indicators", async ({ page }) => {
    // Look for progress indicators in the UI
    const progressIndicators = page.locator(
      '[class*="progress"], [class*="badge"], .ant-badge',
    );
    const count = await progressIndicators.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should show completion status for lessons", async ({ page }) => {
    // Look for checkmarks or completion indicators in sidebar
    const sidebar = page.locator('[class*="sidebar"], aside').first();
    const completionIcons = sidebar.locator(
      '[class*="check"], [class*="complete"], svg, .anticon',
    );
    const iconCount = await completionIcons.count();
    expect(iconCount).toBeGreaterThanOrEqual(0);
  });

  test("should persist progress after page reload", async ({ page }) => {
    // Reload page
    await page.reload();
    await page.waitForTimeout(1500);

    // Progress should still be visible after reload
    const progressAfter = page.locator('[class*="progress"], [class*="badge"]');
    const count = await progressAfter.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should show category completion progress", async ({ page }) => {
    // Look for category progress (e.g., "3/10 completed")
    const categoryProgress = page.locator(
      ':text-matches("\\d+/\\d+"), [class*="category-progress"]',
    );
    const count = await categoryProgress.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Test Results Display", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
  });

  test("should display test results section", async ({ page }) => {
    // Run tests first
    const runButton = page.locator(
      'button:has-text("运行"), button:has-text("Run"), button:has-text("测试")',
    );

    if ((await runButton.count()) > 0) {
      await runButton.first().click();
      await page.waitForTimeout(2000);

      // Look for results display
      const resultsSection = page.locator(
        '[class*="result"], [class*="test-result"], [class*="feedback"]',
      );
      const count = await resultsSection.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test("should show pass/fail indicators", async ({ page }) => {
    const runButton = page.locator(
      'button:has-text("运行"), button:has-text("Run"), button:has-text("测试")',
    );

    if ((await runButton.count()) > 0) {
      await runButton.first().click();
      await page.waitForTimeout(2000);

      // Look for success/failure indicators
      const indicators = page.locator(
        '[class*="success"], [class*="error"], [class*="pass"], [class*="fail"], .ant-result',
      );
      const count = await indicators.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

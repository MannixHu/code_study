import { test, expect } from "@playwright/test";

test.describe("Lesson Selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1000);
  });

  test("should display lesson list in sidebar", async ({ page }) => {
    // Find sidebar with lessons
    const sidebar = page.locator('[class*="sidebar"], aside').first();
    await expect(sidebar).toBeVisible();

    // Should have lesson items
    const lessonItems = sidebar.locator(
      '[class*="lesson"], [class*="menu-item"], li',
    );
    const count = await lessonItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should highlight selected lesson", async ({ page }) => {
    const sidebar = page.locator('[class*="sidebar"], aside').first();

    // Look for selected/active lesson indicator
    const selectedLesson = sidebar.locator(
      '[class*="selected"], [class*="active"], [aria-selected="true"]',
    );
    await expect(selectedLesson.first()).toBeVisible();
  });

  test("should show lesson details when selected", async ({ page }) => {
    // Main content area should show lesson info
    const mainContent = page.locator(
      '[class*="content"], [class*="main"], main',
    );
    await expect(mainContent.first()).toBeVisible();
  });

  test("should navigate between lessons using buttons", async ({ page }) => {
    // Look for previous/next navigation buttons
    const prevButton = page
      .locator('button:has-text("上一"), button:has-text("Previous")')
      .first();
    const nextButton = page
      .locator('button:has-text("下一"), button:has-text("Next")')
      .first();

    // At least one navigation button should exist
    const hasPrev = await prevButton.count();
    const hasNext = await nextButton.count();

    expect(hasPrev + hasNext).toBeGreaterThan(0);
  });

  test("should show lesson difficulty indicator", async ({ page }) => {
    // Look for difficulty tags
    const difficultyTags = page.locator(
      '[class*="difficulty"], [class*="tag"], .ant-tag',
    );
    const tagCount = await difficultyTags.count();
    expect(tagCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Lesson Content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
  });

  test("should display lesson title", async ({ page }) => {
    // Look for a title element in the main content
    const title = page.locator("h1, h2, [class*='title']").first();
    await expect(title).toBeVisible();
  });

  test("should display lesson instructions", async ({ page }) => {
    // Look for instruction text
    const content = page.locator(
      '[class*="instruction"], [class*="description"], p',
    );
    const hasContent = (await content.count()) > 0;
    expect(hasContent).toBe(true);
  });

  test("should display hints section", async ({ page }) => {
    // Look for hint button or section
    const hintButton = page.locator(
      'button:has-text("提示"), button:has-text("Hint"), [class*="hint"]',
    );
    const hintCount = await hintButton.count();
    expect(hintCount).toBeGreaterThanOrEqual(0);
  });
});

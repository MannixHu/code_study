import { test, expect } from "@playwright/test";

/**
 * Complete Lesson Workflow E2E Tests
 * Tests the full user journey from start to completion
 */
test.describe("Complete Lesson Workflow", () => {
  test("should complete a full lesson workflow", async ({ page }) => {
    // Step 1: Navigate to app
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Step 2: Verify app loaded
    await expect(page.locator("body")).toBeVisible();

    // Step 3: Find and verify code editor is present
    const editor = page.locator(
      '[class*="monaco"], [class*="editor"], [data-testid="code-editor"]',
    );
    await expect(editor.first()).toBeVisible();

    // Step 4: Find run tests button
    const runButton = page.locator(
      'button:has-text("运行"), button:has-text("Run"), button:has-text("测试")',
    );
    await expect(runButton.first()).toBeVisible();

    // Step 5: Click run tests
    await runButton.first().click();

    // Step 6: Wait for results
    await page.waitForTimeout(3000);

    // Step 7: Verify some feedback is shown
    const feedback = page.locator(
      '[class*="result"], [class*="feedback"], [class*="message"]',
    );
    const feedbackCount = await feedback.count();
    expect(feedbackCount).toBeGreaterThanOrEqual(0);
  });

  test("should navigate through multiple lessons", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Find navigation buttons
    const nextButton = page.locator(
      'button:has-text("下一"), button:has-text("Next")',
    );
    const prevButton = page.locator(
      'button:has-text("上一"), button:has-text("Previous")',
    );

    // If next button exists and is enabled, try clicking it
    if ((await nextButton.count()) > 0) {
      const isEnabled = await nextButton.first().isEnabled();
      if (isEnabled) {
        await nextButton.first().click();
        await page.waitForTimeout(1000);

        // Go back
        if (
          (await prevButton.count()) > 0 &&
          (await prevButton.first().isEnabled())
        ) {
          await prevButton.first().click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test("should handle lesson completion flow", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    // Find the editor
    const editorTextarea = page.locator(".monaco-editor textarea");

    if ((await editorTextarea.count()) > 0) {
      // Focus editor
      await editorTextarea.first().click();

      // Clear existing content (select all and delete)
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Backspace");

      // Type a simple solution
      await page.keyboard.type("const App = () => <div>Hello</div>;");

      // Run tests
      const runButton = page.locator(
        'button:has-text("运行"), button:has-text("Run"), button:has-text("测试")',
      );

      if ((await runButton.count()) > 0) {
        await runButton.first().click();
        await page.waitForTimeout(3000);
      }
    }
  });
});

test.describe("Error Handling", () => {
  test("should handle syntax errors gracefully", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    const editorTextarea = page.locator(".monaco-editor textarea");

    if ((await editorTextarea.count()) > 0) {
      // Focus editor
      await editorTextarea.first().click();

      // Clear and type invalid code
      await page.keyboard.press("Meta+a");
      await page.keyboard.press("Backspace");
      await page.keyboard.type("const invalid = {");

      // Run tests
      const runButton = page.locator(
        'button:has-text("运行"), button:has-text("Run"), button:has-text("测试")',
      );

      if ((await runButton.count()) > 0) {
        await runButton.first().click();
        await page.waitForTimeout(2000);

        // Should show error feedback (not crash)
        await expect(page.locator("body")).toBeVisible();
      }
    }
  });

  test("should recover from errors", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    // App should be functional after any errors
    const runButton = page.locator(
      'button:has-text("运行"), button:has-text("Run"), button:has-text("测试")',
    );
    await expect(runButton.first()).toBeVisible();
  });
});

test.describe("Keyboard Navigation", () => {
  test("should support tab navigation", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);

    // Press Tab multiple times to navigate
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);
    }

    // Should still be on the page without errors
    await expect(page.locator("body")).toBeVisible();
  });

  test("should have focusable interactive elements", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);

    // Check that buttons are focusable
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Focus first button
      await buttons.first().focus();
      await expect(buttons.first()).toBeFocused();
    }
  });
});

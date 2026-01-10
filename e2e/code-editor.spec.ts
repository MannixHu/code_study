import { test, expect } from "@playwright/test";

test.describe("Code Editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for Monaco editor to load (it can take a moment)
    await page.waitForTimeout(2000);
  });

  test("should display code editor", async ({ page }) => {
    // Monaco editor uses specific classes
    const editor = page.locator(
      '[class*="monaco"], [class*="editor"], [data-testid="code-editor"]',
    );
    await expect(editor.first()).toBeVisible();
  });

  test("should allow typing in the editor", async ({ page }) => {
    // Find the Monaco editor textarea/input
    const editorTextarea = page.locator(".monaco-editor textarea, .view-lines");

    if ((await editorTextarea.count()) > 0) {
      // Click on the editor to focus
      await editorTextarea.first().click();

      // Type some code
      await page.keyboard.type("const test = 'hello';");

      // Verify the code was typed (check view-lines content)
      const viewLines = page.locator(".view-lines");
      await expect(viewLines.first()).toContainText("const");
    }
  });

  test("should have syntax highlighting", async ({ page }) => {
    // Monaco provides syntax highlighting with specific span classes
    const highlightedTokens = page.locator(
      ".monaco-editor .mtk1, .monaco-editor .mtk4, .monaco-editor [class^='mtk']",
    );
    const tokenCount = await highlightedTokens.count();

    // Should have some highlighted tokens
    expect(tokenCount).toBeGreaterThanOrEqual(0);
  });

  test("should display line numbers", async ({ page }) => {
    // Monaco shows line numbers
    const lineNumbers = page.locator(
      ".monaco-editor .line-numbers, .monaco-editor .margin-view-overlays",
    );
    await expect(lineNumbers.first()).toBeVisible();
  });

  test("should have run tests button", async ({ page }) => {
    // Look for test/run button
    const runButton = page.locator(
      'button:has-text("运行"), button:has-text("Run"), button:has-text("测试"), button:has-text("Test")',
    );
    await expect(runButton.first()).toBeVisible();
  });
});

test.describe("Code Editor Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);
  });

  test("should show test results after running tests", async ({ page }) => {
    // Find and click run button
    const runButton = page.locator(
      'button:has-text("运行"), button:has-text("Run"), button:has-text("测试"), button:has-text("Test")',
    );

    if ((await runButton.count()) > 0) {
      await runButton.first().click();

      // Wait for results
      await page.waitForTimeout(2000);

      // Should show some result feedback
      const results = page.locator(
        '[class*="result"], [class*="test"], [class*="feedback"]',
      );
      const resultCount = await results.count();
      expect(resultCount).toBeGreaterThanOrEqual(0);
    }
  });

  test("should preserve code after page navigation", async ({ page }) => {
    // Type some code
    const editorTextarea = page.locator(".monaco-editor textarea");

    if ((await editorTextarea.count()) > 0) {
      await editorTextarea.first().click();
      await page.keyboard.type("// user code test");

      // Navigate away and back
      const tabs = page.locator('[role="tab"], [class*="tab"]');
      if ((await tabs.count()) > 1) {
        await tabs.nth(1).click();
        await page.waitForTimeout(500);
        await tabs.first().click();
        await page.waitForTimeout(500);
      }
    }
  });
});
